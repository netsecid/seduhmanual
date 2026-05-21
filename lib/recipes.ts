import { SavedRecipe } from "@/lib/types";

const STORAGE_KEY = "seduhmanual_recipes";
const PENDING_KEY = "seduhmanual_pending_load";

export function getRecipes(): SavedRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedRecipe[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipe(recipe: SavedRecipe): void {
  const recipes = getRecipes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...recipes, recipe]));
}

export function deleteRecipe(id: string): void {
  const recipes = getRecipes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function setPendingLoad(recipe: SavedRecipe): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(recipe));
}

export function consumePendingLoad(): SavedRecipe | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as SavedRecipe;
  } catch {
    return null;
  }
}
