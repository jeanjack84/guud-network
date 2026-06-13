import { notFound } from "next/navigation";
import { db } from "@/db";
import { demandSignups } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminDemandPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  // Simple shared-secret gate. If unset or wrong, behave as if the page doesn't exist.
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) notFound();

  const [rows, cats] = await Promise.all([
    db.select().from(demandSignups).orderBy(desc(demandSignups.createdAt)),
    getCategories(),
  ]);
  const catName = Object.fromEntries(cats.map((c) => [c.slug, c.name]));

  const tally = (key: (r: (typeof rows)[number]) => string[]) => {
    const m = new Map<string, number>();
    for (const r of rows) for (const k of key(r)) m.set(k, (m.get(k) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const byLocation = tally((r) => (r.location ? [r.location] : ["(no location)"]));
  const byTopic = tally((r) => (r.topics ?? []).map((t) => catName[t] ?? t));

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-3xl text-ink">Demand heat-map</h1>
      <p className="mt-1 text-muted">
        {rows.length} signup{rows.length === 1 ? "" : "s"} from women we
        couldn&apos;t serve yet. This is your recruiting priority list.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl2 border border-line bg-surface p-5">
          <h2 className="font-display text-lg text-ink">Most-requested locations</h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {byLocation.length === 0 && <li className="text-muted">No data yet.</li>}
            {byLocation.map(([loc, n]) => (
              <li key={loc} className="flex justify-between gap-4">
                <span className="text-ink">{loc}</span>
                <span className="font-medium text-plum">{n}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl2 border border-line bg-surface p-5">
          <h2 className="font-display text-lg text-ink">Most-requested topics</h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {byTopic.length === 0 && <li className="text-muted">No data yet.</li>}
            {byTopic.map(([topic, n]) => (
              <li key={topic} className="flex justify-between gap-4">
                <span className="text-ink">{topic}</span>
                <span className="font-medium text-plum">{n}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="mt-8 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display text-lg text-ink">Recent signups</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Topics</th>
                <th className="py-2">In their words</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((r) => (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="py-2 pr-4 text-ink">{r.email}</td>
                  <td className="py-2 pr-4 text-muted">{r.location ?? "—"}</td>
                  <td className="py-2 pr-4 text-muted">
                    {(r.topics ?? []).map((t) => catName[t] ?? t).join(", ") || "—"}
                  </td>
                  <td className="py-2 text-muted">{r.query ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
