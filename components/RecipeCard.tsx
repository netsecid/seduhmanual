"use client";

import { useState } from "react";
import { SavedRecipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: SavedRecipe;
  onDelete?: (id: string) => void;
  onLoad: (recipe: SavedRecipe) => void;
  onShare?: (recipe: SavedRecipe) => void;
}

export default function RecipeCard({ recipe, onDelete, onLoad, onShare }: RecipeCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  const date = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const stepCount = recipe.steps?.length ?? recipe.customSteps?.length ?? null;

  return (
    <div className="bg-surface rounded-2xl border border-line p-4 space-y-3">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-ink leading-tight truncate">
              {recipe.name}
            </h3>
            {recipe.isExperimental && !recipe.isBuiltIn && (
              <span className="text-[10px] bg-ink text-on-ink px-2 py-0.5 rounded-full font-medium tracking-wide flex-shrink-0">
                Custom
              </span>
            )}
          </div>
          {recipe.author && (
            <p className="text-xs text-accent mt-0.5 font-medium">by {recipe.author}</p>
          )}
          <p className="text-sm text-ink-subtle mt-0.5 truncate">{recipe.beanName}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {date && <span className="text-xs text-ink-subtle">{date}</span>}
          {recipe.notes && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-ink-subtle hover:bg-accent-soft hover:text-accent transition-colors cursor-pointer text-sm"
              aria-label="Show recipe notes"
              title="Method notes"
            >
              {showNotes ? "✕" : "i"}
            </button>
          )}
          {!recipe.isBuiltIn && onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-accent/50 hover:bg-accent-soft hover:text-accent transition-colors cursor-pointer"
              aria-label={`Delete ${recipe.name}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && recipe.notes && (
        <div className="bg-accent-soft border border-line-soft rounded-xl px-3.5 py-3 text-xs text-ink-muted leading-relaxed">
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
        {stepCount !== null && (
          <Tag>{stepCount} step{stepCount !== 1 ? "s" : ""}</Tag>
        )}
      </div>

      {/* Load / Share */}
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(recipe)}
          className="flex-1 py-2.5 text-sm font-semibold text-accent border border-accent/30 rounded-xl hover:bg-accent hover:text-on-accent transition-colors duration-150 cursor-pointer"
        >
          Load Recipe →
        </button>
        {!recipe.isBuiltIn && onShare && (
          <button
            onClick={() => onShare(recipe)}
            className="px-4 py-2.5 text-sm font-semibold text-ink-muted border border-line rounded-xl hover:bg-accent-soft hover:text-accent transition-colors duration-150 cursor-pointer"
            aria-label={`Share ${recipe.name}`}
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-accent-soft text-accent px-2.5 py-0.5 rounded-full border border-line-soft">
      {children}
    </span>
  );
}
