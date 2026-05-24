"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrewForm from "@/components/BrewForm";
import BrewResult from "@/components/BrewResult";
import BrewTimer from "@/components/BrewTimer";
import ExperimentalForm from "@/components/ExperimentalForm";
import { BrewInput, ExperimentalInput, SavedRecipe } from "@/lib/types";
import {
  calculateBrew,
  getBrewSteps,
  buildExperimentalInput,
  buildExperimentalFromRecipe,
  getExperimentalSteps,
  getTotalSeconds,
} from "@/lib/calculations";
import {
  saveRecipe,
  updateRecipe,
  consumePendingLoad,
} from "@/lib/recipes";

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
  const [isExperimental, setIsExperimental] = useState(false);
  const [expInput, setExpInput] = useState<ExperimentalInput>(() =>
    buildExperimentalInput(DEFAULT_INPUT)
  );

  const [showTimer, setShowTimer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [beanName, setBeanName] = useState("");
  const [savedFlash, setSavedFlash] = useState<
    null | "saved" | "updated"
  >(null);
  // The recipe currently loaded from the Recipes page, if any. Enables the
  // "Update Recipe" action — cleared once the user saves a *new* recipe
  // (forking) or has nothing to overwrite.
  const [loadedRecipe, setLoadedRecipe] = useState<SavedRecipe | null>(null);

  // Apply recipe loaded from the recipes page
  useEffect(() => {
    const pending = consumePendingLoad();
    if (!pending) return;

    // Built-in or experimental recipe with real steps
    if (pending.steps || pending.customSteps) {
      const steps = pending.steps ?? pending.customSteps!;
      setExpInput(
        buildExperimentalFromRecipe({
          coffeeWeight: pending.coffeeWeight ?? 15,
          totalWater: Math.round((pending.coffeeWeight ?? 15) * pending.ratio),
          ratio: pending.ratio,
          grindSize: pending.grindSize,
          processType: pending.processType,
          brewMode: pending.brewMode,
          steps,
          // Carry forward saved-user choices so they survive the round-trip.
          temperature: pending.temperature,
          iceWeight: pending.iceWeight,
        })
      );
      setIsExperimental(true);
      // Only enable Update Recipe for user-saved experimental recipes —
      // built-ins live in a separate list that updateRecipe() can't reach.
      if (!pending.isBuiltIn) {
        setLoadedRecipe(pending);
      }
    } else {
      // Standard saved recipe — load into calculator mode.
      // Legacy recipes saved before coffeeWeight/iceWeight existed will be
      // undefined; fall back to the current form value so the load is
      // non-destructive.
      setInput((prev) => ({
        ...prev,
        coffeeWeight: pending.coffeeWeight ?? prev.coffeeWeight,
        ratio: pending.ratio,
        grindSize: pending.grindSize,
        brewMode: pending.brewMode,
        processType: pending.processType,
        iceWeight: pending.iceWeight ?? prev.iceWeight,
      }));
      setIsExperimental(false);
      setLoadedRecipe(pending);
    }
  }, []);

  const flashFor = (kind: "saved" | "updated") => {
    setSavedFlash(kind);
    setTimeout(() => setSavedFlash(null), 2000);
  };

  const result = useMemo(() => calculateBrew(input), [input]);
  const steps = useMemo(() => getBrewSteps(result), [result]);

  const expSteps = useMemo(() => getExperimentalSteps(expInput), [expInput]);
  const expTotalSeconds = useMemo(() => getTotalSeconds(expInput.steps), [expInput.steps]);

  const activeSteps = isExperimental ? expSteps : steps;
  const activeTotalSeconds = isExperimental ? expTotalSeconds : 150;

  const handleToggleExperimental = () => {
    if (!isExperimental) {
      setExpInput(buildExperimentalInput(input));
      setShowTimer(false);
    }
    setIsExperimental((v) => !v);
  };

  const handleStartBrew = () => {
    setShowTimer(true);
    setTimerKey((k) => k + 1);
  };

  const handleSave = () => {
    if (!recipeName.trim() || !beanName.trim()) return;

    if (isExperimental) {
      saveRecipe({
        id: crypto.randomUUID(),
        name: recipeName.trim(),
        beanName: beanName.trim(),
        processType: expInput.processType,
        grindSize: expInput.grindSize,
        ratio: expInput.coffeeWeight > 0
          ? Math.round(expInput.totalWater / expInput.coffeeWeight)
          : 15,
        brewMode: expInput.brewMode,
        coffeeWeight: expInput.coffeeWeight,
        // Persist iceWeight only for ice-brew recipes; hot brews don't use it.
        ...(expInput.brewMode === "ice" && { iceWeight: expInput.iceWeight }),
        isExperimental: true,
        customSteps: expInput.steps,
        // Persist user's chosen temperature — otherwise it's silently lost
        // on reload and gets re-derived from processType.
        temperature: expInput.temperature,
        createdAt: new Date().toISOString(),
      });
    } else {
      saveRecipe({
        id: crypto.randomUUID(),
        name: recipeName.trim(),
        beanName: beanName.trim(),
        processType: input.processType,
        grindSize: input.grindSize,
        ratio: input.ratio,
        brewMode: input.brewMode,
        coffeeWeight: input.coffeeWeight,
        // Persist iceWeight only for ice-brew recipes; hot brews don't use it.
        ...(input.brewMode === "ice" && { iceWeight: input.iceWeight }),
        createdAt: new Date().toISOString(),
      });
    }

    setRecipeName("");
    setBeanName("");
    setSavingRecipe(false);
    // Saving-as-new forks from the loaded recipe; clear the loaded reference
    // so subsequent edits don't accidentally overwrite the original.
    setLoadedRecipe(null);
    flashFor("saved");
  };

  // Overwrite the currently-loaded recipe in place — keeps its id, name,
  // beanName, and createdAt, updates everything else from whichever form
  // (standard or experimental) is currently active.
  const handleUpdate = () => {
    if (!loadedRecipe) return;

    // Preserve only the identity fields from the original; rebuild the rest
    // from the active mode so toggling modes before Update doesn't silently
    // drop the user's edits.
    const identity = {
      id: loadedRecipe.id,
      name: loadedRecipe.name,
      beanName: loadedRecipe.beanName,
      createdAt: loadedRecipe.createdAt,
      // Preserve metadata that only applies to certain recipe kinds.
      ...(loadedRecipe.author !== undefined && { author: loadedRecipe.author }),
      ...(loadedRecipe.notes !== undefined && { notes: loadedRecipe.notes }),
    };

    const updated: SavedRecipe = isExperimental
      ? {
          ...identity,
          processType: expInput.processType,
          grindSize: expInput.grindSize,
          ratio:
            expInput.coffeeWeight > 0
              ? Math.round(expInput.totalWater / expInput.coffeeWeight)
              : 15,
          brewMode: expInput.brewMode,
          coffeeWeight: expInput.coffeeWeight,
          ...(expInput.brewMode === "ice"
            ? { iceWeight: expInput.iceWeight }
            : {}),
          isExperimental: true,
          customSteps: expInput.steps,
          temperature: expInput.temperature,
        }
      : {
          ...identity,
          processType: input.processType,
          grindSize: input.grindSize,
          ratio: input.ratio,
          brewMode: input.brewMode,
          coffeeWeight: input.coffeeWeight,
          ...(input.brewMode === "ice" ? { iceWeight: input.iceWeight } : {}),
          // Explicitly NOT carrying isExperimental/customSteps/temperature —
          // if the user converted an experimental recipe to standard via
          // mode toggle, those fields should be dropped.
        };

    updateRecipe(updated);
    setLoadedRecipe(updated);
    flashFor("updated");
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
          {savedFlash === "updated" ? "Recipe updated!" : "Recipe saved!"}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#6B4B3E] uppercase tracking-wider">
          {isExperimental ? "Experimental Mode" : "Calculator Mode"}
        </span>
        <button
          onClick={handleToggleExperimental}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
            isExperimental ? "bg-[#1E0E08]" : "bg-[#D9CBC0]"
          }`}
          aria-label="Toggle experimental mode"
          role="switch"
          aria-checked={isExperimental}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              isExperimental ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Form */}
      {isExperimental ? (
        <ExperimentalForm value={expInput} onChange={setExpInput} />
      ) : (
        <>
          <BrewForm input={input} onChange={setInput} />
          <BrewResult result={result} input={input} />
        </>
      )}

      {/* Experimental: dynamic N-step summary */}
      {isExperimental && (
        <div className="bg-[#FBF0E9] rounded-2xl p-4 border border-[#EDD9C8] space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#6B4B3E] uppercase tracking-wider">
              Recipe Summary
            </p>
            <span className="text-xs text-[#A07060]">
              {expInput.steps.length} step{expInput.steps.length !== 1 ? "s" : ""} ·{" "}
              {formatTime(expTotalSeconds)} total
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <SummaryCell label="Total" value={`${expInput.totalWater}ml`} />
            <SummaryCell label="Temp" value={`${expInput.temperature}°C`} accent />
            <SummaryCell
              label="Ratio"
              value={
                expInput.coffeeWeight > 0
                  ? `1:${Math.round(expInput.totalWater / expInput.coffeeWeight)}`
                  : "—"
              }
            />
          </div>
          {/* Dynamic step rows */}
          <div className="pt-2 border-t border-[#EDD9C8] space-y-1 text-sm">
            {expInput.steps.map((s, i) => {
              let cursor = 0;
              for (let j = 0; j < i; j++) cursor += expInput.steps[j].duration;
              const startSec = cursor;
              const endSec = cursor + s.duration;
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-[#6B4B3E] truncate mr-2">{s.name}</span>
                  <span className="text-[#1E0E08] font-medium tabular-nums flex-shrink-0">
                    {s.waterAmount}ml{" "}
                    <span className="text-[#A07060] text-xs font-normal">
                      {formatTime(startSec)}–{formatTime(endSec)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save / Update recipe */}
      {!savingRecipe ? (
        loadedRecipe ? (
          // Recipe was loaded — give both Update (overwrite) and Save-as-new.
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={savedFlash === "updated"}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors duration-150 cursor-pointer ${
                  savedFlash === "updated"
                    ? "bg-[#2E7D5B] border-[#2E7D5B] text-white cursor-default"
                    : "bg-[#C4622D] border-[#C4622D] text-white hover:bg-[#B05525]"
                }`}
                title={`Overwrite "${loadedRecipe.name}"`}
                aria-live="polite"
              >
                {savedFlash === "updated" ? "✓ Updated" : "Update Recipe"}
              </button>
              <button
                onClick={() => setSavingRecipe(true)}
                className="flex-1 py-2.5 text-sm text-[#6B4B3E] border border-[#D9CBC0] rounded-xl hover:bg-[#EDD9C8]/40 transition-colors duration-150 cursor-pointer"
              >
                + Save as Recipe
              </button>
            </div>
            {/* Context line so users know *which* recipe Update overwrites. */}
            <p className="text-xs text-[#A07060] text-center">
              {savedFlash === "updated" ? (
                <span className="text-[#2E7D5B] font-medium">
                  Saved changes to &ldquo;{loadedRecipe.name}&rdquo;
                </span>
              ) : (
                <>
                  Editing <span className="font-medium text-[#6B4B3E]">&ldquo;{loadedRecipe.name}&rdquo;</span>
                </>
              )}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setSavingRecipe(true)}
            className="w-full py-2.5 text-sm text-[#6B4B3E] border border-[#D9CBC0] rounded-xl hover:bg-[#EDD9C8]/40 transition-colors duration-150 cursor-pointer"
          >
            + Save as Recipe
          </button>
        )
      ) : (
        <div className="bg-white border border-[#D9CBC0] rounded-2xl p-4 space-y-3">
          <h3
            className="font-semibold text-[#1E0E08]"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Save Recipe{isExperimental ? " (Experimental)" : ""}
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
          <BrewTimer
            key={timerKey}
            steps={activeSteps}
            totalSeconds={activeTotalSeconds}
          />
        </div>
      )}

      <Footer />
    </main>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${s}s`;
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl py-2 shadow-sm">
      <p className="text-[10px] text-[#6B4B3E]">{label}</p>
      <p
        className={`text-sm font-semibold tabular-nums ${
          accent ? "text-[#C4622D]" : "text-[#1E0E08]"
        }`}
      >
        {value}
      </p>
    </div>
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
