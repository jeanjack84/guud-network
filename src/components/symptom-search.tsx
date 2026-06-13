"use client";

import { useState } from "react";
import type { Category } from "@/db/schema";
import type { PractitionerWithTrust } from "@/lib/queries";
import { PractitionerCard } from "./practitioner-card";

type MatchResponse = {
  empathy: string;
  safetyNote: string | null;
  matchedCategories: Category[];
  practitioners: PractitionerWithTrust[];
};

const EXAMPLES = [
  "I've had painful periods for years and my doctor keeps brushing it off.",
  "We've been trying to conceive for 18 months with no luck.",
  "Since my baby I leak when I run and feel broken.",
  "Brain fog and night sweats are taking over my life at 47.",
];

export function SymptomSearch({ catMap }: { catMap: Record<string, Category> }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(q: string) {
    const text = q.trim();
    if (text.length < 3) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="rounded-xl2 border border-line bg-surface p-3 shadow-sm shadow-plum/5"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(query);
          }}
          rows={3}
          placeholder="In your own words, what are you going through? e.g. “Painful sex since my second baby and my GP shrugged.”"
          className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-base text-ink outline-none placeholder:text-muted/70"
        />
        <div className="flex items-center justify-between gap-3 px-1 pb-1">
          <p className="hidden text-xs text-muted sm:block">
            Private. Not stored. Powered by Claude Opus 4.8.
          </p>
          <button
            type="submit"
            disabled={loading || query.trim().length < 3}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Finding trusted help…" : "Find help I can trust"}
          </button>
        </div>
      </form>

      {!result && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                run(ex);
              }}
              className="rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-left text-xs text-muted transition hover:border-rose hover:text-plum"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-blush px-4 py-3 text-sm text-plum-dark">
          {error}
        </p>
      )}

      {loading && (
        <div className="mt-8 animate-pulse space-y-3">
          <div className="h-5 w-2/3 rounded bg-line" />
          <div className="h-24 rounded-xl2 bg-line/60" />
        </div>
      )}

      {result && (
        <div className="mt-8 animate-rise space-y-6">
          <div className="rounded-xl2 bg-blush/70 p-5">
            <p className="font-display text-lg leading-relaxed text-plum-dark">
              {result.empathy}
            </p>
            {result.matchedCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted">Matched topics:</span>
                {result.matchedCategories.map((c) => (
                  <span
                    key={c.slug}
                    className="rounded-full bg-surface px-3 py-1 text-plum ring-1 ring-rose/30"
                  >
                    {c.emoji} {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {result.safetyNote && (
            <div className="flex gap-3 rounded-xl2 border border-gold/50 bg-gold/10 p-5 text-sm text-ink">
              <span aria-hidden className="text-lg">
                ⚠️
              </span>
              <p>{result.safetyNote}</p>
            </div>
          )}

          {result.practitioners.length > 0 ? (
            <div>
              <h2 className="mb-4 font-display text-xl text-ink">
                Practitioners women trust for this
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.practitioners.map((p) => (
                  <PractitionerCard key={p.id} p={p} catMap={catMap} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted">
              We don&apos;t have a trusted match yet for this topic. The network
              grows every day — check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
