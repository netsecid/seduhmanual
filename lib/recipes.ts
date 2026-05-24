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

// Overwrite an existing recipe in place (matched by id), preserving its
// position in the list. No-ops if the id isn't found.
export function updateRecipe(updated: SavedRecipe): void {
  const recipes = getRecipes().map((r) =>
    r.id === updated.id ? updated : r
  );
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
 * Accepts both the old `custom*` field format and the new `customSteps[]` format.
 * @param mode "merge" — keeps existing, adds new (deduplicates by id)
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

  // Migrate old format: convert custom* scalar fields → customSteps[] if needed
  const migrated = valid.map(migrateRecipe);

  if (mode === "replace") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return { ok: true, added: migrated.length, skipped: incoming.length - migrated.length };
  }

  const existing = getRecipes();
  const existingIds = new Set(existing.map((r) => r.id));
  const toAdd = migrated.filter((r) => !existingIds.has(r.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...toAdd]));

  return {
    ok: true,
    added: toAdd.length,
    skipped: incoming.length - toAdd.length,
  };
}

/**
 * Migrate a recipe from the old pre-Option-C format (custom* scalar fields)
 * to the new customSteps[] format. No-op if already in new format.
 */
function migrateRecipe(r: SavedRecipe): SavedRecipe {
  // Already in new format or not experimental
  if (!r.isExperimental || r.customSteps) return r;

  // Old format had: customBloomWater, customPour1Water, customPour2Water,
  //                 customBloomEnd, customPour1End, customPour2End, customTemp
  const old = r as SavedRecipe & {
    customBloomWater?: number;
    customPour1Water?: number;
    customPour2Water?: number;
    customBloomEnd?: number;
    customPour1End?: number;
    customPour2End?: number;
  };

  const bloomDur = old.customBloomEnd ?? 45;
  const pour1Dur = (old.customPour1End ?? 90) - bloomDur;
  const pour2Dur = (old.customPour2End ?? 150) - (old.customPour1End ?? 90);

  return {
    ...r,
    customSteps: [
      {
        id: crypto.randomUUID(),
        name: "Bloom",
        waterAmount: old.customBloomWater ?? 0,
        duration: bloomDur,
      },
      {
        id: crypto.randomUUID(),
        name: "Pour 1",
        waterAmount: old.customPour1Water ?? 0,
        duration: Math.max(1, pour1Dur),
      },
      {
        id: crypto.randomUUID(),
        name: "Pour 2",
        waterAmount: old.customPour2Water ?? 0,
        duration: Math.max(1, pour2Dur),
      },
    ],
  };
}
