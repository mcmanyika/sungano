import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/data";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logoData = await readFile(
    join(process.cwd(), "public/images/logo.jpeg"),
    "base64",
  );
  const logoSrc = `data:image/jpeg;base64,${logoData}`;

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
          background:
            "linear-gradient(135deg, #0a2d6b 0%, #0F3D91 50%, #1F8A70 100%)",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            borderRadius: 20,
            background: "white",
            marginBottom: 36,
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt=""
            height={120}
            style={{
              height: 120,
              width: "auto",
              objectFit: "contain",
            }}
          />
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
