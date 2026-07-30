import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — Government jobs and exam updates`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#fffaf1",
          color: "#241c1c",
          borderTop: "24px solid #7c1d1d",
        }}
      >
        <div style={{ color: "#7c1d1d", fontSize: 30, fontWeight: 700 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            maxWidth: 1000,
            marginTop: 30,
            fontSize: 68,
            lineHeight: 1.1,
            fontWeight: 800,
          }}
        >
          Government jobs, results and exam updates
        </div>
        <div style={{ marginTop: 30, color: "#695c5c", fontSize: 28 }}>
          Accurate updates. Clear information. Official links.
        </div>
      </div>
    ),
    size,
  );
}
