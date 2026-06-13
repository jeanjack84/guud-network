"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { practitioners, reviews } from "@/db/schema";
import { moderateReview } from "@/lib/ai";
import { getCategories } from "@/lib/queries";
import { eq } from "drizzle-orm";

export type ActionState = {
  ok: boolean;
  status?: "approved" | "pending";
  message: string;
  slug?: string;
};

function slugify(s: string) {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

function clampRating(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 5;
}

/** Add a recommendation (review) to an existing practitioner. */
export async function submitReview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const practitionerId = Number(formData.get("practitionerId"));
  const helpedWith = String(formData.get("helpedWith") ?? "");
  const authorName = String(formData.get("authorName") ?? "").trim() || "Anonymous";
  const body = String(formData.get("body") ?? "").trim();
  const rating = clampRating(formData.get("rating"));

  if (!practitionerId || body.length < 15) {
    return { ok: false, message: "Please share at least a sentence or two." };
  }

  const mod = await moderateReview(body);
  const status = mod.allow ? "approved" : "pending";

  await db.insert(reviews).values({
    practitionerId,
    helpedWith,
    authorName,
    rating,
    body,
    status,
  });

  const rows = await db
    .select({ slug: practitioners.slug })
    .from(practitioners)
    .where(eq(practitioners.id, practitionerId))
    .limit(1);
  if (rows[0]) revalidatePath(`/practitioners/${rows[0].slug}`);
  revalidatePath("/");

  return {
    ok: true,
    status,
    message: mod.allow
      ? "Thank you. Your recommendation is live and will help other women."
      : "Thank you. Your note is in review to keep this a safe, positive space.",
  };
}

/** Recommend a brand-new practitioner with your first review. */
export async function recommendPractitioner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const authorName =
    String(formData.get("authorName") ?? "").trim() || "Anonymous";
  const body = String(formData.get("body") ?? "").trim();
  const rating = clampRating(formData.get("rating"));
  const telehealth = formData.get("telehealth") === "on";

  if (!name || !title || !city || !country || !topic) {
    return { ok: false, message: "Please fill in all the practitioner details." };
  }
  if (body.length < 15) {
    return { ok: false, message: "Please share a sentence or two about why you recommend them." };
  }

  const cats = await getCategories();
  if (!cats.some((c) => c.slug === topic)) {
    return { ok: false, message: "Please choose a valid topic." };
  }

  const mod = await moderateReview(body);
  const status = mod.allow ? "approved" : "pending";
  const slug = slugify(name);

  const [created] = await db
    .insert(practitioners)
    .values({
      slug,
      name,
      title,
      specialties: [topic],
      city,
      country,
      bio: `Recommended by the Guud community for ${
        cats.find((c) => c.slug === topic)?.name ?? "women's health"
      }.`,
      telehealth,
      acceptingNew: true,
      languages: ["English"],
    })
    .returning({ id: practitioners.id, slug: practitioners.slug });

  await db.insert(reviews).values({
    practitionerId: created.id,
    helpedWith: topic,
    authorName,
    rating,
    body,
    status,
  });

  revalidatePath("/");
  revalidatePath("/discover");

  return {
    ok: true,
    status,
    slug: created.slug,
    message: mod.allow
      ? "Thank you for growing the network. They're now live for other women to find."
      : "Thank you. Your recommendation is in review to keep this a safe, positive space.",
  };
}
