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

export interface SavedRecipe {
  id: string;
  name: string;
  beanName: string;
  processType: ProcessType;
  grindSize: GrindSize;
  ratio: number;
  brewMode: BrewMode;
  coffeeWeight: number;
  // Only meaningful when brewMode === "ice"; optional for backwards
  // compatibility with recipes saved before this field existed.
  iceWeight?: number;
  createdAt: string;
}
