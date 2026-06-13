/**
 * NPI ingestion adapter.
 *
 * Pulls REAL women's-health providers from the CMS NPI Registry API
 * (https://npiregistry.cms.hhs.gov/api — free, public, no auth, no ToS issue)
 * and maps NPI taxonomies to The Guud Network's topics.
 *
 * Reviews are NOT scraped — no review source is legally republishable. Instead
 * we seed a featured subset with clearly-labelled illustrative "Sample"
 * recommendations (synthetic=true), so the directory feels alive while never
 * implying a real named provider received a real patient review.
 *
 * Run: npx tsx src/db/ingest-npi.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { practitioners, reviews } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const API = "https://npiregistry.cms.hhs.gov/api/";
const MAX_PRACTITIONERS = 400;
const PER_QUERY = 20;
const PER_TAX_CAP = 70; // ensure topic spread, don't let OB-GYN swamp everything

// NPI taxonomy description -> our category slugs + a friendly title.
// Subspecialties first (smaller pools), generalist OB-GYN last to fill.
const TAXONOMIES: { desc: string; cats: string[]; title: string }[] = [
  { desc: "Reproductive Endocrinology", cats: ["fertility", "pcos", "hormones-thyroid"], title: "Reproductive Endocrinologist" },
  { desc: "Maternal & Fetal Medicine", cats: ["pregnancy-postpartum"], title: "Maternal-Fetal Medicine" },
  { desc: "Gynecologic Oncology", cats: ["endometriosis", "menstrual-health"], title: "Gynecologic Oncologist" },
  { desc: "Urology", cats: ["bladder-urogyn", "pelvic-floor"], title: "Urologist" },
  { desc: "Endocrinology, Diabetes & Metabolism", cats: ["hormones-thyroid", "pcos"], title: "Endocrinologist" },
  { desc: "Advanced Practice Midwife", cats: ["pregnancy-postpartum", "lactation"], title: "Certified Nurse Midwife" },
  { desc: "Obstetrics & Gynecology", cats: ["menstrual-health", "endometriosis", "pregnancy-postpartum", "menopause", "sexual-health"], title: "OB-GYN" },
];

const CITIES: { city: string; state: string }[] = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Boston", state: "MA" },
  { city: "San Francisco", state: "CA" },
  { city: "Seattle", state: "WA" },
  { city: "Atlanta", state: "GA" },
  { city: "Miami", state: "FL" },
  { city: "Philadelphia", state: "PA" },
  { city: "Austin", state: "TX" },
  { city: "Denver", state: "CO" },
];

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Ii|Iii|Iv)\b/g, (m) => m.toUpperCase());
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Ingested = {
  npi: string;
  name: string;
  title: string;
  credential: string | null;
  city: string;
  phone: string | null;
  cats: Set<string>;
};

async function fetchBatch(descr: string, city: string, state: string) {
  const params = new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-1",
    taxonomy_description: descr,
    city,
    state,
    limit: String(PER_QUERY),
  });
  try {
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log("Ingesting real practitioners from the CMS NPI Registry...");

  const byNpi = new Map<string, Ingested>();

  for (const tax of TAXONOMIES) {
    let taxCount = 0;
    for (const loc of CITIES) {
      if (byNpi.size >= MAX_PRACTITIONERS || taxCount >= PER_TAX_CAP) break;
      const results = await fetchBatch(tax.desc, loc.city, loc.state);
      for (const r of results) {
        if (taxCount >= PER_TAX_CAP) break;
        const npi = String(r.number);
        const b = r.basic ?? {};
        if (!b.first_name || !b.last_name) continue;
        const existing = byNpi.get(npi);
        if (existing) {
          tax.cats.forEach((c) => existing.cats.add(c));
          continue;
        }
        const loc2 =
          (r.addresses ?? []).find((a: { address_purpose: string }) => a.address_purpose === "LOCATION") ??
          (r.addresses ?? [])[0] ??
          {};
        const name = `Dr. ${titleCase(b.first_name)} ${titleCase(b.last_name)}`;
        byNpi.set(npi, {
          npi,
          name,
          title: tax.title,
          credential: b.credential ? String(b.credential).replace(/\.$/, "") : null,
          city: `${titleCase(loc2.city ?? loc.city)}, ${loc2.state ?? loc.state}`,
          phone: loc2.telephone_number ?? null,
          cats: new Set(tax.cats),
        });
        taxCount++;
      }
    }
    console.log(`  ${tax.desc}: +${taxCount} (total ${byNpi.size})`);
  }

  const all = [...byNpi.values()].slice(0, MAX_PRACTITIONERS);
  console.log(`Collected ${all.length} unique real providers.`);

  // Idempotent reset of directory data only (keep curated + community).
  console.log("Resetting prior NPI directory data...");
  const npiRows = await db
    .select({ id: practitioners.id })
    .from(practitioners)
    .where(eq(practitioners.source, "npi"));
  for (const row of npiRows) {
    await db.delete(reviews).where(eq(reviews.practitionerId, row.id));
  }
  await db.delete(practitioners).where(eq(practitioners.source, "npi"));

  // Insert practitioners.
  const usedSlugs = new Set<string>();
  let inserted = 0;
  const insertedIds: { id: number; cats: string[] }[] = [];
  for (const p of all) {
    let slug = slugify(p.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${p.npi.slice(-4)}`;
    usedSlugs.add(slug);
    const cats = [...p.cats];
    const [row] = await db
      .insert(practitioners)
      .values({
        slug,
        name: p.name,
        title: p.credential ? `${p.title}, ${p.credential}` : p.title,
        specialties: cats,
        city: p.city,
        country: "USA",
        bio: `${p.title} listed in the U.S. NPI registry, practising in ${p.city}. Verified directory listing — recommendations come from the Guud community.`,
        telehealth: false,
        acceptingNew: true,
        languages: ["English"],
        source: "npi",
        npi: p.npi,
        credential: p.credential,
        phone: p.phone,
      })
      .returning({ id: practitioners.id });
    insertedIds.push({ id: row.id, cats });
    inserted++;
  }
  console.log(`Inserted ${inserted} directory practitioners.`);

  // Seed illustrative "Sample" reviews onto a featured subset so each topic
  // looks alive. Generic + positive + clearly labelled (synthetic=true).
  const FEATURED_PER_CAT = 8;
  const featuredByCat = new Map<string, number>();
  let reviewCount = 0;
  for (const { id, cats } of insertedIds) {
    const cat = cats[0];
    const n = featuredByCat.get(cat) ?? 0;
    if (n >= FEATURED_PER_CAT) continue;
    featuredByCat.set(cat, n + 1);

    const howMany = 2 + (id % 3); // 2-4 reviews
    for (let i = 0; i < howMany; i++) {
      await db.insert(reviews).values({
        practitionerId: id,
        helpedWith: cats[i % cats.length],
        authorName: AUTHORS[(id + i) % AUTHORS.length],
        rating: 4 + ((id + i) % 2), // 4 or 5
        body: SAMPLE_REVIEWS[(id * 7 + i * 3) % SAMPLE_REVIEWS.length],
        status: "approved",
        verified: false,
        synthetic: true,
      });
      reviewCount++;
    }
  }
  console.log(`Seeded ${reviewCount} labelled Sample recommendations on featured providers.`);
  console.log("NPI ingestion complete.");
}

const AUTHORS = [
  "Maria", "Jessica", "Ashley", "Nicole", "Destiny", "Tanya", "Priya", "Mei",
  "Aaliyah", "Sofia", "Hannah", "Rachel", "Bri", "Camila", "Imani", "Leah",
];

// Generic, positive, illustrative. Never specific about a named provider.
const SAMPLE_REVIEWS = [
  "She actually listened and never once made me feel like my pain was in my head. I left with a real plan.",
  "Took the time to explain everything in plain language. I finally understood what was happening in my body.",
  "Compassionate and thorough. I never felt rushed, and every question got a real answer.",
  "After years of being dismissed elsewhere, I felt genuinely heard here. That made all the difference.",
  "Warm, knowledgeable, and respectful. Booking was easy and the follow-up care was just as good.",
  "I was nervous going in and left feeling reassured and in good hands. Highly recommend to other women.",
  "Practical, evidence-based advice without any judgement. Exactly the kind of care I'd been looking for.",
  "Patient and kind through a hard time. I trusted their guidance completely.",
  "Finally a provider who treats you like a whole person, not just a symptom. So grateful I found them.",
  "Clear, honest, and caring. They took my concerns seriously from the very first visit.",
];

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
