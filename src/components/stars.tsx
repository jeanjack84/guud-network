export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5 align-middle"
      aria-label={`${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className={i < full ? "fill-gold" : "fill-line"}
          aria-hidden
        >
          <path d="M10 1.5l2.47 5.27 5.78.62-4.32 3.9 1.2 5.71L10 14.9l-5.13 2.6 1.2-5.71-4.32-3.9 5.78-.62L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
