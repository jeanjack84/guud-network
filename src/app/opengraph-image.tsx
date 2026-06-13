import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f7f6f4",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          <div style={{ color: "#1c1b1b" }}>Find women&apos;s health help</div>
          <div style={{ color: "#893400" }}>you can actually trust.</div>
        </div>
        <div style={{ fontSize: 34, color: "#6a6a6a", marginTop: 28, maxWidth: 900 }}>
          Real practitioners, recommended by women. Open and free.
        </div>
      </div>
    ),
    size,
  );
}
