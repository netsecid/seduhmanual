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

/** Download all saved recipes as a JSON file */
export function exportRecipes(): void {
  const recipes = getRecipes();
  const json = JSON.stringify(recipes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `seduhmanual-recipes-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export type ImportResult =
  | { ok: true; added: number; skipped: number }
  | { ok: false; error: string };

/**
 * Import recipes from a JSON file.
 * @param mode "merge" — keeps existing, adds new ones (deduplicates by id)
 *             "replace" — clears all existing recipes first
 */
export function importRecipes(
  jsonText: string,
  mode: "merge" | "replace"
): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "Invalid JSON file." };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: "Expected an array of recipes." };
  }

  const incoming = parsed as SavedRecipe[];
  const required: (keyof SavedRecipe)[] = ["id", "name", "ratio", "grindSize", "brewMode"];
  const valid = incoming.filter((r) => required.every((k) => k in r));

  if (valid.length === 0) {
    return { ok: false, error: "No valid recipes found in file." };
  }

  if (mode === "replace") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return { ok: true, added: valid.length, skipped: incoming.length - valid.length };
  }

  // Merge: deduplicate by id
  const existing = getRecipes();
  const existingIds = new Set(existing.map((r) => r.id));
  const toAdd = valid.filter((r) => !existingIds.has(r.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...toAdd]));

  return {
    ok: true,
    added: toAdd.length,
    skipped: incoming.length - toAdd.length,
  };
}
