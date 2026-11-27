"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    panelRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const selectTheme = (next: (typeof THEMES)[number]["id"]) => {
    setTheme(next);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Change theme"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-muted transition-colors duration-150 hover:bg-accent-soft hover:text-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <PaletteIcon />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Choose theme"
          tabIndex={-1}
          className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-xl outline-none"
        >
          <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
            Theme
          </p>
          <div className="space-y-0.5">
            {THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectTheme(option.id)}
                aria-pressed={theme === option.id}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 cursor-pointer ${
                  theme === option.id
                    ? "bg-accent-soft"
                    : "hover:bg-accent-soft"
                }`}
              >
                <span className="flex flex-shrink-0 -space-x-1">
                  {option.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-4 w-4 rounded-full border border-line"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {option.name}
                  </span>
                  <span className="block text-[11px] text-ink-subtle">
                    {option.description}
                  </span>
                </span>
                {theme === option.id && (
                  <span className="flex-shrink-0 text-accent">
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="4.5" opacity="0.3" />
      <circle cx="15" cy="9" r="4.5" opacity="0.55" />
      <circle cx="12" cy="15" r="4.5" opacity="0.9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
