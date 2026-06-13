import { generateObject, generateText, type LanguageModel } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { Category, Review } from "@/db/schema";

/**
 * Resolve the Opus 4.8 model from whichever credential is available:
 *  - ANTHROPIC_API_KEY  -> direct Anthropic API (Build Day credits)
 *  - otherwise          -> Vercel AI Gateway (auto-auth via OIDC on Vercel)
 */
const MODEL: LanguageModel = process.env.ANTHROPIC_API_KEY
  ? createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })("claude-opus-4-8")
  : "anthropic/claude-opus-4-8";

export type MatchResult = {
  empathy: string;
  matchedCategories: string[];
  safetyNote: string | null;
  detectedLocation: string | null;
};

/**
 * The hero feature. A woman describes, in her own words, what she's going
 * through. Opus interprets it with empathy, maps it to the right women's-health
 * topics, and flags anything that needs urgent in-person care.
 */
export async function interpretSymptoms(
  query: string,
  cats: Category[],
): Promise<MatchResult> {
  const catList = cats
    .map((c) => `- ${c.slug}: ${c.name} — ${c.description}`)
    .join("\n");

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: z.object({
        empathy: z
          .string()
          .describe(
            "1-2 warm, validating sentences acknowledging what she's going through. Never clinical or dismissive. Address her directly.",
          ),
        matchedCategories: z
          .array(z.string())
          .describe(
            "Slugs of the 1-3 most relevant topics from the provided list, most relevant first. Return an EMPTY array if the message is not a women's-health concern (gibberish, a test, or an unrelated topic) — do not force a match.",
          ),
        safetyNote: z
          .string()
          .nullable()
          .describe(
            "If she describes a possible emergency (e.g. heavy bleeding with fainting, severe sudden pain, thoughts of self-harm), a brief note to seek urgent/emergency care. Otherwise null.",
          ),
        detectedLocation: z
          .string()
          .nullable()
          .describe(
            "Any place the person mentions they are or want care (city/region/country), normalised like 'Chicago, IL, USA', 'rural Montana, USA', or 'London, UK'. null if none mentioned.",
          ),
      }),
      system:
        "You are the triage heart of The Guud Network, a trust-first platform helping people find women's-health practitioners others recommend. You are warm, validating, and never dismissive of pain. You only choose topic slugs from the list given. You are NOT a doctor: never diagnose, and never give clinical verdicts about what is normal, abnormal, safe, or not worrying (e.g. do not say 'that's completely normal' or 'nothing to worry about'). Validate feelings and route to the right kind of help only. Honour the person's stated identity and never reduce it. NEVER promise something the network may not have: do not promise free, low-cost, sliding-scale, or insurance-accepted care, a practitioner who speaks a specific language, or one in a specific place — you do not have that data and a broken promise re-enacts the dismissal this platform exists to fight. Acknowledge those needs and say we'll look, without guaranteeing. If they describe a possible emergency, prioritise the safety note.",
      prompt: `A woman wrote:\n\n"""${query}"""\n\nAvailable topics:\n${catList}\n\nInterpret with empathy and map her to the most relevant topics.`,
    });

    const valid = new Set(cats.map((c) => c.slug));
    const matchedCategories = object.matchedCategories
      .filter((s) => valid.has(s))
      .slice(0, 3);

    // Respect a deliberately empty result — the query wasn't a women's-health
    // concern. Don't force a catch-all category.
    return {
      empathy: object.empathy,
      matchedCategories,
      safetyNote: object.safetyNote,
      detectedLocation: object.detectedLocation,
    };
  } catch (err) {
    console.error("interpretSymptoms failed, using keyword fallback:", err);
    return {
      empathy:
        "Thank you for sharing. Here are practitioners other women trust for what you described.",
      matchedCategories: keywordFallback(query, cats),
      safetyNote: null,
      detectedLocation: null,
    };
  }
}

/**
 * Synthesise a short "why women trust her" paragraph from real reviews.
 * Grounded strictly in the reviews provided.
 */
export async function synthesiseTrust(
  name: string,
  reviewBodies: Pick<Review, "body">[],
): Promise<string | null> {
  if (reviewBodies.length === 0) return null;
  try {
    const { text } = await generateText({
      model: MODEL,
      system:
        "You summarise why women trust a women's-health practitioner, grounded ONLY in the reviews provided. Warm, specific, honest. 2-3 sentences. No invented facts, no medical claims. Refer to the practitioner by name.",
      prompt: `Practitioner: ${name}\n\nReviews:\n${reviewBodies
        .map((r, i) => `${i + 1}. ${r.body}`)
        .join("\n")}\n\nWrite the "why women trust ${name}" summary.`,
    });
    return text.trim();
  } catch (err) {
    console.error("synthesiseTrust failed:", err);
    return null;
  }
}

export type Moderation = {
  allow: boolean;
  tone: "positive" | "neutral" | "harmful";
  reason: string;
};

/**
 * The Guud Network is a positive, trust-first space. Moderate submitted reviews
 * for a constructive tone and block abuse, harassment, or unsafe medical claims.
 */
export async function moderateReview(body: string): Promise<Moderation> {
  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: z.object({
        tone: z.enum(["positive", "neutral", "harmful"]),
        allow: z
          .boolean()
          .describe(
            "true if the review is a genuine, constructive recommendation safe to publish; false if it is abusive, defamatory, harassing, or contains dangerous medical misinformation.",
          ),
        reason: z.string().describe("Brief reason for the decision."),
      }),
      system:
        "You moderate recommendations on The Guud Network, a positive, trust-first platform for women's health. Allow genuine, constructive reviews (including measured, fair criticism). Block harassment, abuse, doxxing, defamation, and dangerous medical misinformation.",
      prompt: `Review to moderate:\n\n"""${body}"""`,
    });
    return {
      allow: object.allow,
      tone: object.tone as Moderation["tone"],
      reason: object.reason,
    };
  } catch (err) {
    console.error("moderateReview failed, holding for manual review:", err);
    return {
      allow: false,
      tone: "neutral",
      reason: "Automatic moderation unavailable; held for review.",
    };
  }
}

/** Simple keyword fallback so the site works even without AI. */
function keywordFallback(query: string, cats: Category[]): string[] {
  const q = query.toLowerCase();
  const hits = cats.filter(
    (c) =>
      q.includes(c.name.toLowerCase()) ||
      c.slug.split("-").some((w) => w.length > 3 && q.includes(w)),
  );
  // No default catch-all: if nothing matches, return nothing (honest no-match).
  return hits.map((c) => c.slug).slice(0, 3);
}
