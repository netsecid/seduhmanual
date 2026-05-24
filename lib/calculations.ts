import { BrewInput, BrewResult, BrewStep, ExperimentalInput, ProcessType } from "@/lib/types";
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

/** Build default experimental input from a standard BrewInput */
export function buildExperimentalInput(input: BrewInput): ExperimentalInput {
  const result = calculateBrew(input);
  return {
    coffeeWeight: input.coffeeWeight,
    totalWater: result.totalWater,
    bloomWater: result.bloomWater,
    bloomEnd: 45,
    pour1Water: result.pour1Water,
    pour1End: 90,
    pour2Water: result.pour2Water,
    pour2End: 150,
    temperature: result.recommendedTemp,
    grindSize: input.grindSize,
    processType: input.processType,
    brewMode: input.brewMode,
    iceWeight: input.iceWeight,
  };
}

/** Convert experimental input to BrewStep array for the timer */
export function getExperimentalSteps(exp: ExperimentalInput): BrewStep[] {
  return [
    {
      name: "Bloom",
      startSeconds: 0,
      endSeconds: exp.bloomEnd,
      waterAmount: exp.bloomWater,
      description: "Saturate grounds evenly, let CO₂ escape",
    },
    {
      name: "Pour 1",
      startSeconds: exp.bloomEnd,
      endSeconds: exp.pour1End,
      waterAmount: exp.pour1Water,
      description: "Slow spiral pour from center outward",
    },
    {
      name: "Pour 2",
      startSeconds: exp.pour1End,
      endSeconds: exp.pour2End,
      waterAmount: exp.pour2Water,
      description: "Final pour — maintain level, let drain",
    },
  ];
}

/** Convert experimental input to a BrewResult-shaped object for display */
export function experimentalToResult(exp: ExperimentalInput): BrewResult {
  return {
    totalWater: exp.totalWater,
    hotWater: exp.brewMode === "ice" ? exp.totalWater - exp.iceWeight : exp.totalWater,
    bloomWater: exp.bloomWater,
    pour1Water: exp.pour1Water,
    pour2Water: exp.pour2Water,
    recommendedTemp: exp.temperature,
  };
}
