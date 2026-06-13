import Link from "next/link";
import { PractitionerCard } from "@/components/practitioner-card";
import {
  getCategories,
  getCategoryBySlug,
  listPractitioners,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const cat = topic ? await getCategoryBySlug(topic) : null;
  if (cat) {
    const title = `${cat.name} specialists women trust`;
    return {
      title,
      description: `${cat.description} Find ${cat.name.toLowerCase()} practitioners that other women recommend on The Guud Network.`,
      openGraph: { title, url: `/discover?topic=${cat.slug}` },
    };
  }
  return {
    title: "Browse women's health practitioners by topic",
    description:
      "Browse the network by topic to find the practitioners women trust most for each women's health concern.",
  };
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const [cats, active, allMatching] = await Promise.all([
    getCategories(),
    topic ? getCategoryBySlug(topic) : Promise.resolve(null),
    listPractitioners({ category: topic }),
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const LIMIT = 48;
  const practitioners = allMatching.slice(0, LIMIT);
  const totalCount = allMatching.length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        {active ? (
          <>
            <span className="mr-2">{active.emoji}</span>
            {active.name}
          </>
        ) : (
          "Browse the network"
        )}
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        {active
          ? active.description
          : "Filter by topic to see the practitioners women trust most for each women's health concern."}
      </p>

      {/* Topic filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/discover"
          className={`rounded-full px-3.5 py-1.5 text-sm transition ${
            !topic
              ? "bg-plum text-cream"
              : "border border-line bg-surface text-muted hover:border-rose hover:text-plum"
          }`}
        >
          All topics
        </Link>
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/discover?topic=${c.slug}`}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              topic === c.slug
                ? "bg-plum text-cream"
                : "border border-line bg-surface text-muted hover:border-rose hover:text-plum"
            }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {totalCount > 0 && (
        <p className="mt-6 text-sm text-muted">
          {totalCount} practitioner{totalCount === 1 ? "" : "s"}
          {active ? ` for ${active.name}` : " in the network"}
          {totalCount > LIMIT && ` · showing the top ${LIMIT} by trust`}
        </p>
      )}

      {/* Results */}
      <div className="mt-8">
        {practitioners.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-line bg-surface/50 p-10 text-center">
            <p className="text-muted">
              No practitioners here yet.{" "}
              <Link href="/practitioners/new" className="text-plum underline">
                Be the first to recommend someone.
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {practitioners.map((p) => (
              <PractitionerCard key={p.id} p={p} catMap={catMap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
