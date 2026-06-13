import { RecommendForm } from "@/components/recommend-form";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Split a free-text location like "Chicago, IL, USA" into city + country. */
function splitLocation(loc?: string): { city?: string; country?: string } {
  if (!loc) return {};
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };
  const country = parts[parts.length - 1];
  const city = parts.slice(0, parts.length - 1).join(", ");
  return { city, country };
}

export default async function NewPractitionerPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; loc?: string }>;
}) {
  const { topic, loc } = await searchParams;
  const cats = await getCategories();
  const { city, country } = splitLocation(loc);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Recommend someone who helped you
      </h1>
      <p className="mt-2 text-muted">
        The best women&apos;s health discovery comes from women themselves. Add a
        practitioner you trust so the next woman can find them faster.
      </p>
      <div className="mt-8 rounded-xl2 border border-line bg-surface p-7">
        <RecommendForm cats={cats} defaults={{ topic, city, country }} />
      </div>
    </div>
  );
}
