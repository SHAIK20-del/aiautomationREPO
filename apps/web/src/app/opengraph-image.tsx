import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "The Living Atelier — Where imagination becomes intelligence.";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#F8F4EF",
        padding: "70px",
        color: "#591F32",
      }}
    >
      <div style={{ fontSize: 24, letterSpacing: 6 }}>THE LIVING ATELIER</div>
      <div
        style={{
          fontSize: 90,
          lineHeight: 1.05,
          letterSpacing: -4,
          maxWidth: 950,
        }}
      >
        Where imagination becomes intelligence.
      </div>
      <div style={{ fontSize: 20, color: "#8c6976" }}>
        AI AUTOMATION / CREATIVE TECHNOLOGY / DIGITAL WORLDS
      </div>
    </div>,
    size,
  );
}
