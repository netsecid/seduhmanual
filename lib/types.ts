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

/**
 * A single step in an N-step experimental brew.
 * Timing is duration-based: start time = sum of all previous steps' durations.
 */
export interface ExperimentalStep {
  id: string;           // crypto.randomUUID() — stable React key
  name: string;         // e.g. "Bloom", "Pour 1", "Steep" — user-editable
  waterAmount: number;  // ml of water for this step
  duration: number;     // seconds this step lasts
  description?: string; // optional technique note
}

/**
 * Free-form experimental brew input.
 * steps[] replaces the old fixed bloom/pour1/pour2 fields.
 */
export interface ExperimentalInput {
  coffeeWeight: number;
  totalWater: number;
  temperature: number;
  grindSize: GrindSize;
  processType: ProcessType;
  brewMode: BrewMode;
  iceWeight: number;
  steps: ExperimentalStep[];
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
  // Optional metadata
  isBuiltIn?: boolean;
  author?: string;
  notes?: string;
  // Present on built-in recipes — their canonical step array
  steps?: ExperimentalStep[];
  // Experimental mode — user-saved custom steps
  isExperimental?: boolean;
  customSteps?: ExperimentalStep[];
  // Custom water temperature (°C) chosen in experimental mode. Optional
  // because standard-mode recipes derive it from processType at brew time,
  // and old saved recipes won't have this field.
  temperature?: number;
}
