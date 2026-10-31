import { ImageResponse } from "next/og";

export const alt = "AstroArrox: drones, robotics and electronics in Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0b0d17 0%, #141a4a 55%, #2838eb 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Simplified logo mark */}
          <svg width="72" height="64" viewBox="0 0 72 64">
            <path d="M36 0 L54 31 L46 31 L36 14 L26 31 L18 31 Z" fill="#4a58ff" />
            <path d="M14 38 L22 38 L10 60 L2 60 Z" fill="#cfd3e6" />
            <path d="M58 38 L50 38 L62 60 L70 60 Z" fill="#cfd3e6" />
            <path d="M27 42 L45 42 L52 60 L20 60 Z" fill="#4a58ff" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 2 }}>ASTRO ARROX</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Technologies of the Future</div>
          <div style={{ fontSize: 34, color: "#c7cbe0" }}>Drones · Robotics · Embedded systems · R&amp;D components</div>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 26, color: "#e3e6f5" }}>
          <span>Cash on Delivery</span>
          <span>·</span>
          <span>Delivery across Bangladesh</span>
          <span>·</span>
          <span>1-year warranty</span>
        </div>
      </div>
    ),
    size,
  );
}
