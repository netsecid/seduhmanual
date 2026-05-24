"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import { SavedRecipe } from "@/lib/types";
import {
  getRecipes,
  deleteRecipe,
  setPendingLoad,
  exportRecipes,
  importRecipes,
} from "@/lib/recipes";
import { BUILTIN_RECIPES } from "@/lib/builtinRecipes";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importRecipes(text, "merge");
      if (result.ok) {
        setRecipes(getRecipes());
        setImportStatus(
          `✓ Imported ${result.added} recipe${result.added !== 1 ? "s" : ""}${
            result.skipped > 0 ? ` (${result.skipped} already existed)` : ""
          }.`
        );
      } else {
        setImportStatus(`✗ ${result.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <main className="max-w-md mx-auto px-4 py-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1E0E08]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Recipes
          </h1>
          <p className="text-xs text-[#A07060] mt-0.5">Brew profiles & featured methods</p>
        </div>
        <Link
          href="/"
          className="text-sm text-[#C4622D] font-medium border border-[#C4622D]/30 rounded-xl px-3.5 py-2 hover:bg-[#C4622D] hover:text-white transition-colors duration-150"
        >
          ← Back
        </Link>
      </div>

      {/* ── Featured Methods ── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2
            className="text-sm font-semibold text-[#1E0E08]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Featured Methods
          </h2>
          <span className="text-xs text-[#A07060] bg-[#FBF0E9] border border-[#EDD9C8] rounded-full px-2 py-0.5">
            {BUILTIN_RECIPES.length} recipes
          </span>
        </div>
        <p className="text-xs text-[#A07060] -mt-1 leading-relaxed">
          Curated recipes with real step-by-step timing. Loading one opens it in
          Experimental Mode with the correct steps pre-filled. Tap{" "}
          <span className="font-semibold">i</span> to read method notes.
        </p>
        <div className="space-y-3">
          {BUILTIN_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onLoad={handleLoad} />
          ))}
        </div>
      </section>

      <hr className="border-[#EDD9C8]" />

      {/* ── My Recipes ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className="text-sm font-semibold text-[#1E0E08]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              My Recipes
            </h2>
            {recipes.length > 0 && (
              <span className="text-xs text-[#A07060] bg-[#FBF0E9] border border-[#EDD9C8] rounded-full px-2 py-0.5">
                {recipes.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportRecipes}
              disabled={recipes.length === 0}
              className="text-xs text-[#6B4B3E] border border-[#D9CBC0] rounded-lg px-3 py-1.5 hover:bg-[#EDD9C8]/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Download recipes as JSON"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#6B4B3E] border border-[#D9CBC0] rounded-lg px-3 py-1.5 hover:bg-[#EDD9C8]/60 transition-colors cursor-pointer"
              title="Import recipes from JSON"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>

        {importStatus && (
          <div
            className={`text-sm text-center py-2.5 rounded-xl ${
              importStatus.startsWith("✓")
                ? "bg-[#1E0E08] text-[#F8F3EC]"
                : "bg-[#C4622D] text-white"
            }`}
          >
            {importStatus}
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="text-center py-10">
            <div
              className="text-4xl mb-4 text-[#C4622D] font-bold"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              ~
            </div>
            <p className="text-sm text-[#6B4B3E] font-medium">No recipes saved yet.</p>
            <p className="text-sm text-[#A07060] mt-1">
              Brew something, then save it from the main page.
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
      </section>

      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-center gap-3 pt-2 text-xs text-[#A07060]">
      <span>seduhmanual</span>
      <span>·</span>
      <a
        href="https://github.com/netsecid/seduhmanual"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:text-[#1E0E08] transition-colors"
        aria-label="View on GitHub"
      >
        <GitHubIcon />
        GitHub
      </a>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.748-1.026 2.748-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}
