import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Brand OG image: white canvas, stacked stones, tight display title, green base bar. */
export function brandOg(title: string, label: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: "#17171c",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ width: 26, height: 12, borderRadius: 6, background: "#17171c", marginLeft: 6 }} />
            <div style={{ width: 38, height: 12, borderRadius: 6, background: "#17171c", marginLeft: -4 }} />
            <div style={{ width: 52, height: 12, borderRadius: 6, background: "#17171c" }} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em" }}>Cairn</div>
        </div>

        <div
          style={{
            marginTop: 90,
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#b4632c",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div style={{ flexGrow: 1 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, color: "#616161" }}>The system of record for AI-generated work</div>
          <div style={{ width: 220, height: 14, borderRadius: 7, background: "#003c33" }} />
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
