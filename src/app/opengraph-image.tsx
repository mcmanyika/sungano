import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/data";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a2d6b 0%, #0F3D91 50%, #1F8A70 100%)",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "#C9A227",
            color: "#0a2d6b",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          {siteConfig.initials}
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.8)",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          Restore the Constitution. Restore Our Democracy.
        </div>
      </div>
    ),
    { ...size },
  );
}
