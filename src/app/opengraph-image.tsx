import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ソラしどファーム | 農場受付管理システム";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 999,
            padding: "8px 24px",
            marginBottom: 32,
            color: "#fde68a",
          }}
        >
          農場受付管理システム
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          ソラしどファーム
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            color: "#ddd6fe",
            maxWidth: 800,
            lineHeight: 1.5,
          }}
        >
          受付・会計・顧客管理をシンプルに
        </div>
      </div>
    ),
    { ...size }
  );
}
