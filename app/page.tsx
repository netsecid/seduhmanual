"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrewForm from "@/components/BrewForm";
import BrewResult from "@/components/BrewResult";
import BrewTimer from "@/components/BrewTimer";
import { BrewInput } from "@/lib/types";
import { calculateBrew, getBrewSteps } from "@/lib/calculations";
import { saveRecipe, consumePendingLoad } from "@/lib/recipes";

const DEFAULT_INPUT: BrewInput = {
  coffeeWeight: 15,
  ratio: 15,
  grindSize: "Medium",
  brewMode: "hot",
  iceWeight: 60,
  processType: "Washed",
};

export default function HomePage() {
  const [input, setInput] = useState<BrewInput>(DEFAULT_INPUT);
  const [showTimer, setShowTimer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [beanName, setBeanName] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  // Apply recipe loaded from the recipes page
  useEffect(() => {
    const pending = consumePendingLoad();
    if (pending) {
      setInput((prev) => ({
        ...prev,
        ratio: pending.ratio,
        grindSize: pending.grindSize,
        brewMode: pending.brewMode,
        processType: pending.processType,
      }));
    }
  }, []);

  const result = useMemo(() => calculateBrew(input), [input]);
  const steps = useMemo(() => getBrewSteps(result), [result]);

  const handleStartBrew = () => {
    setShowTimer(true);
    setTimerKey((k) => k + 1);
  };

  const handleSave = () => {
    if (!recipeName.trim() || !beanName.trim()) return;
    saveRecipe({
      id: crypto.randomUUID(),
      name: recipeName.trim(),
      beanName: beanName.trim(),
      processType: input.processType,
      grindSize: input.grindSize,
      ratio: input.ratio,
      brewMode: input.brewMode,
      createdAt: new Date().toISOString(),
    });
    setRecipeName("");
    setBeanName("");
    setSavingRecipe(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <main className="max-w-md mx-auto px-4 py-6 pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1E0E08] tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            seduhmanual
          </h1>
          <p className="text-xs text-[#A07060] mt-0.5">V60 Pour-Over Calculator</p>
        </div>
        <Link
          href="/recipes"
          className="text-sm text-[#C4622D] font-medium border border-[#C4622D]/30 rounded-xl px-3.5 py-2 hover:bg-[#C4622D] hover:text-white transition-colors duration-150"
        >
          Recipes
        </Link>
      </div>

      {/* Saved flash */}
      {savedFlash && (
        <div className="bg-[#1E0E08] text-[#F8F3EC] text-sm text-center py-2.5 rounded-xl">
          Recipe saved!
        </div>
      )}

      {/* Form */}
      <BrewForm input={input} onChange={setInput} />

      {/* Results */}
      <BrewResult result={result} input={input} />

      {/* Save recipe */}
      {!savingRecipe ? (
        <button
          onClick={() => setSavingRecipe(true)}
          className="w-full py-2.5 text-sm text-[#6B4B3E] border border-[#D9CBC0] rounded-xl hover:bg-[#EDD9C8]/40 transition-colors duration-150 cursor-pointer"
        >
          + Save as Recipe
        </button>
      ) : (
        <div className="bg-white border border-[#D9CBC0] rounded-2xl p-4 space-y-3">
          <h3
            className="font-semibold text-[#1E0E08]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Save Recipe
          </h3>
          <input
            type="text"
            placeholder="Recipe name (e.g. Morning Bright)"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 text-[#1E0E08] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Bean name / origin"
            value={beanName}
            onChange={(e) => setBeanName(e.target.value)}
            className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 text-[#1E0E08] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!recipeName.trim() || !beanName.trim()}
              className="flex-1 py-2.5 bg-[#C4622D] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#B05525] transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={() => setSavingRecipe(false)}
              className="px-4 py-2.5 border border-[#D9CBC0] rounded-xl text-sm text-[#6B4B3E] hover:bg-[#EDD9C8]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Start Brew / Timer */}
      {!showTimer ? (
        <button
          onClick={handleStartBrew}
          className="w-full py-4 bg-[#1E0E08] text-[#F8F3EC] rounded-2xl font-semibold text-base hover:bg-[#2C1810] transition-colors duration-150 cursor-pointer tracking-wide"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Start Brewing →
        </button>
      ) : (
        <div className="border border-[#D9CBC0] rounded-2xl p-5 bg-white/60">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="font-semibold text-[#1E0E08]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Brew Timer
            </h2>
            <button
              onClick={() => setShowTimer(false)}
              className="text-xs text-[#A07060] hover:text-[#6B4B3E] transition-colors cursor-pointer px-2 py-1"
            >
              ✕ Close
            </button>
          </div>
          <BrewTimer key={timerKey} steps={steps} totalSeconds={150} />
        </div>
      )}
    </main>
  );
}
