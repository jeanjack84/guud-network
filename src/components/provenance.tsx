const MAP: Record<
  string,
  { label: string; cls: string; icon: string; title: string }
> = {
  curated: {
    label: "Curated",
    cls: "bg-plum/10 text-plum ring-1 ring-plum/20",
    icon: "✦",
    title: "Verified by the Guud team",
  },
  npi: {
    label: "Verified directory",
    cls: "bg-sage-soft text-sage ring-1 ring-sage/20",
    icon: "🏛",
    title: "Real provider from the U.S. NPI registry",
  },
  community: {
    label: "Community",
    cls: "bg-blush text-plum-dark ring-1 ring-rose/20",
    icon: "✿",
    title: "Added by the Guud community",
  },
};

export function ProvenanceBadge({ source }: { source: string }) {
  const m = MAP[source] ?? MAP.community;
  return (
    <span
      title={m.title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.cls}`}
    >
      <span aria-hidden>{m.icon}</span>
      {m.label}
    </span>
  );
}

export function SampleTag() {
  return (
    <span
      title="Illustrative sample recommendation — not a real patient review"
      className="inline-flex items-center rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold"
    >
      Sample
    </span>
  );
}
