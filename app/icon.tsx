import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#7c1d1d",
          color: "white",
          fontSize: 190,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        SGR
      </div>
    ),
    size,
  );
}
