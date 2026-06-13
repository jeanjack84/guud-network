import type { MetadataRoute } from "next";
import { db } from "@/db";
import { practitioners, categories } from "@/db/schema";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [prs, cats] = await Promise.all([
    db.select({ slug: practitioners.slug }).from(practitioners),
    db.select({ slug: categories.slug }).from(categories),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/discover`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/practitioners/new`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const topicPages: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${SITE_URL}/discover?topic=${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const practitionerPages: MetadataRoute.Sitemap = prs.map((p) => ({
    url: `${SITE_URL}/practitioners/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...topicPages, ...practitionerPages];
}
