"use client";

import { useActionState, useState } from "react";
import { submitReview, type ActionState } from "@/app/actions";
import type { Category } from "@/db/schema";

const initial: ActionState = { ok: false, message: "" };

export function ReviewForm({
  practitionerId,
  specialties,
  catMap,
}: {
  practitionerId: number;
  specialties: string[];
  catMap: Record<string, Category>;
}) {
  const [state, action, pending] = useActionState(submitReview, initial);
  const [rating, setRating] = useState(5);

  if (state.ok) {
    return (
      <div className="rounded-xl2 border border-sage/40 bg-sage-soft/60 p-6 text-center">
        <p className="font-display text-lg text-sage">Thank you 💚</p>
        <p className="mt-1 text-sm text-ink/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="practitionerId" value={practitionerId} />

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          What did they help you with?
        </label>
        <select
          name="helpedWith"
          defaultValue={specialties[0]}
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-plum"
        >
          {specialties.map((s) => (
            <option key={s} value={s}>
              {catMap[s]?.name ?? s}
            </option>
          ))}
        </select>
      </div>

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
              className="text-2xl leading-none transition"
            >
              <span className={n <= rating ? "text-gold" : "text-line"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Your recommendation
        </label>
        <textarea
          name="body"
          rows={4}
          required
          placeholder="What made them trustworthy? How did they help? Speak to the woman who'll read this next."
          className="w-full resize-none rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-plum"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Your name or initials (optional)
        </label>
        <input
          name="authorName"
          placeholder="e.g. Sara, or leave blank for Anonymous"
          className="w-full rounded-xl border border-line bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-plum"
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
        className="inline-flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-plum-dark disabled:opacity-50"
      >
        {pending ? "Checking & posting…" : "Post my recommendation"}
      </button>
      <p className="text-xs text-muted">
        Every recommendation is checked by Claude Opus 4.8 to keep this a
        positive, safe space.
      </p>
    </form>
  );
}
