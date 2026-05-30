import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Roberto Pocas Leitao - Product Designer & Python Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(120% 120% at 0% 0%, #2A0E45 0%, #140A24 45%, #0B0610 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative gold glow */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(230,194,96,0.28) 0%, rgba(230,194,96,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #E6C260, #C9A227)",
              color: "#0B0610",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            h
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#B7A8C9" }}>
            <span style={{ color: "#F5F1E6", fontWeight: 700 }}>human</span>
            <span style={{ color: "#E6C260", fontWeight: 700 }}>berto</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              lineHeight: 1.05,
              color: "#F5F1E6",
              fontWeight: 600,
              letterSpacing: -1,
            }}
          >
            Turning messy processes into&nbsp;
            <span style={{ color: "#E6C260" }}>clean experiences.</span>
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#B7A8C9" }}>
            Roberto Pocas Leitao - Product Designer &amp; Python Developer
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 26,
            color: "#6E5F86",
          }}
        >
          {["Product Design", "UX/UI", "Python", "Data", "AI/ML"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #2E1F47",
                color: "#B7A8C9",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
