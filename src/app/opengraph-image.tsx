import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          background: "#060608",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 500,
            display: "flex",
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(240,180,41,.18) 0%, rgba(6,6,8,0) 65%)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 168,
            height: 168,
            borderRadius: "50%",
            marginBottom: 36,
            background:
              "radial-gradient(circle at 33% 28%, #f5c340 0%, #e8614a 45%, #7c6ef5 80%, #2a1a6e 100%)",
            boxShadow: "0 0 120px rgba(240,180,41,.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: 25,
              height: 45,
              top: 60,
              left: 52,
              background: "#0a0800",
              borderRadius: 999,
              transform: "rotate(-14deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              width: 25,
              height: 45,
              top: 60,
              right: 52,
              background: "#0a0800",
              borderRadius: 999,
              transform: "rotate(14deg)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 600,
            color: "#f4f2ee",
            letterSpacing: -1,
          }}
        >
          AI Interview Coach
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 28,
            color: "#b0b0c8",
          }}
        >
          Interview like never before.
        </div>
      </div>
    ),
    { ...size },
  );
}
