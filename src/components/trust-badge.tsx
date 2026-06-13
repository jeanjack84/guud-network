export function TrustBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage">
      <svg width="13" height="13" viewBox="0 0 20 20" className="fill-sage" aria-hidden>
        <path d="M10 1l6.5 2.6v5.2c0 4-2.8 7.7-6.5 9.2C6.3 16.5 3.5 12.8 3.5 8.8V3.6L10 1z" />
        <path d="M8.7 11.6L6.6 9.5l-1 1 3.1 3.1 5-5-1-1z" className="fill-sage-soft" />
      </svg>
      {score} trust
    </span>
  );
}
