import { calculateBrew, getBrewSteps, getRecommendedTemp } from "@/lib/calculations";
import type { BrewInput, SavedRecipe } from "@/lib/types";

export type ShareFormat = "portrait" | "square";
export type ShareFont = "editorial" | "modern";

export const SITE_URL = "https://seduhmanual.vercel.app";

export interface ShareStyle {
  bg: string;
  ink: string;
  accent: string;
  block: string;
  onBlock: string;
  phases: [string, string, string];
  font: ShareFont;
  format: ShareFormat;
}

export interface SharePreset {
  id: string;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  block: string;
  onBlock: string;
  phases: [string, string, string];
  font: ShareFont;
}

export const SHARE_PRESETS: readonly SharePreset[] = [
  {
    id: "cafe",
    name: "Cafe",
    bg: "#f8f3ec",
    ink: "#1e0e08",
    accent: "#c4622d",
    block: "#1e0e08",
    onBlock: "#f8f3ec",
    phases: ["#c4622d", "#2e7d5b", "#c59a2b"],
    font: "editorial",
  },
  {
    id: "paper",
    name: "Paper",
    bg: "#fafaf8",
    ink: "#171717",
    accent: "#a64b24",
    block: "#171717",
    onBlock: "#fafaf8",
    phases: ["#b4552d", "#2f6f53", "#a67c1f"],
    font: "modern",
  },
  {
    id: "espresso",
    name: "Espresso",
    bg: "#141110",
    ink: "#f5ede3",
    accent: "#e08a52",
    block: "#0d0b0a",
    onBlock: "#f5ede3",
    phases: ["#e08a52", "#6fbf95", "#e3b85a"],
    font: "editorial",
  },
  {
    id: "single-origin",
    name: "Single Origin",
    bg: "#f2ebdd",
    ink: "#21352a",
    accent: "#a84b27",
    block: "#21352a",
    onBlock: "#f2ebdd",
    phases: ["#a84b27", "#476b52", "#a87b2a"],
    font: "editorial",
  },
  {
    id: "cupping-lab",
    name: "Cupping Lab",
    bg: "#f3f5f7",
    ink: "#0f172a",
    accent: "#0f766e",
    block: "#0f172a",
    onBlock: "#f3f5f7",
    phases: ["#0f766e", "#b45309", "#2563eb"],
    font: "modern",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#0e1116",
    ink: "#e6eaf0",
    accent: "#f59e0b",
    block: "#080b0f",
    onBlock: "#e6eaf0",
    phases: ["#f59e0b", "#60a5fa", "#a3e635"],
    font: "modern",
  },
  {
    id: "blush",
    name: "Blush",
    bg: "#f4e4de",
    ink: "#2a1713",
    accent: "#b4553f",
    block: "#2a1713",
    onBlock: "#f4e4de",
    phases: ["#b4553f", "#7a5268", "#a87b2a"],
    font: "editorial",
  },
];

export interface ShareStep {
  name: string;
  waterAmount: number;
  cumulative: number;
  startSeconds: number;
  endSeconds: number;
}

export interface ShareCardData {
  name: string;
  beanName: string;
  processType: string;
  grindSize: string;
  ratio: number;
  coffeeWeight: number;
  totalWater: number;
  temperature: number;
  brewMode: "hot" | "ice";
  iceWeight?: number;
  isExperimental: boolean;
  steps: ShareStep[];
}

const BODY_FONT = '"DM Sans", system-ui, -apple-system, sans-serif';
const EDITORIAL_FONT = '"Playfair Display", Georgia, serif';
const MODERN_FONT = BODY_FONT;

/** Build the content shown on a share card from a saved custom recipe. */
export function buildShareCardData(recipe: SavedRecipe): ShareCardData {
  const isExperimental = Boolean(
    recipe.isExperimental && recipe.customSteps?.length
  );
  const temperature =
    recipe.temperature ?? getRecommendedTemp(recipe.processType);

  let steps: ShareStep[] = [];
  let totalWater = 0;

  if (isExperimental) {
    let time = 0;
    let water = 0;
    steps = recipe.customSteps!.map((step) => {
      const startSeconds = time;
      time += step.duration;
      water += step.waterAmount;
      return {
        name: step.name,
        waterAmount: step.waterAmount,
        cumulative: water,
        startSeconds,
        endSeconds: time,
      };
    });
    totalWater = water;
  } else {
    const input: BrewInput = {
      coffeeWeight: recipe.coffeeWeight,
      ratio: recipe.ratio,
      grindSize: recipe.grindSize,
      brewMode: recipe.brewMode,
      iceWeight: recipe.iceWeight ?? 60,
      processType: recipe.processType,
    };
    const result = calculateBrew(input);
    totalWater = result.totalWater;

    let water = 0;
    steps = getBrewSteps(result).map((step) => {
      water += step.waterAmount;
      return {
        name: step.name,
        waterAmount: step.waterAmount,
        cumulative: water,
        startSeconds: step.startSeconds,
        endSeconds: step.endSeconds,
      };
    });
  }

  return {
    name: recipe.name,
    beanName: recipe.beanName,
    processType: recipe.processType,
    grindSize: recipe.grindSize,
    ratio: recipe.ratio,
    coffeeWeight: recipe.coffeeWeight,
    totalWater,
    temperature,
    brewMode: recipe.brewMode,
    iceWeight: recipe.iceWeight,
    isExperimental,
    steps,
  };
}

export function readableInk(background: string): string {
  const dark = "#171717";
  const light = "#f8f3ec";
  return contrastRatio(background, light) >= contrastRatio(background, dark)
    ? light
    : dark;
}

export function derivePhases(
  accent: string,
  ink: string,
  bg: string
): [string, string, string] {
  return [accent, mixHex(accent, ink, 0.35), mixHex(accent, bg, 0.35)];
}

export function slugifyRecipeName(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "recipe"
  );
}

/** Render a 1080px-wide Block Poster share card into the given canvas. */
export function drawShareCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
  style: ShareStyle
): void {
  const square = style.format === "square";
  const W = 1080;
  const H = square ? 1080 : 1350;
  const M = square ? 64 : 80;
  const blockH = square ? 300 : 420;

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const displayFont = style.font === "editorial" ? EDITORIAL_FONT : MODERN_FONT;
  const { bg, ink, accent, block, onBlock, phases } = style;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Title block.
  ctx.fillStyle = block;
  ctx.fillRect(0, 0, W, blockH);
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(W - 10, 60, square ? 220 : 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // A faint dripper watermark and a colored edge separate the block from the body.
  ctx.save();
  ctx.globalAlpha = 0.035;
  const watermarkSize = square ? 150 : 200;
  drawDripper(
    ctx,
    W - (square ? 200 : 260),
    blockH - (square ? 190 : 270),
    watermarkSize,
    onBlock,
    onBlock
  );
  ctx.restore();

  ctx.fillStyle = accent;
  ctx.fillRect(0, blockH - 4, W, 4);

  // Brand on the block.
  const logoSize = square ? 44 : 50;
  drawDripper(ctx, M, M - 6, logoSize, accent, onBlock);
  const textX = M + logoSize + 18;

  ctx.fillStyle = onBlock;
  setFont(ctx, 600, square ? 26 : 30, displayFont);
  ctx.fillText("seduhmanual", textX, M + 18);

  ctx.globalAlpha = 0.65;
  setFont(ctx, 400, square ? 14 : 16, BODY_FONT);
  ctx.fillText("V60 recipes and calculator", textX, M + 40);
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.7;
  ctx.textAlign = "right";
  setFont(ctx, 600, 14, BODY_FONT);
  ctx.fillText(
    data.isExperimental ? "EXPERIMENTAL RECIPE" : "CUSTOM RECIPE",
    W - M,
    M + 22
  );
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  // Recipe name + bean, anchored to the bottom of the block.
  const maxNameWidth = W - M * 2;
  let nameSize = square ? 62 : 74;
  let nameLines: string[] = [];

  while (nameSize >= 44) {
    setFont(ctx, 700, nameSize, displayFont);
    nameLines = wrapText(ctx, data.name, maxNameWidth);
    if (nameLines.length <= 2) break;
    nameSize -= 4;
  }
  if (nameLines.length > 2) {
    nameLines = nameLines.slice(0, 2);
    nameLines[1] = `${nameLines[1].replace(/\s+\S*$/, "")}…`;
  }

  const nameLineHeight = nameSize * 1.03;
  const beanBaseline = blockH - (square ? 34 : 64);
  const titleLastBaseline = beanBaseline - (square ? 26 : 36);
  const titleFirstBaseline =
    titleLastBaseline - (nameLines.length - 1) * nameLineHeight;

  ctx.fillStyle = onBlock;
  setFont(ctx, 700, nameSize, displayFont);
  nameLines.forEach((line, index) => {
    ctx.fillText(line, M, titleFirstBaseline + index * nameLineHeight);
  });

  const processIncluded = data.beanName
    .toLowerCase()
    .includes(data.processType.toLowerCase());
  const beanText = processIncluded
    ? data.beanName
    : `${data.beanName} · ${data.processType}`;
  const beanSize = fitFontSize(
    ctx,
    beanText,
    maxNameWidth,
    BODY_FONT,
    400,
    square ? 23 : 26,
    16
  );
  ctx.globalAlpha = 0.7;
  setFont(ctx, 400, beanSize, BODY_FONT);
  ctx.fillText(beanText, M, beanBaseline);
  ctx.globalAlpha = 1;

  // Water hero.
  const contentTop = blockH + (square ? 48 : 64);
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = ink;
  setFont(ctx, 600, 14, BODY_FONT);
  ctx.fillText("TOTAL WATER", M, contentTop);
  ctx.globalAlpha = 1;

  const waterSize = square ? 70 : 80;
  const waterUnitSize = square ? 26 : 30;
  const waterText = String(data.totalWater);
  ctx.fillStyle = ink;
  setFont(ctx, 700, waterSize, displayFont);
  const waterWidth = ctx.measureText(waterText).width;
  ctx.fillText(waterText, M, contentTop + (square ? 64 : 82));

  ctx.globalAlpha = 0.65;
  setFont(ctx, 600, waterUnitSize, displayFont);
  ctx.fillText("ml", M + waterWidth + 10, contentTop + (square ? 64 : 82));
  ctx.globalAlpha = 1;

  // Metrics grid.
  const gridX = square ? 370 : 410;
  const gridY = contentTop;
  const colW = (W - M - gridX) / 3;
  const metricRowH = square ? 90 : 94;
  const modeLabel =
    data.brewMode === "ice"
      ? data.iceWeight
        ? `Ice · ${data.iceWeight}g`
        : "Ice"
      : "Hot";
  const metrics: Array<[string, string]> = [
    ["RATIO", `1:${data.ratio}`],
    ["DOSE", `${data.coffeeWeight}g`],
    ["TEMP", `${data.temperature}°C`],
    ["GRIND", data.grindSize],
    ["MODE", modeLabel],
    ["TIME", formatTime(
      data.steps.reduce(
        (sum, step) => sum + (step.endSeconds - step.startSeconds),
        0
      )
    )],
  ];

  metrics.forEach(([label, value], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = gridX + col * colW;
    const y = gridY + row * metricRowH;

    ctx.globalAlpha = 0.62;
    ctx.fillStyle = ink;
    setFont(ctx, 600, 14, BODY_FONT);
    ctx.fillText(label, x, y);
    ctx.globalAlpha = 1;

    const valueSize = fitFontSize(
      ctx,
      value,
      colW - 20,
      displayFont,
      600,
      square ? 30 : 32,
      18
    );
    ctx.fillStyle = ink;
    setFont(ctx, 600, valueSize, displayFont);
    ctx.fillText(value, x, y + (square ? 34 : 40));
  });

  // Phase timeline.
  const timelineLabelY = contentTop + (square ? 172 : 206);
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = ink;
  setFont(ctx, 600, square ? 13 : 14, BODY_FONT);
  ctx.fillText("BREW TIMELINE", M, timelineLabelY);
  ctx.globalAlpha = 1;

  const barY = timelineLabelY + 22;
  const barH = square ? 12 : 14;
  const barW = W - M * 2;
  const totalDuration =
    data.steps.reduce((sum, s) => sum + (s.endSeconds - s.startSeconds), 0) ||
    1;
  let cursor = M;

  data.steps.forEach((step, index) => {
    const duration = step.endSeconds - step.startSeconds;
    const segmentW = Math.max(8, (duration / totalDuration) * barW - 6);
    ctx.fillStyle = phases[index % phases.length];
    roundedRect(ctx, cursor, barY, segmentW, barH, barH / 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = ink;
    setFont(ctx, 600, square ? 14 : 17, BODY_FONT);
    ctx.fillText(step.name, cursor, barY + (square ? 34 : 42));
    ctx.globalAlpha = 1;

    cursor += segmentW + 6;
  });

  // Step ledger.
  const stepsTop = timelineLabelY + (square ? 88 : 96);
  const footerLineY = H - (square ? 80 : 104);
  const ctaH = square ? 96 : 112;
  const ctaTop = footerLineY - 12 - ctaH;
  const available = ctaTop - stepsTop - 12;
  const maxRows = Math.max(1, Math.floor(available / 46));
  const visibleSteps = data.steps.slice(0, Math.min(data.steps.length, maxRows));
  const moreCount = data.steps.length - visibleSteps.length;
  const rowCount = visibleSteps.length + (moreCount > 0 ? 1 : 0);
  const rowH = Math.min(100, available / rowCount);
  const stepNameSize = Math.max(18, Math.min(31, rowH * 0.46));
  const stepWaterSize = Math.max(15, Math.min(20, rowH * 0.3));
  const stepTimeSize = Math.max(16, Math.min(27, rowH * 0.38));

  visibleSteps.forEach((step, index) => {
    const top = stepsTop + index * rowH;
    const mid = top + rowH / 2;

    ctx.beginPath();
    ctx.arc(M + 19, mid, 19, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(accent, 0.16);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFont(ctx, 600, 14, BODY_FONT);
    ctx.fillText(String(index + 1), M + 19, mid + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = ink;
    setFont(ctx, 600, stepNameSize, BODY_FONT);
    ctx.fillText(step.name, M + 52, mid + 2);

    ctx.globalAlpha = 0.68;
    setFont(ctx, 400, stepWaterSize, BODY_FONT);
    const waterLabel =
      step.waterAmount > 0
        ? `${step.waterAmount}ml · ${step.cumulative}ml total`
        : "No pour";
    ctx.fillText(waterLabel, M + 320, mid + 2);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.8;
    ctx.textAlign = "right";
    setFont(ctx, 500, stepTimeSize, BODY_FONT);
    ctx.fillText(
      `${formatTime(step.startSeconds)}–${formatTime(step.endSeconds)}`,
      W - M,
      mid + 2
    );
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    if (index < visibleSteps.length - 1 || moreCount > 0) {
      ctx.strokeStyle = withAlpha(ink, 0.08);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(M, top + rowH);
      ctx.lineTo(W - M, top + rowH);
      ctx.stroke();
    }
  });

  if (moreCount > 0) {
    const top = stepsTop + visibleSteps.length * rowH;
    ctx.fillStyle = withAlpha(accent, 0.8);
    setFont(ctx, 500, 18, BODY_FONT);
    ctx.fillText(
      `+${moreCount} more step${moreCount === 1 ? "" : "s"}`,
      M + 48,
      top + rowH / 2 + 6
    );
  }

  // CTA block.
  drawCta(ctx, M, ctaTop, W - M * 2, ctaH, accent, displayFont, square);

  // Footer.
  ctx.strokeStyle = withAlpha(ink, 0.15);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(M, footerLineY);
  ctx.lineTo(W - M, footerLineY);
  ctx.stroke();

  const footerBaseline = H - (square ? 40 : 52);
  drawDripper(ctx, M, footerBaseline - 28, 28, accent, ink);

  ctx.fillStyle = ink;
  setFont(ctx, 600, square ? 22 : 26, displayFont);
  ctx.fillText("seduhmanual", M + 40, footerBaseline);

  ctx.globalAlpha = 0.6;
  ctx.textAlign = "right";
  setFont(ctx, 400, square ? 14 : 16, BODY_FONT);
  ctx.fillText("V60 recipes and calculator", W - M, footerBaseline);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

function drawCta(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string,
  titleFont: string,
  square: boolean
): void {
  const onAccent = readableInk(accent);

  roundedRect(ctx, x, y, w, h, 22);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.strokeStyle = withAlpha(onAccent, 0.2);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const titleY = y + (square ? 30 : 48);
  const titleSize = square ? 24 : 30;
  const urlSize = square ? 17 : 22;

  ctx.fillStyle = onAccent;
  setFont(ctx, 600, titleSize, titleFont);
  ctx.fillText("Make your own recipe", x + 28, titleY);

  ctx.globalAlpha = 0.82;
  setFont(ctx, 500, urlSize, BODY_FONT);
  ctx.fillText(SITE_URL, x + 28, titleY + (square ? 26 : 38));
  ctx.globalAlpha = 1;

  const cx = x + w - 42;
  const cy = y + h / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, square ? 18 : 22, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(onAccent, 0.16);
  ctx.fill();
  ctx.strokeStyle = onAccent;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx + 8, cy);
  ctx.moveTo(cx + 3, cy - 5);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx + 3, cy + 5);
  ctx.stroke();
}

function setFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
  family: string
): void {
  ctx.font = `${weight} ${size}px ${family}`;
}

function drawDripper(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accent: string,
  ink: string
): void {
  const scale = size / 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(15, 16);
  ctx.lineTo(49, 16);
  ctx.lineTo(38, 49);
  ctx.lineTo(26, 49);
  ctx.closePath();
  ctx.fillStyle = accent;
  ctx.fill();

  ctx.strokeStyle = ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(15, 16);
  ctx.lineTo(49, 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(26, 49);
  ctx.lineTo(38, 49);
  ctx.stroke();

  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(24, 16);
  ctx.lineTo(32, 29);
  ctx.lineTo(40, 16);
  ctx.stroke();

  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  family: string,
  weight: number,
  startSize: number,
  minSize: number
): number {
  let size = startSize;
  while (size > minSize) {
    setFont(ctx, weight, size, family);
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return minSize;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;

  if (full.length !== 6 || !/^[0-9a-f]{6}$/i.test(full)) return hex;

  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mixHex(a: string, b: string, amount: number): string {
  const parse = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    const full =
      clean.length === 3
        ? clean
            .split("")
            .map((char) => char + char)
            .join("")
        : clean;
    if (full.length !== 6) return [0, 0, 0];
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const value = (v1: number, v2: number) =>
    Math.round(v1 * (1 - amount) + v2 * amount)
      .toString(16)
      .padStart(2, "0");

  return `#${value(r1, r2)}${value(g1, g2)}${value(b1, b2)}`;
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => char + char)
          .join("")
      : clean;
  if (full.length !== 6) return 0;

  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}
