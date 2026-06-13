import type { Review } from "@/db/schema";

export type TrustStats = {
  reviewCount: number;
  avgRating: number;
  // 0-100 trust score: rewards both high ratings and volume of recommendations.
  score: number;
};

/**
 * Trust-first scoring. The Guud Network surfaces practitioners women recommend,
 * so the score blends average rating with a volume signal (more recommendations
 * = more confidence). A practitioner with one 5-star review should not outrank
 * one with twenty 4.8-star reviews.
 */
export function trustStats(reviews: Pick<Review, "rating">[]): TrustStats {
  const reviewCount = reviews.length;
  if (reviewCount === 0) return { reviewCount: 0, avgRating: 0, score: 0 };

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

  // Volume confidence saturates around ~10 reviews.
  const volumeFactor = Math.min(1, Math.log10(reviewCount + 1) / Math.log10(11));
  const score = Math.round((avgRating / 5) * 80 + volumeFactor * 20);

  return { reviewCount, avgRating, score };
}
