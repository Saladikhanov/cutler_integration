// Pure comparison of what the Studio holds with what EasyWeek shows. No network here, so it can be unit tested.
// A finding is { level: "problem" | "note", text }. "problem" fails the check; "note" is only reported.

const norm = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");

/** "1 година 30 хвилин", "1 год. 30 хв.", "45 хвилин", "1 год" -> minutes (null when unreadable). */
export function parseDurationMinutes(text) {
  const hours = /(\d+)\s*год/i.exec(text ?? "");
  const minutes = /(\d+)\s*хв/i.exec(text ?? "");
  if (!hours && !minutes) return null;
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

/** "1 400,00 ₴" -> 1400 */
export function parsePrice(text) {
  const match = /([\d\s  ]+)(?:[.,]\d+)?\s*₴/.exec(text ?? "");
  return match ? Number(match[1].replace(/[\s  ]/g, "")) : null;
}

/**
 * Barbers: the Studio's ids against EasyWeek's team, and whether each barber has services at the branch.
 * studioBarbers: [{ slug, name, easyweekUserId }]; team: [{ id, name }]; servicesCount: { [id]: number | null }
 */
export function compareBarbers(studioBarbers, team, servicesCount) {
  const findings = [];
  const teamById = new Map(team.map((member) => [String(member.id), member]));
  const used = new Set();

  for (const barber of studioBarbers) {
    const id = barber.easyweekUserId ? String(barber.easyweekUserId) : null;
    if (!id) {
      findings.push({
        level: "note",
        text: `${barber.name}: no EasyWeek id in the Studio, so their Book button opens the branch.`,
      });
      continue;
    }
    used.add(id);
    if (!teamById.has(id)) {
      findings.push({
        level: "problem",
        text: `${barber.name}: Studio id ${id} is not in EasyWeek's team any more.`,
      });
      continue;
    }
    if (servicesCount[id] === 0) {
      findings.push({
        level: "problem",
        text: `${barber.name} (${id}): the id is set, but EasyWeek shows no services for them at the branch, so their page would open empty.`,
      });
    } else if (servicesCount[id] == null) {
      findings.push({
        level: "note",
        text: `${barber.name} (${id}): could not read their services from the widget.`,
      });
    }
  }

  for (const member of team) {
    if (used.has(String(member.id))) continue;
    const n = servicesCount[String(member.id)];
    findings.push({
      level: "note",
      text:
        n > 0
          ? `${member.name} (${member.id}) is bookable at the branch in EasyWeek but has no id in the Studio: add the id to enable their direct booking.`
          : `${member.name} (${member.id}) is in EasyWeek's team but has no id in the Studio${n === 0 ? " (and no services at the branch)" : ""}.`,
    });
  }
  return findings;
}

/**
 * Services: the Studio's services against the branch's list in the widget, by name.
 * studioServices: [{ name, price, durationMinutes }]; shown: [{ name, price, durationMinutes }]
 */
export function compareServices(studioServices, shown) {
  const findings = [];
  const shownByName = new Map(shown.map((service) => [norm(service.name), service]));
  const matched = new Set();

  for (const service of studioServices) {
    const key = norm(service.name);
    const live = shownByName.get(key);
    if (!live) {
      findings.push({
        level: "problem",
        text: `Service "${service.name}" is in the Studio but not in EasyWeek's branch list.`,
      });
      continue;
    }
    matched.add(key);
    if (service.price != null && live.price != null && service.price !== live.price) {
      findings.push({
        level: "problem",
        text: `"${service.name}": Studio price ${service.price} but EasyWeek shows ${live.price}.`,
      });
    }
    if (
      service.durationMinutes != null &&
      live.durationMinutes != null &&
      service.durationMinutes !== live.durationMinutes
    ) {
      findings.push({
        level: "problem",
        text: `"${service.name}": Studio duration ${service.durationMinutes} min but EasyWeek shows ${live.durationMinutes} min.`,
      });
    }
  }
  for (const live of shown) {
    if (!matched.has(norm(live.name))) {
      findings.push({
        level: "note",
        text: `EasyWeek's branch list has "${live.name}" (${live.price} ₴), which is not in the Studio.`,
      });
    }
  }
  return findings;
}
