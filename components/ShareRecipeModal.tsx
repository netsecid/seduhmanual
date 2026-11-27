"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import type { SavedRecipe } from "@/lib/types";
import {
  buildShareCardData,
  derivePhases,
  drawShareCard,
  readableInk,
  SHARE_PRESETS,
  SITE_URL,
  slugifyRecipeName,
  type ShareFormat,
  type ShareFont,
  type ShareStyle,
} from "@/lib/shareCard";

interface ShareRecipeModalProps {
  recipe: SavedRecipe;
  onClose: () => void;
}

export default function ShareRecipeModal({
  recipe,
  onClose,
}: ShareRecipeModalProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const initialPreset = useMemo(() => {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark =
      theme === "espresso" ||
      (theme === "auto" && prefersDark);

    const preferred = isDark
      ? "single-origin"
      : theme === "auto"
        ? "paper"
        : theme;

    return (
      SHARE_PRESETS.find((preset) => preset.id === preferred) ??
      SHARE_PRESETS[0]
    );
  }, [theme]);

  const [style, setStyle] = useState<ShareStyle>(() => ({
    bg: initialPreset.bg,
    ink: initialPreset.ink,
    accent: initialPreset.accent,
    block: initialPreset.block,
    onBlock: initialPreset.onBlock,
    phases: initialPreset.phases,
    font: initialPreset.font,
    format: "portrait",
  }));
  const [activePreset, setActivePreset] = useState<string | null>(
    initialPreset.id
  );
  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const data = useMemo(() => buildShareCardData(recipe), [recipe]);

  // Lock the page, focus the dialog, and close on Escape.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Clear status after a few seconds.
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  // Draw the card whenever the recipe or style changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const render = async () => {
      if (document.fonts) {
        await document.fonts.ready;
        await Promise.all([
          document.fonts.load('700 84px "Playfair Display"'),
          document.fonts.load('600 34px "Playfair Display"'),
          document.fonts.load('400 18px "DM Sans"'),
          document.fonts.load('500 20px "DM Sans"'),
          document.fonts.load('600 24px "DM Sans"'),
          document.fonts.load('700 84px "DM Sans"'),
        ]).catch(() => {});
      }

      if (cancelled) return;
      drawShareCard(canvas, data, style);
      canvas.toBlob(
        (nextBlob) => {
          if (!cancelled) setBlob(nextBlob);
        },
        "image/png"
      );
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [data, style]);

  const applyPreset = (preset: (typeof SHARE_PRESETS)[number]) => {
    setStyle((current) => ({
      ...current,
      bg: preset.bg,
      ink: preset.ink,
      accent: preset.accent,
      block: preset.block,
      onBlock: preset.onBlock,
      phases: preset.phases,
      font: preset.font,
    }));
    setActivePreset(preset.id);
  };

  const changeBackground = (value: string) => {
    const nextInk = readableInk(value);
    setStyle((current) => ({
      ...current,
      bg: value,
      ink: nextInk,
      block: nextInk,
      onBlock: value,
      phases: derivePhases(current.accent, nextInk, value),
    }));
    setActivePreset(null);
  };

  const changeAccent = (value: string) => {
    setStyle((current) => ({
      ...current,
      accent: value,
      phases: derivePhases(value, current.ink, current.bg),
    }));
    setActivePreset(null);
  };

  const changeBlock = (value: string) => {
    setStyle((current) => ({
      ...current,
      block: value,
      onBlock: readableInk(value),
    }));
    setActivePreset(null);
  };

  const changeFont = (font: ShareFont) => {
    setStyle((current) => ({ ...current, font }));
    setActivePreset(null);
  };

  const changeFormat = (format: ShareFormat) => {
    setStyle((current) => ({ ...current, format }));
  };

  const downloadBlob = (image: Blob, fileName: string) => {
    const url = URL.createObjectURL(image);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownload = () => {
    if (!blob) return;
    downloadBlob(
      blob,
      `seduhmanual-${slugifyRecipeName(recipe.name)}.png`
    );
    setStatus("Image downloaded.");
  };

  const handleShare = async () => {
    if (!blob) return;

    const fileName = `seduhmanual-${slugifyRecipeName(recipe.name)}.png`;
    const file = new File([blob], fileName, { type: "image/png" });
    const shareData: ShareData = {
      files: [file],
      title: recipe.name,
      text: `${recipe.name} — ${recipe.beanName}\n\nA custom V60 recipe from seduhmanual.\n${SITE_URL}`,
    };

    if (
      typeof navigator.share === "function" &&
      (typeof navigator.canShare !== "function" ||
        navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
        setStatus("Shared!");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          downloadBlob(blob, fileName);
          setStatus("Sharing failed — downloaded the image instead.");
        }
      }
      return;
    }

    downloadBlob(blob, fileName);
    setStatus("Sharing isn't available here — image downloaded.");
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-recipe-title"
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
          <div>
            <h2
              id="share-recipe-title"
              className="text-lg font-semibold text-ink"
            >
              Share recipe
            </h2>
            <p className="mt-0.5 text-xs text-ink-subtle">
              Create a ready-to-post card. Rendered locally — nothing is
              uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close share dialog"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
          <div className="flex justify-center pt-1">
            <canvas
              ref={canvasRef}
              className="block rounded-xl border border-line shadow-lg"
              style={{ maxHeight: "50vh", width: "auto", maxWidth: "100%" }}
              aria-label={`Share preview for ${recipe.name}`}
            />
          </div>

          <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
              Palette
            </p>
            <div className="flex flex-wrap gap-2">
              {SHARE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  aria-label={preset.name}
                  title={preset.name}
                  aria-pressed={activePreset === preset.id}
                  className={`relative h-9 w-9 rounded-full border border-line/70 transition-transform hover:scale-105 cursor-pointer ${
                    activePreset === preset.id
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                      : ""
                  }`}
                  style={{ backgroundColor: preset.bg }}
                >
                  <span
                    className="absolute inset-1.5 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <ColorField
              label="Background"
              value={style.bg}
              onChange={changeBackground}
            />
            <ColorField
              label="Block"
              value={style.block}
              onChange={changeBlock}
            />
            <ColorField
              label="Accent"
              value={style.accent}
              onChange={changeAccent}
            />
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
              Typeface
            </p>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                active={style.font === "editorial"}
                onClick={() => changeFont("editorial")}
              >
                <span
                  className="text-lg leading-none"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Aa
                </span>
                <span>Editorial</span>
              </OptionButton>
              <OptionButton
                active={style.font === "modern"}
                onClick={() => changeFont("modern")}
              >
                <span
                  className="text-lg font-semibold leading-none"
                  style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
                >
                  Aa
                </span>
                <span>Modern</span>
              </OptionButton>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
              Format
            </p>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                active={style.format === "portrait"}
                onClick={() => changeFormat("portrait")}
              >
                <span className="h-6 w-[19px] rounded-sm border border-current" />
                <span>Portrait 4:5</span>
              </OptionButton>
              <OptionButton
                active={style.format === "square"}
                onClick={() => changeFormat("square")}
              >
                <span className="h-5 w-5 rounded-sm border border-current" />
                <span>Square 1:1</span>
              </OptionButton>
            </div>
          </div>
        </div>
        </div>

        <div className="border-t border-line p-4 sm:p-5">
          <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={!blob}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Share image
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!blob}
            className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-accent-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Download
          </button>
        </div>

        {status && (
          <p className="mt-2 text-center text-xs text-ink-subtle" role="status">
            {status}
          </p>
        )}
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-ink-muted hover:bg-accent-soft/60 hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full cursor-pointer rounded-lg border border-line bg-transparent p-0"
        aria-label={`${label} color`}
      />
    </label>
  );
}
