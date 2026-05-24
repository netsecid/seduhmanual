import { SavedRecipe } from "@/lib/types";

/**
 * Curated built-in recipes from well-known specialty coffee brewers.
 * These are loaded on the Recipes page as a permanent "Featured" section
 * and cannot be deleted by the user.
 *
 * Want to contribute a recipe? See CONTRIBUTING.md.
 */
export const BUILTIN_RECIPES: SavedRecipe[] = [
  {
    id: "builtin-hoffmann-ultimate",
    name: "Ultimate V60",
    beanName: "Light-to-medium roast, any origin",
    author: "James Hoffmann",
    processType: "Washed",
    grindSize: "Medium",
    ratio: 17,
    coffeeWeight: 15,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Bloom with 2× coffee weight for 45 s. Then pour in slow spirals to 60 % at 1:00, let draw down, finish the remaining 40 % by 2:00. Target total brew time 3:30–4:00. Grind slightly coarser if it runs slow.",
    createdAt: "",
  },
  {
    id: "builtin-kasuya-46",
    name: "4:6 Method",
    beanName: "Any roast, single-origin recommended",
    author: "Tetsu Kasuya",
    processType: "Washed",
    grindSize: "Medium-Coarse",
    ratio: 15,
    coffeeWeight: 20,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Split water 40 % / 60 %. First 40 % (in 2 equal pours, 45 s apart) controls sweetness & acidity. Second 60 % (in 3 equal pours, 45 s apart) controls strength. Each pour ≈ 60 ml for 20 g coffee.",
    createdAt: "",
  },
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
      "Bloom with 2× coffee weight for 40–45 s, giving the bed a gentle swirl at 0:10. Then pour continuously in a tight spiral to 60 % at 1:00, continue to 100 % by 1:30. Drawdown ~2:45–3:00.",
    createdAt: "",
  },
  {
    id: "builtin-hedrick-hybrid",
    name: "Hybrid Immersion",
    beanName: "Versatile — works with any roast",
    author: "Lance Hedrick",
    processType: "Natural",
    grindSize: "Medium",
    ratio: 15,
    coffeeWeight: 15,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "Pour all water within 45 s, then swirl gently. Let steep until ~1:30, then allow full drawdown. Forgiving recipe that produces a full-bodied, sweet cup. Great starting point for naturals.",
    createdAt: "",
  },
  {
    id: "builtin-onyx-washed",
    name: "Percolation Recipe",
    beanName: "High-quality washed Ethiopian or Kenyan",
    author: "Onyx Coffee Lab",
    processType: "Washed",
    grindSize: "Medium-Fine",
    ratio: 16,
    coffeeWeight: 15,
    brewMode: "hot",
    isBuiltIn: true,
    notes:
      "40 g bloom for 30 s, then 3 pours of equal size at 0:30, 1:00, and 1:30. Total brew time ~2:45. Emphasizes clean clarity and brightness in high-clarity washed coffees.",
    createdAt: "",
  },
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
      "Brew concentrated hot coffee directly onto ice in the server. Use ~60 g ice for 15 g coffee. The rapid chilling locks in volatile aromatics and produces a crystal-clear iced cup without dilution.",
    createdAt: "",
  },
];
