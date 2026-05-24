import { SavedRecipe, ExperimentalStep } from "@/lib/types";

/**
 * Curated built-in recipes from well-known specialty coffee brewers.
 * Each recipe carries a `steps[]` array with real, accurate timing and water amounts.
 * These load into Experimental Mode so the timer reflects the actual technique.
 *
 * Step timing model: duration-based (each step's start = sum of previous durations).
 *
 * Want to contribute a recipe? See CONTRIBUTING.md.
 * Note: Hario Switch recipes are out of scope — the app has no valve-state step type.
 */

// Helper to create a step without boilerplate
function step(
  name: string,
  waterAmount: number,
  duration: number,
  description?: string
): ExperimentalStep {
  return { id: crypto.randomUUID(), name, waterAmount, duration, description };
}

export interface BuiltinRecipe extends SavedRecipe {
  steps: ExperimentalStep[];
}

export const BUILTIN_RECIPES: BuiltinRecipe[] = [
  // ─── James Hoffmann Ultimate V60 ────────────────────────────────────────────
  // Source: James Hoffmann "The Ultimate V60 Technique" (YouTube / book)
  // 30g / 500ml / 1:16.7 / Medium-Fine / 100°C / ~3:30 total
  {
    id: "builtin-hoffmann-ultimate",
    name: "Ultimate V60",
    beanName: "Light-to-medium roast, any origin",
    author: "James Hoffmann",
    processType: "Washed",
    grindSize: "Medium-Fine",
    ratio: 17,
    coffeeWeight: 30,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Use 100°C water. Bloom with a spiral pour from center outward. After the 240g churning pour, stir gently back and forth. Once enough water drains, give 2–3 gentle swirls. Target total drawdown by 3:30.",
    createdAt: "",
    steps: [
      step("Bloom", 60, 45, "Spiral pour from center outward; swirl gently to saturate"),
      step("Pour 1", 240, 60, "Continuous pour — churn from center then concentrically"),
      step("Stir", 0, 10, "Gentle back-and-forth stir, no whirlpool"),
      step("Pour 2", 200, 50, "Center pour — keep V60 full, maintain steady flow"),
      step("Swirl & Drain", 0, 60, "2–3 gentle swirls; wait for full drawdown"),
    ],
  },

  // ─── Tetsu Kasuya 4:6 Method ────────────────────────────────────────────────
  // Source: honestcoffeeguide.com / Kasuya's original WBC 2016 technique
  // 20g / 300ml / 1:15 / Medium-Coarse / 93°C / ~3:25 total
  // 40% first (controls sweetness/acidity) → 60% second (controls strength)
  {
    id: "builtin-kasuya-46",
    name: "4:6 Method",
    beanName: "Any roast — adjust pour split to taste",
    author: "Tetsu Kasuya",
    processType: "Washed",
    grindSize: "Medium-Coarse",
    ratio: 15,
    coffeeWeight: 20,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "First 40% (2 pours × 60g) controls sweetness & acidity — pour equal amounts for balance, or more in first pour for sweeter cup. Last 60% (2 pours × 90g) controls strength — fewer pours = stronger. Wait for bed to run dry between each pour.",
    createdAt: "",
    steps: [
      step("Bloom",  60, 30, "Spiral pour from center outward; wait for bed to run dry"),
      step("Pour 1", 60, 30, "Second of the first 40%; wait for bed to run dry"),
      step("Pour 2", 90, 30, "First of the second 60%; wait for bed to run dry"),
      step("Pour 3", 90, 55, "Final pour; wait for full drawdown ~3:25"),
    ],
  },

  // ─── Matt Winton Five-Pour (2021 World Brewers Cup) ─────────────────────────
  // Source: honestcoffeeguide.com
  // 20g / 300ml / 1:15 / Medium / 93°C → 88°C (later pours) / ~6:50 total
  {
    id: "builtin-winton-five-pour",
    name: "Five-Pour (2021 WBC)",
    beanName: "Light roast, clean washed recommended",
    author: "Matt Winton",
    processType: "Washed",
    grindSize: "Medium",
    ratio: 15,
    coffeeWeight: 20,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Start at 93°C; drop to 88°C from Pour 3 onward. Pour from a slightly elevated position for extra agitation. Each pour uses an aggressive circular motion from center outward and back. Wait 30s between pours or until bed runs dry. Long drawdown — patience pays off.",
    createdAt: "",
    steps: [
      step("Bloom",  60, 30,  "Circular pour; wet all grounds evenly"),
      step("Pour 1", 60, 30,  "Circular, center outward; wait for bed to run dry"),
      step("Pour 2", 60, 30,  "Switch to 88°C — circular, elevated pour"),
      step("Pour 3", 60, 30,  "Continue at 88°C; wait for bed to run dry"),
      step("Pour 4", 60, 210, "Final pour at 88°C; long drawdown ~3:30"),
    ],
  },

  // ─── April Coffee Roasters Six-Pour ─────────────────────────────────────────
  // Source: honestcoffeeguide.com / April's go-to recipe (2018)
  // 20g / 300ml / 1:15 / Medium-Coarse / 92°C / ~3:20 total
  {
    id: "builtin-april-six-pour",
    name: "Six-Pour",
    beanName: "High-quality washed — Ethiopian or Kenyan ideal",
    author: "April Coffee Roasters",
    processType: "Washed",
    grindSize: "Medium-Coarse",
    ratio: 15,
    coffeeWeight: 20,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Pour aggressively and fast — forceful pours replace stirring for even extraction. Wait between each pour until the coffee bed surface runs dry. Produces balanced, clear coffee with higher TDS than typical V60.",
    createdAt: "",
    steps: [
      step("Bloom",  50, 25, "Concentric pour — aggressive and fast; wait 25s"),
      step("Pour 1", 50, 23, "Fast pour; wait for bed to run dry"),
      step("Pour 2", 50, 23, "Fast pour; wait for bed to run dry"),
      step("Pour 3", 50, 23, "Fast pour; wait for bed to run dry"),
      step("Pour 4", 50, 23, "Fast pour; wait for bed to run dry"),
      step("Pour 5", 50, 43, "Fast pour; wait for full drawdown"),
    ],
  },

  // ─── Scott Rao's V60 ─────────────────────────────────────────────────────────
  // 15g / 225ml / 1:15 / Medium-Fine / 93°C / ~3:00 total
  {
    id: "builtin-rao-method",
    name: "Scott Rao's V60",
    beanName: "Light roast recommended",
    author: "Scott Rao",
    processType: "Washed",
    grindSize: "Medium-Fine",
    ratio: 15,
    coffeeWeight: 15,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Bloom with 2× coffee weight; give bed a gentle swirl at 0:10 to saturate evenly. Then pour in a continuous tight spiral — reach 60% by 1:00 and 100% by 1:30. Target drawdown by ~3:00.",
    createdAt: "",
    steps: [
      step("Bloom",  37, 45,  "2× coffee weight; gentle swirl at 0:10"),
      step("Pour",   188, 45, "Continuous tight spiral — 60% by 1:00, 100% by 1:30"),
      step("Drain",  0,  90,  "Full drawdown — target ~3:00 total"),
    ],
  },

  // ─── Basic Hario V60 ─────────────────────────────────────────────────────────
  // Source: Hario's original basic brew guide
  // 15g / 250ml / 1:16.7 / Medium-Fine / 95°C / ~5:10 total
  {
    id: "builtin-hario-basic",
    name: "Basic V60",
    beanName: "Any roast — great starting point",
    author: "Hario",
    processType: "Washed",
    grindSize: "Medium-Fine",
    ratio: 17,
    coffeeWeight: 15,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Hario's original beginner-friendly guide. Slow and steady main pour — stop when liquid reaches ¾ up the dripper or 2cm from the top. Simple and very repeatable.",
    createdAt: "",
    steps: [
      step("Bloom", 60,  30,  "Saturate all grounds; wait 30s"),
      step("Pour",  190, 280, "Slow circular pour in small spirals; stop at ¾ dripper height; let drain fully"),
    ],
  },

  // ─── Japanese Ice Brew ───────────────────────────────────────────────────────
  // 15g / 225ml hot + 60g ice / Med-Fine / 93°C
  {
    id: "builtin-japanese-ice",
    name: "Japanese Ice Brew",
    beanName: "Bright, fruity beans — washed Ethiopia ideal",
    author: "Traditional",
    processType: "Washed",
    grindSize: "Medium-Fine",
    ratio: 15,
    coffeeWeight: 15,
    brewMode: "ice",
    isBuiltIn: true,
    notes:
      "Add 60g ice to the server before brewing. Brew concentrated hot coffee directly onto the ice — rapid chilling locks in volatile aromatics and produces a crystal-clear cup without dilution.",
    createdAt: "",
    steps: [
      step("Bloom",  37,  45, "Spiral pour; saturate grounds evenly"),
      step("Pour 1", 75,  45, "Slow spiral from center outward"),
      step("Pour 2", 113, 60, "Final pour — maintain level, let drain onto ice"),
    ],
  },
];
