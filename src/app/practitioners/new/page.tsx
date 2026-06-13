import { RecommendForm } from "@/components/recommend-form";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewPractitionerPage() {
  const cats = await getCategories();
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
        <RecommendForm cats={cats} />
      </div>
    </div>
  );
}
