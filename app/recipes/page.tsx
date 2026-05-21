"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { SavedRecipe } from "@/lib/types";
import { getRecipes, deleteRecipe, setPendingLoad } from "@/lib/recipes";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const router = useRouter();

  useEffect(() => {
    setRecipes(getRecipes());
  }, []);

  const handleDelete = (id: string) => {
    deleteRecipe(id);
    setRecipes(getRecipes());
  };

  const handleLoad = (recipe: SavedRecipe) => {
    setPendingLoad(recipe);
    router.push("/");
  };

  return (
    <main className="max-w-md mx-auto px-4 py-6 pb-12 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1E0E08]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Recipes
          </h1>
          <p className="text-xs text-[#A07060] mt-0.5">Saved brew profiles</p>
        </div>
        <Link
          href="/"
          className="text-sm text-[#C4622D] font-medium border border-[#C4622D]/30 rounded-xl px-3.5 py-2 hover:bg-[#C4622D] hover:text-white transition-colors duration-150"
        >
          ← Back
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="text-4xl mb-4 text-[#C4622D] font-bold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            ~
          </div>
          <p className="text-sm text-[#6B4B3E] font-medium">No recipes saved yet.</p>
          <p className="text-sm text-[#A07060] mt-1">
            Save your first brew profile from the main page.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 px-5 py-2.5 bg-[#C4622D] text-white text-sm font-semibold rounded-xl hover:bg-[#B05525] transition-colors"
          >
            Go brew something →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDelete}
              onLoad={handleLoad}
            />
          ))}
        </div>
      )}
    </main>
  );
}
