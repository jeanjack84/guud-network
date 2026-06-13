import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stars } from "@/components/stars";
import { TrustBadge } from "@/components/trust-badge";
import { ProvenanceBadge, SampleTag } from "@/components/provenance";
import { ShareButton } from "@/components/share-button";
import { ReviewForm } from "@/components/review-form";
import { getCategories, getPractitionerBySlug } from "@/lib/queries";
import { synthesiseTrust } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) return { title: "Practitioner not found" };
  const title = `${p.name} — ${p.title}, ${p.city}`;
  const description = `${p.name} (${p.title}) in ${p.city}. ${
    p.trust.reviewCount > 0
      ? `${p.trust.reviewCount} recommendation${p.trust.reviewCount === 1 ? "" : "s"} from women on The Guud Network.`
      : "Listed on The Guud Network — be the first to recommend them."
  }`;
  return {
    title,
    description,
    openGraph: { title, description, url: `/practitioners/${p.slug}` },
  };
}

async function TrustSynthesis({
  name,
  bodies,
}: {
  name: string;
  bodies: { body: string }[];
}) {
  const summary = await synthesiseTrust(name, bodies);
  if (!summary) return null;
  return (
    <div className="rounded-xl2 bg-blush/70 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-plum/70">
        Why women trust her · summarised by Claude Opus 4.8
      </p>
      <p className="mt-2 font-display text-lg leading-relaxed text-plum-dark">
        {summary}
      </p>
    </div>
  );
}

function ReviewCard({
  r,
  catMap,
}: {
  r: { id: number; authorName: string; verified: boolean; synthetic: boolean; rating: number; body: string; helpedWith: string };
  catMap: Record<string, { name: string }>;
}) {
  return (
    <article className="rounded-xl2 border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-soft text-xs font-medium text-sage">
            {r.authorName.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-sm font-medium text-ink">{r.authorName}</span>
          {r.verified && (
            <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[10px] font-medium text-sage">
              verified
            </span>
          )}
          {r.synthetic && <SampleTag />}
        </div>
        <Stars rating={r.rating} />
      </div>
      <p className="mt-3 leading-relaxed text-ink/85">{r.body}</p>
      <p className="mt-2 text-xs text-muted">
        Helped with {catMap[r.helpedWith]?.name ?? r.helpedWith}
      </p>
    </article>
  );
}

export default async function PractitionerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p, cats] = await Promise.all([
    getPractitionerBySlug(slug),
    getCategories(),
  ]);
  if (!p) notFound();
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const realReviews = p.reviews.filter((r) => !r.synthetic);
  const hasSamples = p.reviews.some((r) => r.synthetic);
  const hasReviews = realReviews.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/discover"
        className="text-sm text-muted transition hover:text-plum"
      >
        ← Back to the network
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-col gap-4 rounded-xl2 border border-line bg-surface p-7 sm:flex-row sm:items-start">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-blush font-display text-2xl text-plum">
          {p.name
            .replace(/^Dr\.?\s+/i, "")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-3xl text-ink">{p.name}</h1>
              <p className="text-muted">{p.title}</p>
              <div className="mt-1.5">
                <ProvenanceBadge source={p.source} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {hasReviews && <TrustBadge score={p.trust.score} />}
              <ShareButton
                title={`${p.name} — The Guud Network`}
                text={`${p.name}, ${p.title} in ${p.city}. Found on The Guud Network.`}
                path={`/practitioners/${p.slug}`}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {hasReviews && (
              <span className="flex items-center gap-1.5">
                <Stars rating={p.trust.avgRating} />
                {p.trust.avgRating.toFixed(1)} · {p.trust.reviewCount}{" "}
                {p.trust.reviewCount === 1 ? "recommendation" : "recommendations"}
              </span>
            )}
            <span>📍 {p.city}, {p.country}</span>
            {p.telehealth && <span className="text-sage">💻 Online available</span>}
            {p.phone && (
              <a href={`tel:${p.phone}`} className="hover:text-plum">
                📞 {p.phone}
              </a>
            )}
            <span>🗣️ {p.languages.join(", ")}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.specialties.map((s) => (
              <Link
                key={s}
                href={`/discover?topic=${s}`}
                className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted ring-1 ring-line transition hover:text-plum"
              >
                {catMap[s]?.emoji} {catMap[s]?.name ?? s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 leading-relaxed text-ink/80">{p.bio}</p>

      {/* AI synthesis (streamed) — only over REAL reviews, never sample data. */}
      {realReviews.length > 0 && (
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="animate-pulse rounded-xl2 bg-blush/40 p-5">
                <div className="h-3 w-56 rounded bg-rose/30" />
                <div className="mt-3 h-4 w-full rounded bg-rose/20" />
                <div className="mt-2 h-4 w-2/3 rounded bg-rose/20" />
              </div>
            }
          >
            <TrustSynthesis
              name={p.name}
              bodies={realReviews.map((r) => ({ body: r.body }))}
            />
          </Suspense>
        </div>
      )}

      {p.source === "npi" && (
        <p className="mt-6 rounded-xl border border-line bg-sage-soft/50 px-4 py-3 text-sm text-ink/75">
          🏛 Listed in the public U.S. NPI registry — a real provider, but not
          yet vetted or endorsed by Guud. Any sample recommendations below are
          illustrative; add a real one to help other women.
        </p>
      )}

      {/* Real recommendations */}
      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink">
          Recommendations ({realReviews.length})
        </h2>
        {realReviews.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-cream px-4 py-6 text-center text-sm text-muted">
            No real recommendations yet. If this provider helped you, you could be
            the first to help the next woman find them.
          </p>
        )}
        <div className="mt-4 space-y-4">
          {realReviews.map((r) => (
            <ReviewCard key={r.id} r={r} catMap={catMap} />
          ))}
        </div>

        {/* Illustrative samples, clearly separated and never counted above. */}
        {hasSamples && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-display text-lg text-muted">
              Sample recommendations <SampleTag />
            </h3>
            <p className="mb-3 mt-1 text-sm text-muted">
              Illustrative only — shown to demonstrate the experience. These are
              not real patient reviews and are not counted in any score.
            </p>
            <div className="space-y-4 opacity-80">
              {p.reviews
                .filter((r) => r.synthetic)
                .map((r) => (
                  <ReviewCard key={r.id} r={r} catMap={catMap} />
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Add recommendation */}
      <section className="mt-12 rounded-xl2 border border-line bg-surface p-7">
        <h2 className="font-display text-2xl text-ink">
          Were you helped by {p.name.split(" ").slice(-1)}?
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted">
          Your recommendation could be the reason another woman finally gets the
          care she deserves.
        </p>
        <ReviewForm
          practitionerId={p.id}
          specialties={p.specialties}
          catMap={catMap}
        />
      </section>
    </div>
  );
}
