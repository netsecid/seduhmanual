export type BrewMode = "hot" | "ice";

export type GrindSize =
  | "Extra-Fine"
  | "Fine"
  | "Medium-Fine"
  | "Medium"
  | "Medium-Coarse"
  | "Coarse";

export type ProcessType =
  | "Washed"
  | "Natural"
  | "Honey"
  | "Anaerob"
  | "Aerob"
  | "Carbonic Maceration"
  | "Wet-Hulled"
  | "Experimental";

export interface BrewInput {
  coffeeWeight: number;
  ratio: number;
  grindSize: GrindSize;
  brewMode: BrewMode;
  iceWeight: number;
  processType: ProcessType;
}

export interface BrewResult {
  totalWater: number;
  hotWater: number;
  bloomWater: number;
  pour1Water: number;
  pour2Water: number;
  recommendedTemp: number;
}

export interface BrewStep {
  name: string;
  startSeconds: number;
  endSeconds: number;
  waterAmount: number;
  description: string;
}

/** Free-form experimental brew input — every value is manually controlled */
export interface ExperimentalInput {
  coffeeWeight: number;
  totalWater: number;
  bloomWater: number;
  bloomEnd: number;   // seconds
  pour1Water: number;
  pour1End: number;   // seconds
  pour2Water: number;
  pour2End: number;   // seconds
  temperature: number;
  grindSize: GrindSize;
  processType: ProcessType;
  brewMode: BrewMode;
  iceWeight: number;
}

export interface SavedRecipe {
  id: string;
  name: string;
  beanName: string;
  processType: ProcessType;
  grindSize: GrindSize;
  ratio: number;
  brewMode: BrewMode;
  coffeeWeight: number;
  createdAt: string;
  // Optional metadata
  isBuiltIn?: boolean;
  author?: string;
  notes?: string;
  // Experimental mode — stores custom step values
  isExperimental?: boolean;
  customBloomWater?: number;
  customPour1Water?: number;
  customPour2Water?: number;
  customBloomEnd?: number;
  customPour1End?: number;
  customPour2End?: number;
  customTemp?: number;
}
