export type ThemeId =
  | "auto"
  | "cafe"
  | "paper"
  | "espresso"
  | "single-origin"
  | "cupping-lab";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  /** Preview colors: canvas, ink, accent. */
  swatches: readonly [string, string, string];
  themeColor: string;
}

export const THEME_STORAGE_KEY = "seduhmanual_theme";

export const THEMES: readonly ThemeOption[] = [
  {
    id: "auto",
    name: "Auto",
    description: "Follow system",
    swatches: ["#fafaf8", "#141110", "#c4622d"],
    themeColor: "#fafaf8",
  },
  {
    id: "cafe",
    name: "Cafe",
    description: "Warm & cozy",
    swatches: ["#f8f3ec", "#1e0e08", "#c4622d"],
    themeColor: "#f8f3ec",
  },
  {
    id: "paper",
    name: "Paper",
    description: "Minimal & bright",
    swatches: ["#fafaf8", "#171717", "#a64b24"],
    themeColor: "#fafaf8",
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "Warm & dim",
    swatches: ["#141110", "#f5ede3", "#e08a52"],
    themeColor: "#141110",
  },
  {
    id: "single-origin",
    name: "Single Origin",
    description: "Parchment & forest",
    swatches: ["#f2ebdd", "#21352a", "#a84b27"],
    themeColor: "#f2ebdd",
  },
  {
    id: "cupping-lab",
    name: "Cupping Lab",
    description: "Cool & precise",
    swatches: ["#f3f5f7", "#0f172a", "#0f766e"],
    themeColor: "#f3f5f7",
  },
];

const THEME_COLORS: Record<Exclude<ThemeId, "auto">, string> = {
  cafe: "#f8f3ec",
  paper: "#fafaf8",
  espresso: "#141110",
  "single-origin": "#f2ebdd",
  "cupping-lab": "#f3f5f7",
};

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && THEMES.some((theme) => theme.id === value);
}

/** Browser chrome color; resolves Auto against the system preference. */
export function themeColorFor(theme: ThemeId, prefersDark: boolean): string {
  if (theme === "auto") return prefersDark ? "#141110" : "#fafaf8";
  return THEME_COLORS[theme];
}
