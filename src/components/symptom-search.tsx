"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/db/schema";
import type { PractitionerWithTrust } from "@/lib/queries";
import { PractitionerCard } from "./practitioner-card";
import { DemandCapture } from "./demand-capture";

type MatchResponse = {
  empathy: string;
  safetyNote: string | null;
  regionNote: string | null;
  location: string | null;
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
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState("");

  async function run(q: string) {
    const text = q.trim();
    if (text.length < 3) {
      setError("Tell us a little more about what you're going through.");
      return;
    }
    setSubmittedQuery(text);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, location: location.trim() }),
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

  const emergency = !!result?.safetyNote;

  // Region-aware emergency numbers driven by the detected/declared location.
  function emergencyNumbers(loc: string | null): { num: string; label: string }[] {
    const q = (loc ?? "").toLowerCase();
    if (/\b(uk|united kingdom|england|scotland|wales|britain|london)\b/.test(q))
      return [{ num: "999", label: "Call 999 (UK)" }];
    if (/\b(usa|us|united states|america|u\.s)\b/.test(q) || /, ?[a-z]{2}\b/.test(q))
      return [{ num: "911", label: "Call 911 (US)" }];
    if (/netherlands|belgium|germany|denmark|italy|france|spain|europe|eu\b/.test(q))
      return [{ num: "112", label: "Call 112 (EU)" }];
    return [
      { num: "911", label: "911 (US)" },
      { num: "112", label: "112 (EU)" },
      { num: "999", label: "999 (UK)" },
    ];
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
        <label htmlFor="concern" className="sr-only">
          Describe what you are going through
        </label>
        <textarea
          id="concern"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(query);
          }}
          rows={3}
          aria-label="Describe what you are going through"
          placeholder="In your own words, what are you going through? e.g. “Painful sex since my second baby and my GP shrugged.”"
          className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-base text-ink outline-none placeholder:text-muted"
        />
        <div className="flex flex-col gap-3 px-1 pb-1 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-full bg-cream px-3 py-1.5">
            <span aria-hidden>📍</span>
            <label htmlFor="location" className="sr-only">
              Your city or country
            </label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Your city or country (helps us find local help)"
              className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted sm:w-64"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Finding trusted help…" : "Find help I can trust"}
          </button>
        </div>
        <p className="px-2 pb-1 text-xs text-muted">
          Private. Not stored. Powered by Claude Opus 4.8. Not a medical service —
          not medical advice.
        </p>
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
            <p className="mt-2 text-xs text-muted">
              The Guud Network is not a medical service and this is not medical
              advice.
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

          {/* Emergency: lead with help, gate the directory. */}
          {emergency ? (
            <div className="rounded-xl2 border-2 border-rose/60 bg-rose/5 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl text-plum-dark">
                ⚠️ This may need urgent care
              </h2>
              <p className="mt-2 text-ink">{result.safetyNote}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {emergencyNumbers(result.location).map((e) => (
                  <a
                    key={e.num}
                    href={`tel:${e.num}`}
                    className="rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream hover:bg-plum-dark"
                  >
                    📞 {e.label}
                  </a>
                ))}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-plum px-4 py-2 text-sm font-medium text-plum hover:bg-blush"
                >
                  Find a helpline near you →
                </a>
              </div>
              <p className="mt-3 text-xs text-muted">
                Not sure of the number? Call your local emergency number.
              </p>
            </div>
          ) : null}

          {result.regionNote && (
            <div className="flex gap-3 rounded-xl2 border border-gold/50 bg-gold/10 p-5 text-sm text-ink">
              <span aria-hidden className="text-lg">📍</span>
              <p>{result.regionNote}</p>
            </div>
          )}

          {!emergency &&
            (result.practitioners.length > 0 ? (
              <div>
                <h2 className="mb-4 font-display text-xl text-ink">
                  Practitioners women trust for this
                  {result.location ? ` near ${result.location}` : ""}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.practitioners.map((p) => (
                    <PractitionerCard key={p.id} p={p} catMap={catMap} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted">
                  Helped by someone who isn&apos;t here?{" "}
                  <Link
                    href={`/practitioners/new?topic=${encodeURIComponent(result.matchedCategories[0]?.slug ?? "")}&loc=${encodeURIComponent(result.location ?? "")}`}
                    className="text-plum underline"
                  >
                    Recommend a practitioner
                  </Link>{" "}
                  and grow the network.
                </p>
              </div>
            ) : null)}

          {/* Capture demand (and invite supply) when we can't serve this yet. */}
          {!emergency &&
            result.matchedCategories.length > 0 &&
            (result.regionNote || result.practitioners.length === 0) && (
              <DemandCapture
                location={result.location}
                topics={result.matchedCategories.map((c) => c.slug)}
                query={submittedQuery}
              />
            )}
        </div>
      )}
    </div>
  );
}
