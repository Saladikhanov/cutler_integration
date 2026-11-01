import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { tagsForDocument } from "@/lib/sanity/revalidate-tags";

// Sanity calls this when a document is published (contracts/revalidation-webhook.md).
// It changes cache state only and returns no content.
type Body = { _type?: string; slug?: string | null };

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  // parseBody skips signature validation when no secret is given, so refuse instead.
  if (!secret) return Response.json({ message: "Invalid signature" }, { status: 401 });

  let isValidSignature: boolean | null;
  let body: Body | null;
  try {
    ({ isValidSignature, body } = await parseBody<Body>(request, secret));
  } catch {
    return Response.json({ message: "Bad request" }, { status: 400 });
  }

  if (!isValidSignature) return Response.json({ message: "Invalid signature" }, { status: 401 });
  if (!body || typeof body !== "object")
    return Response.json({ message: "Bad request" }, { status: 400 });

  const tags = tagsForDocument(body);
  if (tags.length === 0) return Response.json({ revalidated: false });

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true, tags });
}

export function GET() {
  return new Response(null, { status: 405 });
}
