import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — Government jobs and exam updates`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const image = await readFile(new URL("./opengraph.png", import.meta.url));
  const imageUrl = `data:image/jpeg;base64,${image.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          width={1200}
          height={630}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    ),
    size,
  );
}
