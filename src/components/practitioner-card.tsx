import Link from "next/link";
import type { Category } from "@/db/schema";
import type { PractitionerWithTrust } from "@/lib/queries";
import { Stars } from "./stars";
import { TrustBadge } from "./trust-badge";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PractitionerCard({
  p,
  catMap,
}: {
  p: PractitionerWithTrust;
  catMap: Record<string, Category>;
}) {
  return (
    <Link
      href={`/practitioners/${p.slug}`}
      className="group flex flex-col rounded-xl2 border border-line bg-surface p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition hover:-translate-y-0.5 hover:border-rose hover:shadow-lg hover:shadow-rose/10"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blush font-display text-lg text-plum">
          {initials(p.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-ink group-hover:text-plum">
            {p.name}
          </h3>
          <p className="text-sm text-muted">{p.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {p.city}, {p.country}
            {p.telehealth && (
              <span className="ml-2 text-sage">· online available</span>
            )}
          </p>
        </div>
        <TrustBadge score={p.trust.score} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Stars rating={p.trust.avgRating} />
        <span>
          {p.trust.avgRating.toFixed(1)} · {p.trust.reviewCount}{" "}
          {p.trust.reviewCount === 1 ? "recommendation" : "recommendations"}
        </span>
      </div>

      {p.topReview && (
        <blockquote className="mt-4 border-l-2 border-rose/60 pl-3 text-sm italic leading-relaxed text-ink/80">
          &ldquo;{truncate(p.topReview.body, 160)}&rdquo;
          <span className="mt-1 block text-xs not-italic text-muted">
            — {p.topReview.authorName}
          </span>
        </blockquote>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.specialties.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted ring-1 ring-line"
          >
            {catMap[s]?.emoji} {catMap[s]?.name ?? s}
          </span>
        ))}
      </div>
    </Link>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}
