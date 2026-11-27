"use client";

/**
 * seduhmanual brand mark: a stripped-back V60 dripper.
 * Uses theme variables so it adapts to every palette.
 */
export default function DripperMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M15 16h34L38 49H26L15 16Z" fill="var(--accent)" />
      <path
        d="M15 16h34"
        stroke="var(--ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M26 49h12"
        stroke="var(--ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M24 16l8 13 8-13"
        stroke="var(--ink)"
        strokeWidth={3}
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}
