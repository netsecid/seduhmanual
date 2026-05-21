import { ProcessType } from "@/lib/types";

export interface CoffeeProcess {
  type: ProcessType;
  tempRange: string;
  flavorNotes: string;
  recommendedTemp: number;
}

export const COFFEE_PROCESSES: CoffeeProcess[] = [
  { type: "Washed",             tempRange: "92–94°C", flavorNotes: "Clean, bright, acidic",          recommendedTemp: 93 },
  { type: "Natural",            tempRange: "88–90°C", flavorNotes: "Fruity, heavy body, sweet",       recommendedTemp: 89 },
  { type: "Honey",              tempRange: "88–90°C", flavorNotes: "Balanced, sweet, mild acidity",   recommendedTemp: 89 },
  { type: "Anaerob",            tempRange: "88–90°C", flavorNotes: "Complex, fermented, winey",       recommendedTemp: 89 },
  { type: "Aerob",              tempRange: "92–94°C", flavorNotes: "Bright, floral, tea-like",        recommendedTemp: 93 },
  { type: "Carbonic Maceration",tempRange: "90–92°C", flavorNotes: "Juicy, candy-like, unique",       recommendedTemp: 91 },
  { type: "Wet-Hulled",         tempRange: "88–90°C", flavorNotes: "Earthy, full body, low acid",     recommendedTemp: 89 },
  { type: "Experimental",       tempRange: "90–92°C", flavorNotes: "Varies — use as default",         recommendedTemp: 91 },
];
