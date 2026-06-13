import { interpretSymptoms } from "@/lib/ai";
import { getCategories, listPractitioners } from "@/lib/queries";
import type { PractitionerWithTrust } from "@/lib/queries";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { query } = await request.json().catch(() => ({ query: "" }));

  if (typeof query !== "string" || query.trim().length < 3) {
    return Response.json(
      { error: "Tell us a little about what you're going through." },
      { status: 400 },
    );
  }

  const cats = await getCategories();
  const match = await interpretSymptoms(query.trim(), cats);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));

  // Union practitioners across the matched topics, keep best trust, dedupe.
  const seen = new Map<number, PractitionerWithTrust>();
  for (const slug of match.matchedCategories) {
    const list = await listPractitioners({ category: slug });
    for (const p of list) if (!seen.has(p.id)) seen.set(p.id, p);
  }
  const practitioners = [...seen.values()]
    .sort((a, b) => b.trust.score - a.trust.score)
    .slice(0, 6);

  return Response.json({
    empathy: match.empathy,
    safetyNote: match.safetyNote,
    matchedCategories: match.matchedCategories.map((s) => catMap[s]).filter(Boolean),
    practitioners,
  });
}
