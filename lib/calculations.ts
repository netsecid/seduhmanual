import {
  BrewInput,
  BrewResult,
  BrewStep,
  ExperimentalInput,
  ExperimentalStep,
  ProcessType,
} from "@/lib/types";
import { COFFEE_PROCESSES } from "@/constants/coffeeData";

export function getRecommendedTemp(processType: ProcessType): number {
  const process = COFFEE_PROCESSES.find((p) => p.type === processType);
  return process?.recommendedTemp ?? 91;
}

export function calculateBrew(input: BrewInput): BrewResult {
  const { coffeeWeight, ratio, brewMode, iceWeight, processType } = input;

  const totalWater = Math.round(coffeeWeight * ratio);
  const hotWater = brewMode === "ice" ? totalWater - iceWeight : totalWater;
  const bloomWater = Math.round(coffeeWeight * 2.5);
  const remaining = hotWater - bloomWater;
  const pour1Water = Math.round(remaining * 0.4);
  const pour2Water = remaining - pour1Water;

  return {
    totalWater,
    hotWater,
    bloomWater,
    pour1Water,
    pour2Water,
    recommendedTemp: getRecommendedTemp(processType),
  };
}

export function getBrewSteps(result: BrewResult): BrewStep[] {
  return [
    {
      name: "Bloom",
      startSeconds: 0,
      endSeconds: 45,
      waterAmount: result.bloomWater,
      description: "Saturate grounds evenly, let CO₂ escape",
    },
    {
      name: "Pour 1",
      startSeconds: 45,
      endSeconds: 90,
      waterAmount: result.pour1Water,
      description: "Slow spiral pour from center outward",
    },
    {
      name: "Pour 2",
      startSeconds: 90,
      endSeconds: 150,
      waterAmount: result.pour2Water,
      description: "Final pour — maintain level, let drain",
    },
  ];
}

// ─── Experimental / N-step helpers ──────────────────────────────────────────

/** Sum of all step durations → total brew time in seconds */
export function getTotalSeconds(steps: ExperimentalStep[]): number {
  return steps.reduce((acc, s) => acc + s.duration, 0);
}

/** Compute the absolute start second for each step by stacking durations */
export function getStepStartSeconds(steps: ExperimentalStep[], index: number): number {
  return steps.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
}

/**
 * Convert N ExperimentalSteps → BrewStep[] for the timer.
 * Start times are stacked from each step's duration.
 */
export function getExperimentalSteps(exp: ExperimentalInput): BrewStep[] {
  let cursor = 0;
  return exp.steps.map((s) => {
    const start = cursor;
    cursor += s.duration;
    return {
      name: s.name,
      startSeconds: start,
      endSeconds: cursor,
      waterAmount: s.waterAmount,
      description: s.description ?? "",
    };
  });
}

/**
 * Build a default ExperimentalInput from a standard BrewInput.
 * Seeds 3 steps matching the standard calculator's output.
 */
export function buildExperimentalInput(input: BrewInput): ExperimentalInput {
  const result = calculateBrew(input);
  return {
    coffeeWeight: input.coffeeWeight,
    totalWater: result.totalWater,
    temperature: result.recommendedTemp,
    grindSize: input.grindSize,
    processType: input.processType,
    brewMode: input.brewMode,
    iceWeight: input.iceWeight,
    steps: [
      {
        id: crypto.randomUUID(),
        name: "Bloom",
        waterAmount: result.bloomWater,
        duration: 45,
        description: "Saturate grounds evenly, let CO₂ escape",
      },
      {
        id: crypto.randomUUID(),
        name: "Pour 1",
        waterAmount: result.pour1Water,
        duration: 45,
        description: "Slow spiral pour from center outward",
      },
      {
        id: crypto.randomUUID(),
        name: "Pour 2",
        waterAmount: result.pour2Water,
        duration: 60,
        description: "Final pour — maintain level, let drain",
      },
    ],
  };
}

/**
 * Build an ExperimentalInput from a built-in or saved recipe that carries
 * its own step array. Scales step waterAmounts if coffeeWeight differs.
 */
export function buildExperimentalFromRecipe(
  recipe: {
    coffeeWeight: number;
    totalWater?: number;
    ratio: number;
    grindSize: import("@/lib/types").GrindSize;
    processType: ProcessType;
    brewMode: import("@/lib/types").BrewMode;
    steps: ExperimentalStep[];
    // Optional persisted user choices — when present, override the defaults
    // we'd otherwise derive from process / a hard-coded ice weight.
    temperature?: number;
    iceWeight?: number;
  },
  overrideCoffeeWeight?: number
): ExperimentalInput {
  const coffeeWeight = overrideCoffeeWeight ?? recipe.coffeeWeight;
  const scaleFactor = coffeeWeight / recipe.coffeeWeight;
  const totalWater = recipe.totalWater
    ? Math.round(recipe.totalWater * scaleFactor)
    : Math.round(coffeeWeight * recipe.ratio);

  return {
    coffeeWeight,
    totalWater,
    // Honor the user's saved temperature if present; otherwise fall back to
    // the per-process recommended temp.
    temperature: recipe.temperature ?? getRecommendedTemp(recipe.processType),
    grindSize: recipe.grindSize,
    processType: recipe.processType,
    brewMode: recipe.brewMode,
    // Honor saved iceWeight (scaled to current coffee weight); otherwise the
    // legacy default of 60 g (also scaled).
    iceWeight:
      recipe.iceWeight !== undefined
        ? Math.round(recipe.iceWeight * scaleFactor)
        : Math.round(60 * scaleFactor),
    steps: recipe.steps.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      waterAmount: Math.round(s.waterAmount * scaleFactor),
    })),
  };
}

/** Convenience: derive a display-only BrewResult from ExperimentalInput */
export function experimentalToResult(exp: ExperimentalInput): BrewResult {
  const firstStep = exp.steps[0];
  const secondStep = exp.steps[1];
  const thirdStep = exp.steps[2];
  return {
    totalWater: exp.totalWater,
    hotWater: exp.brewMode === "ice" ? exp.totalWater - exp.iceWeight : exp.totalWater,
    bloomWater: firstStep?.waterAmount ?? 0,
    pour1Water: secondStep?.waterAmount ?? 0,
    pour2Water: thirdStep?.waterAmount ?? 0,
    recommendedTemp: exp.temperature,
  };
}
