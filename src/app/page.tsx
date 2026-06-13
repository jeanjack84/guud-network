import Link from "next/link";
import { SymptomSearch } from "@/components/symptom-search";
import { PractitionerCard } from "@/components/practitioner-card";
import {
  getCategories,
  getNetworkStats,
  listPractitioners,
} from "@/lib/queries";

// Always reflect the latest network data.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [cats, stats, top] = await Promise.all([
    getCategories(),
    getNetworkStats(),
    listPractitioners(),
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));

  return (
    <div className="mx-auto max-w-6xl px-5">
      {/* Hero */}
      <section className="pt-16 pb-10 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blush px-3.5 py-1.5 text-xs font-medium text-plum">
            🌸 Trust-first women&apos;s health · open source
          </span>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-heading sm:text-6xl">
            Find women&apos;s health help
            <br />
            <span className="text-plum">you can actually trust.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Describe what you&apos;re going through. We&apos;ll match you with
            real practitioners — sourced from public registries and recommended
            by women — for your specific concern.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <SymptomSearch catMap={catMap} />
        </div>

        {/* Stats */}
        <dl className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Practitioners", value: stats.practitioners },
            { label: "Recommendations", value: stats.reviews },
            { label: "Topics", value: stats.categories },
            { label: "Countries", value: stats.countries },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-surface px-4 py-5 text-center"
            >
              <dt className="font-display text-3xl text-plum">{s.value}</dt>
              <dd className="mt-1 text-xs uppercase tracking-wide text-muted">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted">
          <span>How the data works:</span>
          <span className="text-plum">✦ Curated</span> vetted by Guud ·
          <span className="text-sage">🏛 NPI registry</span> real providers
          from the public U.S. registry (not yet vetted) ·
          <span className="text-plum-dark">✿ Community</span> recommended by
          women
        </p>
      </section>

      {/* Browse by topic */}
      <section className="py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-heading">Browse by topic</h2>
          <Link
            href="/discover"
            className="text-sm text-plum hover:text-plum-dark"
          >
            See all topics →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/discover?topic=${c.slug}`}
              className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-rose hover:shadow-md hover:shadow-rose/10"
            >
              <div className="text-2xl">{c.emoji}</div>
              <h3 className="mt-2 font-medium text-ink group-hover:text-plum">
                {c.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Most trusted */}
      <section className="py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-heading">
            Most trusted in the network
          </h2>
          <Link
            href="/discover"
            className="text-sm text-plum hover:text-plum-dark"
          >
            Explore all →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.slice(0, 6).map((p) => (
            <PractitionerCard key={p.id} p={p} catMap={catMap} />
          ))}
        </div>
      </section>

      {/* How it works / open */}
      <section className="my-12 rounded-xl2 bg-plum px-6 py-12 text-cream sm:px-12">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              t: "Describe it your way",
              d: "No medical jargon needed. Tell us what you're feeling and Claude Opus 4.8 understands and routes you.",
            },
            {
              t: "See who women trust",
              d: "Every practitioner is ranked by real recommendations from women helped with that exact concern.",
            },
            {
              t: "Real data, built in the open",
              d: "Practitioners are real, pulled from public registries like the U.S. NPI. Recommendations are crowdsourced. Free and open source.",
            },
          ].map((b, i) => (
            <div key={b.t}>
              <span className="font-display text-3xl text-rose">0{i + 1}</span>
              <h3 className="mt-2 font-display text-xl">{b.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/80">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
