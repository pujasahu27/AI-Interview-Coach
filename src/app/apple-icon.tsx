import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at 33% 28%, #f5c340 0%, #e8614a 45%, #7c6ef5 80%, #2a1a6e 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: "15%",
            height: "27%",
            top: "36%",
            left: "31%",
            background: "#0a0800",
            borderRadius: "50%",
            transform: "rotate(-14deg)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: "15%",
            height: "27%",
            top: "36%",
            right: "31%",
            background: "#0a0800",
            borderRadius: "50%",
            transform: "rotate(14deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
