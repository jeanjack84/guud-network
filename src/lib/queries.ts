import { db } from "@/db";
import { categories, practitioners, reviews } from "@/db/schema";
import type { Category, Practitioner, Review } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { trustStats, type TrustStats } from "./trust";

export type PractitionerWithTrust = Practitioner & {
  trust: TrustStats;
  topReview: Review | null;
};

export type PractitionerDetail = Practitioner & {
  trust: TrustStats;
  reviews: Review[];
};

export async function getCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * List practitioners, optionally filtered by a category slug. Each comes with
 * its trust stats and a single standout review for the card.
 */
export async function listPractitioners(opts?: {
  category?: string;
}): Promise<PractitionerWithTrust[]> {
  const all = await db.select().from(practitioners);
  const allReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.status, "approved"));

  const byPractitioner = new Map<number, Review[]>();
  for (const r of allReviews) {
    const list = byPractitioner.get(r.practitionerId) ?? [];
    list.push(r);
    byPractitioner.set(r.practitionerId, list);
  }

  const filtered = opts?.category
    ? all.filter((p) => p.specialties.includes(opts.category!))
    : all;

  const result: PractitionerWithTrust[] = filtered.map((p) => {
    const prReviews = byPractitioner.get(p.id) ?? [];
    // Prefer a review about the filtered category for the card.
    const relevant = opts?.category
      ? prReviews.filter((r) => r.helpedWith === opts.category)
      : prReviews;
    const topReview =
      [...(relevant.length ? relevant : prReviews)].sort(
        (a, b) => b.rating - a.rating || b.body.length - a.body.length,
      )[0] ?? null;
    return { ...p, trust: trustStats(prReviews), topReview };
  });

  return result.sort((a, b) => b.trust.score - a.trust.score);
}

export async function getPractitionerBySlug(
  slug: string,
): Promise<PractitionerDetail | null> {
  const rows = await db
    .select()
    .from(practitioners)
    .where(eq(practitioners.slug, slug))
    .limit(1);
  const p = rows[0];
  if (!p) return null;

  const prReviews = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.practitionerId, p.id), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt));

  return { ...p, trust: trustStats(prReviews), reviews: prReviews };
}

export type NetworkStats = {
  practitioners: number;
  reviews: number;
  categories: number;
  countries: number;
};

export async function getNetworkStats(): Promise<NetworkStats> {
  const [prs, revs, cats] = await Promise.all([
    db.select().from(practitioners),
    db.select().from(reviews).where(eq(reviews.status, "approved")),
    db.select().from(categories),
  ]);
  const countries = new Set(prs.map((p) => p.country));
  return {
    practitioners: prs.length,
    reviews: revs.length,
    categories: cats.length,
    countries: countries.size,
  };
}
