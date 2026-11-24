// Compares what the Studio holds (barbers, EasyWeek ids, services, prices, durations) with what EasyWeek shows
// for the Dnipro branch, and reports drift. It never changes EasyWeek.
//
//   npm run check:easyweek
//
// It also works out which barbers EasyWeek lets visitors book (the "Choose a barber" list, ignoring free time) and,
// when SANITY_AVAILABILITY_TOKEN is set, saves that to the Studio's "Barber availability" document, which the site
// reads to hide barbers who cannot be booked. Without the token it only reports (a dry run).
//
// It reads the public company page (the team and their ids) and drives the real booking widget in a browser, the
// way a visitor does. It never calls EasyWeek's data endpoints directly: those answer only to its own pages.
// See docs/easyweek-check.md for when to run it.
import { appendFileSync, existsSync } from "node:fs";
import http from "node:http";
import vm from "node:vm";
import { chromium } from "@playwright/test";
import {
  compareBarbers,
  compareServices,
  parseDurationMinutes,
  parsePrice,
} from "./lib/easyweek-compare.mjs";
import { parseNextFree, planAvailability } from "./lib/availability.mjs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const COMPANY_PAGE = process.env.EASYWEEK_COMPANY_PAGE ?? "https://cutler.easyweek.com.ua/";
const WIDGET_URL =
  process.env.NEXT_PUBLIC_EASYWEEK_WIDGET_URL ?? "https://booking.easyweek.com.ua/cutler";
const USER_AGENT = "cutler-site-check/1.0 (daily consistency check of the CUTLER website)";
const WRITE_TOKEN = process.env.SANITY_AVAILABILITY_TOKEN;

if (!PROJECT) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID (see .env.example) or run from the project folder with .env.local.",
  );
  process.exit(2);
}

async function studio() {
  const query = `{
    "branchId": *[_id == "shopDetails"][0].easyweekBranchId,
    "barbers": *[_type == "barber"] | order(order asc) { "slug": slug.current, "name": coalesce(name.en, name.uk), easyweekUserId },
    "services": *[_type == "service"] | order(order asc) { "name": name.uk, price, durationMinutes },
    "availability": *[_id == "barberAvailability"][0]{ checkedAt, entries[]{ userId, misses, visible } }
  }`;
  const url = `https://${PROJECT}.api.sanity.io/v2026-01-01/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sanity answered ${response.status}`);
  return (await response.json()).result;
}

async function team() {
  const response = await fetch(COMPANY_PAGE, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`The company page answered ${response.status}`);
  const html = await response.text();
  const match = html.match(/<script>window\.__NUXT__=([\s\S]*?)<\/script>/);
  if (!match)
    throw new Error(
      "The team data was not found on the company page (its layout may have changed).",
    );
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(`window.__NUXT__=${match[1]}`, sandbox, { timeout: 5000 });
  const users = sandbox.window.__NUXT__?.state?.company?.users;
  if (!Array.isArray(users))
    throw new Error("The team list was not found in the company page data.");
  return users.map((user) => ({ id: user.id, name: user.name }));
}

// A page that only loads the widget script, served locally, so no deployed site is needed.
function hostPage() {
  const server = http.createServer((_request, response) => {
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.end(
      '<!doctype html><title>check</title><script src="https://booking.easyweek.com.ua/widget.js"></script>',
    );
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function once(read) {
  // The widget script sometimes loads slowly; one more try before giving up.
  return (await read()) ?? (await read());
}

/** Opens the widget with `open` (a script run in the page) and reads the services listed in the frame. */
async function readServices(browser, host, open) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  try {
    await page.goto(host);
    await page.waitForFunction(() => window.EasyWeekWidget, null, { timeout: 20000 });
    await page.evaluate(open);
    const frame = await (async () => {
      for (let i = 0; i < 40; i++) {
        const found = page
          .frames()
          .filter((f) => f.url().includes("booking.easyweek.com.ua"))
          .at(-1);
        if (found) return found;
        await page.waitForTimeout(500);
      }
      return null;
    })();
    if (!frame) return null;
    // The footer "Працює на" shows once the page has loaded, with or without services.
    await frame.waitForFunction(() => document.body?.innerText.includes("Працює на"), null, {
      timeout: 25000,
    });
    await page.waitForTimeout(800);
    const rows = await frame.evaluate(() =>
      [...document.querySelectorAll("button")]
        .map((button) => button.innerText.replace(/\s+/g, " ").trim())
        .filter((text) => text.includes("₴")),
    );
    return rows.map((text) => {
      const [head, tail = ""] = text.split("•");
      return {
        name: (/^(.*?)\s+[\d\s ]+(?:,\d+)?\s*₴/.exec(head)?.[1] ?? head).trim(),
        price: parsePrice(head),
        durationMinutes: parseDurationMinutes(tail),
      };
    });
  } catch (error) {
    console.error(`  (could not read the widget: ${error.message.split("\n")[0]})`);
    return null;
  } finally {
    await page.close();
  }
}

/**
 * Opens the branch, picks the service at `index`, presses "Далі" and returns the ids in the "Choose a barber" list.
 * A barber with no free time still shows there ("Доступно з <date>"); someone who is not bookable does not.
 */
async function readBarberIds(browser, host, index) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  try {
    await page.goto(host);
    await page.waitForFunction(() => window.EasyWeekWidget, null, { timeout: 20000 });
    await page.evaluate(widgetScript(`w.setBranch(${JSON.stringify(String(branchIdForLists))})`));
    const frame = await (async () => {
      for (let i = 0; i < 40; i++) {
        const found = page
          .frames()
          .filter((f) => f.url().includes("booking.easyweek.com.ua"))
          .at(-1);
        if (found) return found;
        await page.waitForTimeout(500);
      }
      return null;
    })();
    if (!frame) return null;
    await frame.waitForFunction(() => document.body?.innerText.includes("Працює на"), null, {
      timeout: 25000,
    });
    await page.waitForTimeout(800);
    const picked = await frame.evaluate((n) => {
      const rows = [...document.querySelectorAll("button")].filter((b) =>
        b.innerText.includes("₴"),
      );
      rows[n]?.click();
      return Boolean(rows[n]);
    }, index);
    if (!picked) return null;
    await page.waitForTimeout(1200);
    const pressed = await frame.evaluate(() => {
      const next = [...document.querySelectorAll("button, a")].find(
        (b) => b.innerText.trim() === "Далі",
      );
      next?.click();
      return Boolean(next);
    });
    if (!pressed) return null;
    await frame.waitForFunction(() => location.pathname.endsWith("/users"), null, {
      timeout: 25000,
    });
    await page.waitForTimeout(1500);
    const found = await frame.evaluate(() =>
      [...document.querySelectorAll("button[data-test^='user_']")].map((b) => ({
        id: b.getAttribute("data-test").slice("user_".length),
        text: b.innerText.replace(/\s+/g, " "),
      })),
    );
    return found.map(({ id, text }) => ({ id, nextFree: parseNextFree(text) }));
  } catch (error) {
    console.error(`  (could not read the barber list: ${error.message.split("\n")[0]})`);
    return null;
  } finally {
    await page.close();
  }
}

const widgetScript = (call) =>
  `(() => { const w = new window.EasyWeekWidget({ url: ${JSON.stringify(`${WIDGET_URL}?lang=uk&ref=site-check`)} }); ${call}; })()`;

const data = await studio();
if (!data.branchId) {
  console.error("No EasyWeek branch id in the Studio's shop details.");
  process.exit(2);
}
const eaTeam = await team();
console.log(
  `Studio: ${data.barbers.length} barbers, ${data.services.length} services, branch ${data.branchId}`,
);
console.log(`EasyWeek team on the public page: ${eaTeam.length} people\n`);

const server = await hostPage();
const host = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const servicesCount = {};
const listedIds = new Set();
const nextFreeById = new Map();
let listsRead = 0;
let listsTotal = 0;
let branchServices = null;
const branchIdForLists = data.branchId;
try {
  console.log("Reading the branch's services from the widget ...");
  branchServices = await readServices(
    browser,
    host,
    widgetScript(`w.setBranch(${JSON.stringify(String(data.branchId))})`),
  );
  listsTotal = branchServices?.length ?? 0;
  for (let i = 0; i < listsTotal; i++) {
    console.log(`Reading the barber list for "${branchServices[i].name}" ...`);
    const found = await once(() => readBarberIds(browser, host, i));
    if (!found) continue;
    listsRead += 1;
    for (const { id, nextFree } of found) {
      listedIds.add(id);
      const earlier = nextFreeById.get(id);
      if (nextFree && (!earlier || nextFree < earlier)) nextFreeById.set(id, nextFree);
    }
  }
  const ids = new Set([
    ...data.barbers.map((b) => b.easyweekUserId).filter(Boolean),
    ...eaTeam.map((m) => String(m.id)),
  ]);
  for (const id of ids) {
    const person = eaTeam.find((m) => String(m.id) === id)?.name ?? id;
    console.log(`Reading services for ${person} (${id}) ...`);
    const rows = await once(() =>
      readServices(
        browser,
        host,
        widgetScript(`w.setUser(${JSON.stringify(id)}, ${JSON.stringify(String(data.branchId))})`),
      ),
    );
    servicesCount[id] = rows ? rows.length : null;
  }
} finally {
  await browser.close();
  server.close();
}

const findings = [
  ...compareBarbers(data.barbers, eaTeam, servicesCount),
  ...(branchServices
    ? compareServices(data.services, branchServices)
    : [
        {
          level: "note",
          text: "Could not read the branch's services from the widget, so prices and durations were not compared.",
        },
      ]),
];
const problems = findings.filter((f) => f.level === "problem");
const notes = findings.filter((f) => f.level === "note");

const plan = planAvailability({
  studioIds: data.barbers.map((b) => b.easyweekUserId).filter(Boolean),
  previous: data.availability,
  listedIds,
  nextFreeById,
  listsRead,
  listsTotal,
});
const nameOf = (id) =>
  data.barbers.find((b) => String(b.easyweekUserId) === String(id))?.name ?? String(id);
const availabilityLines = [];
let availabilityFailed = false;
if (plan.status === "unreadable") {
  availabilityFailed = true;
  availabilityLines.push(
    `- PROBLEM: only ${listsRead} of ${listsTotal} barber lists could be read, so the site's barber status was left as it was.`,
  );
} else if (plan.status === "braked") {
  availabilityFailed = true;
  availabilityLines.push(
    `- PROBLEM: this run would hide ${plan.newlyHidden.map(nameOf).join(", ")}, which looks like a broken check, so nobody was hidden. Look at EasyWeek, then run it again.`,
  );
} else {
  availabilityLines.push(
    `- bookable now: ${plan.entries.filter((e) => e.visible).length} of ${plan.entries.length}; listed as not taking bookings: ${plan.hidden.map(nameOf).join(", ") || "nobody"}${plan.grace.length ? `; missed once, still listed as bookable: ${plan.grace.map(nameOf).join(", ")}` : ""}`,
  );
  const soonest = plan.entries
    .filter((e) => e.nextFree)
    .sort((a, b) => a.nextFree.localeCompare(b.nextFree))
    .map((e) => `${nameOf(e.userId)} ${e.nextFree.replace("T", " ")}`);
  if (soonest.length) availabilityLines.push(`- earliest free time: ${soonest.join("; ")}`);
  if (!WRITE_TOKEN) {
    availabilityLines.push(
      "- dry run: SANITY_AVAILABILITY_TOKEN is not set, so the status was not saved to the Studio.",
    );
  } else {
    const document = {
      _id: "barberAvailability",
      _type: "barberAvailability",
      checkedAt: new Date().toISOString(),
      entries: plan.entries.map((e) => ({ _key: `u${e.userId}`, _type: "entry", ...e })),
    };
    const response = await fetch(
      `https://${PROJECT}.api.sanity.io/v2026-01-01/data/mutate/${DATASET}`,
      {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${WRITE_TOKEN}` },
        body: JSON.stringify({ mutations: [{ createOrReplace: document }] }),
      },
    );
    if (response.ok) {
      availabilityLines.push("- saved the barber status to the Studio.");
    } else {
      availabilityFailed = true;
      availabilityLines.push(
        `- PROBLEM: could not save the barber status (Sanity answered ${response.status}).`,
      );
    }
  }
}

const lines = [
  `## EasyWeek check: ${problems.length === 0 ? "no problems" : `${problems.length} problem(s)`}${notes.length ? `, ${notes.length} note(s)` : ""}`,
  ...problems.map((f) => `- PROBLEM: ${f.text}`),
  ...notes.map((f) => `- note: ${f.text}`),
  "",
  "### Barber availability",
  ...availabilityLines,
];
console.log(`\n${lines.join("\n")}`);
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
process.exit(problems.length === 0 && !availabilityFailed ? 0 : 1);
