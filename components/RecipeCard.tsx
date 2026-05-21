import { SavedRecipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: SavedRecipe;
  onDelete: (id: string) => void;
  onLoad: (recipe: SavedRecipe) => void;
}

export default function RecipeCard({
  recipe,
  onDelete,
  onLoad,
}: RecipeCardProps) {
  const date = new Date(recipe.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-[#D9CBC0] p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-[#1E0E08] leading-tight truncate">
            {recipe.name}
          </h3>
          <p className="text-sm text-[#A07060] mt-0.5 truncate">{recipe.beanName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-[#A07060]">{date}</span>
          <button
            onClick={() => onDelete(recipe.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#C4622D]/50 hover:bg-[#FBF0E9] hover:text-[#C4622D] transition-colors cursor-pointer"
            aria-label={`Delete ${recipe.name}`}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Tag>{recipe.processType}</Tag>
        <Tag>{recipe.grindSize}</Tag>
        <Tag>1:{recipe.ratio}</Tag>
        <Tag>{recipe.brewMode === "ice" ? "Ice Brew" : "Hot"}</Tag>
      </div>

      <button
        onClick={() => onLoad(recipe)}
        className="w-full py-2.5 text-sm font-semibold text-[#C4622D] border border-[#C4622D]/30 rounded-xl hover:bg-[#C4622D] hover:text-white transition-colors duration-150 cursor-pointer"
      >
        Load Recipe
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
