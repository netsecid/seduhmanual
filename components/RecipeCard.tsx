"use client";

import { useState } from "react";
import { SavedRecipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: SavedRecipe;
  onDelete?: (id: string) => void;
  onLoad: (recipe: SavedRecipe) => void;
}

export default function RecipeCard({ recipe, onDelete, onLoad }: RecipeCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  const date = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#D9CBC0] p-4 space-y-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-[#1E0E08] leading-tight truncate">
              {recipe.name}
            </h3>
            {recipe.isExperimental && (
              <span className="text-[10px] bg-[#1E0E08] text-[#F8F3EC] px-2 py-0.5 rounded-full font-medium tracking-wide flex-shrink-0">
                Experimental
              </span>
            )}
          </div>
          {recipe.author ? (
            <p className="text-xs text-[#C4622D] mt-0.5 font-medium">by {recipe.author}</p>
          ) : null}
          <p className="text-sm text-[#A07060] mt-0.5 truncate">{recipe.beanName}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {date && <span className="text-xs text-[#A07060]">{date}</span>}
          {recipe.notes && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#A07060] hover:bg-[#FBF0E9] hover:text-[#C4622D] transition-colors cursor-pointer text-sm"
              aria-label="Show recipe notes"
              title="Notes"
            >
              {showNotes ? "✕" : "i"}
            </button>
          )}
          {!recipe.isBuiltIn && onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#C4622D]/50 hover:bg-[#FBF0E9] hover:text-[#C4622D] transition-colors cursor-pointer"
              aria-label={`Delete ${recipe.name}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && recipe.notes && (
        <div className="bg-[#FBF0E9] border border-[#EDD9C8] rounded-xl px-3.5 py-3 text-xs text-[#6B4B3E] leading-relaxed">
          {recipe.notes}
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Tag>{recipe.processType}</Tag>
        <Tag>{recipe.grindSize}</Tag>
        <Tag>1:{recipe.ratio}</Tag>
        <Tag>{recipe.brewMode === "ice" ? "Ice Brew" : "Hot"}</Tag>
        {recipe.coffeeWeight ? <Tag>{recipe.coffeeWeight}g</Tag> : null}
      </div>

      {/* Load button */}
      <button
        onClick={() => onLoad(recipe)}
        className="w-full py-2.5 text-sm font-semibold text-[#C4622D] border border-[#C4622D]/30 rounded-xl hover:bg-[#C4622D] hover:text-white transition-colors duration-150 cursor-pointer"
      >
        Load Recipe →
      </button>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-[#FBF0E9] text-[#C4622D] px-2.5 py-0.5 rounded-full border border-[#EDD9C8]">
      {children}
    </span>
  );
}
