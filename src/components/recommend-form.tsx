"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { recommendPractitioner, type ActionState } from "@/app/actions";
import type { Category } from "@/db/schema";

const initial: ActionState = { ok: false, message: "" };

const field =
  "w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-plum";

export function RecommendForm({
  cats,
  defaults,
}: {
  cats: Category[];
  defaults?: { topic?: string; city?: string; country?: string };
}) {
  const [state, action, pending] = useActionState(
    recommendPractitioner,
    initial,
  );
  const [rating, setRating] = useState(5);
  const topicDefault =
    defaults?.topic && cats.some((c) => c.slug === defaults.topic)
      ? defaults.topic
      : cats[0]?.slug;

  if (state.ok) {
    return (
      <div className="rounded-xl2 border border-sage/40 bg-sage-soft/60 p-8 text-center">
        <p className="font-display text-2xl text-sage">Thank you 💚</p>
        <p className="mx-auto mt-2 max-w-md text-ink/80">{state.message}</p>
        {state.slug && (
          <Link
            href={`/practitioners/${state.slug}`}
            className="mt-5 inline-flex rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-cream hover:bg-plum-dark"
          >
            View their profile →
          </Link>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Practitioner name
          </label>
          <input name="name" required placeholder="Dr. Jane Doe" className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Their role / title
          </label>
          <input
            name="title"
            required
            placeholder="Gynaecologist"
            className={field}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">City</label>
          <input
            name="city"
            required
            defaultValue={defaults?.city}
            placeholder="Amsterdam"
            className={field}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Country
          </label>
          <input
            name="country"
            required
            defaultValue={defaults?.country}
            placeholder="Netherlands"
            className={field}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          What do they help with?
        </label>
        <select name="topic" defaultValue={topicDefault} className={field}>
          {cats.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="telehealth" className="h-4 w-4 accent-plum" />
        They offer online / remote consultations
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Your rating
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              className="text-2xl leading-none"
            >
              <span className={n <= rating ? "text-gold" : "text-line"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Why do you recommend them?
        </label>
        <textarea
          name="body"
          rows={4}
          required
          placeholder="Tell the next woman what made them trustworthy and how they helped you."
          className={`${field} resize-none`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Your name or initials (optional)
        </label>
        <input
          name="authorName"
          placeholder="Leave blank for Anonymous"
          className={field}
        />
      </div>

      {state.message && !state.ok && (
        <p className="rounded-lg bg-blush px-3 py-2 text-sm text-plum-dark">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-medium text-cream transition hover:bg-plum-dark disabled:opacity-50"
      >
        {pending ? "Checking & adding…" : "Add to The Guud Network"}
      </button>
      <p className="text-xs text-muted">
        Checked by Claude Opus 4.8 to keep the network positive and safe.
      </p>
    </form>
  );
}
