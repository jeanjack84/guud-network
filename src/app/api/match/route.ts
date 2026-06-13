import { interpretSymptoms } from "@/lib/ai";
import { getCategories, listPractitioners } from "@/lib/queries";
import type { PractitionerWithTrust } from "@/lib/queries";

export const maxDuration = 30;

// Loose country synonyms so a free-text location can match practitioner country.
const COUNTRY_SYNONYMS: Record<string, string[]> = {
  USA: ["usa", "us", "united states", "america", "u.s."],
  "United Kingdom": ["uk", "united kingdom", "england", "scotland", "wales", "britain", "london"],
  Netherlands: ["netherlands", "holland", "nl", "amsterdam", "rotterdam", "utrecht", "the hague"],
  Belgium: ["belgium", "brussels", "antwerp"],
  Germany: ["germany", "berlin", "deutschland"],
  Denmark: ["denmark", "copenhagen"],
  Italy: ["italy", "milan", "rome"],
};

/** 3 = city/region hit, 2 = same country, 1 = telehealth, 0 = elsewhere. */
function locationScore(p: PractitionerWithTrust, loc: string): number {
  if (!loc) return 0;
  const q = loc.toLowerCase();
  const cityTokens = p.city.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 2);
  if (cityTokens.some((t) => q.includes(t))) return 3;
  const syn = COUNTRY_SYNONYMS[p.country] ?? [p.country.toLowerCase()];
  if (syn.some((s) => q.includes(s))) return 2;
  return p.telehealth ? 1 : 0;
}

export async function POST(request: Request) {
  const { query, location } = await request
    .json()
    .catch(() => ({ query: "", location: "" }));

  if (typeof query !== "string" || query.trim().length < 3) {
    return Response.json(
      { error: "Tell us a little about what you're going through." },
      { status: 400 },
    );
  }
  const loc = typeof location === "string" ? location.trim() : "";

  const cats = await getCategories();
  const match = await interpretSymptoms(query.trim(), cats);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));

  // Union practitioners across matched topics, dedupe.
  const seen = new Map<number, PractitionerWithTrust>();
  for (const slug of match.matchedCategories) {
    const list = await listPractitioners({ category: slug });
    for (const p of list) if (!seen.has(p.id)) seen.set(p.id, p);
  }

  // Rank local-first when a location is given, then by trust.
  const ranked = [...seen.values()]
    .map((p) => ({ p, loc: locationScore(p, loc) }))
    .sort((a, b) => b.loc - a.loc || b.p.trust.score - a.p.trust.score)
    .map((x) => x.p);

  const practitioners = ranked.slice(0, 6);

  // Honest region note: if a location was given but nothing local surfaced.
  let regionNote: string | null = null;
  if (loc && practitioners.length) {
    const anyLocal = practitioners.some((p) => locationScore(p, loc) >= 2);
    if (!anyLocal) {
      regionNote = `We don't have a practitioner in ${loc} yet. These are elsewhere — telehealth may be limited by licensing across borders. You can also recommend a local practitioner to grow the network.`;
    }
  }

  return Response.json({
    empathy: match.empathy,
    safetyNote: match.safetyNote,
    regionNote,
    location: loc || null,
    matchedCategories: match.matchedCategories.map((s) => catMap[s]).filter(Boolean),
    practitioners,
  });
}
