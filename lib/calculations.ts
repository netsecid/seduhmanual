import { BrewInput, BrewResult, BrewStep, ProcessType } from "@/lib/types";
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
