import { ImageResponse } from "next/og";
import { getPractitionerBySlug } from "@/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  const name = p?.name ?? "The Guud Network";
  const title = p?.title ?? "Women's health practitioner";
  const city = p?.city ?? "";
  const hasReviews = (p?.trust.reviewCount ?? 0) > 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f6f4",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#893400",
              color: "#f7f6f4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
            }}
          >
            g
          </div>
          <div style={{ fontSize: 30, color: "#893400" }}>The Guud Network</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, color: "#1c1b1b", lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ fontSize: 36, color: "#6a6a6a", marginTop: 16 }}>
            {city ? `${title} · ${city}` : title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#893400" }}>
          {hasReviews
            ? `★ ${p?.trust.avgRating.toFixed(1)} · ${p?.trust.reviewCount} recommendation${p?.trust.reviewCount === 1 ? "" : "s"} women trust`
            : "Find women's health help you can trust"}
        </div>
      </div>
    ),
    size,
  );
}
