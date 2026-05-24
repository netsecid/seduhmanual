import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Coffee-themed favicon — a warm espresso cup silhouette on a dark background,
 * matching the seduhmanual brand colours.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#1E0E08",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Cup body */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cup body trapezoid */}
          <path
            d="M4 7h14l-2 9H6L4 7z"
            fill="#C4622D"
          />
          {/* Steam lines */}
          <path
            d="M8 4 Q8.5 2.5 8 1"
            stroke="#EDD9C8"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M11 4 Q11.5 2.5 11 1"
            stroke="#EDD9C8"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 4 Q14.5 2.5 14 1"
            stroke="#EDD9C8"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Saucer */}
          <rect x="3" y="17" width="16" height="2" rx="1" fill="#EDD9C8" />
          {/* Handle */}
          <path
            d="M18 9 Q21 9 21 12 Q21 15 18 15"
            stroke="#EDD9C8"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
