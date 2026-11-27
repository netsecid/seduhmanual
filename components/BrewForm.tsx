"use client";

import { BrewInput, GrindSize, ProcessType } from "@/lib/types";
import { COFFEE_PROCESSES } from "@/constants/coffeeData";
import NumericInput from "@/components/NumericInput";

interface BrewFormProps {
  input: BrewInput;
  onChange: (input: BrewInput) => void;
}

const RATIOS = [13, 14, 15, 16, 17];

const GRIND_SIZES: GrindSize[] = [
  "Extra-Fine",
  "Fine",
  "Medium-Fine",
  "Medium",
  "Medium-Coarse",
  "Coarse",
];

export default function BrewForm({ input, onChange }: BrewFormProps) {
  const update = (partial: Partial<BrewInput>) =>
    onChange({ ...input, ...partial });

  return (
    <div className="space-y-5">
      {/* Coffee weight */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Coffee Weight
        </label>
        <div className="relative">
          <NumericInput
            value={input.coffeeWeight}
            onChange={(v) => update({ coffeeWeight: v })}
            min={1}
            ariaLabel="Coffee Weight"
            className="w-full border border-line rounded-xl px-4 py-3 pr-10 text-ink bg-surface text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
            g
          </span>
        </div>
      </div>

      {/* Ratio */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Ratio
        </label>
        <div className="flex gap-2">
          {RATIOS.map((r) => (
            <button
              key={r}
              onClick={() => update({ ratio: r })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 cursor-pointer ${
                input.ratio === r
                  ? "bg-accent text-on-accent border-accent shadow-sm"
                  : "bg-surface text-ink-muted border-line hover:border-accent hover:text-accent"
              }`}
            >
              1:{r}
            </button>
          ))}
        </div>
      </div>

      {/* Brew mode toggle */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Brew Mode
        </label>
        <div className="flex rounded-xl border border-line overflow-hidden bg-surface">
          <button
            onClick={() => update({ brewMode: "hot" })}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
              input.brewMode === "hot"
                ? "bg-accent text-on-accent"
                : "text-ink-muted hover:bg-accent-soft"
            }`}
          >
            Hot
          </button>
          <button
            onClick={() => update({ brewMode: "ice" })}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
              input.brewMode === "ice"
                ? "bg-accent text-on-accent"
                : "text-ink-muted hover:bg-accent-soft"
            }`}
          >
            Ice Brew
          </button>
        </div>
      </div>

      {/* Ice weight — only in ice mode */}
      {input.brewMode === "ice" && (
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
            Ice Weight
          </label>
          <div className="relative">
            <NumericInput
              value={input.iceWeight}
              onChange={(v) => update({ iceWeight: v })}
              min={0}
              ariaLabel="Ice Weight"
              className="w-full border border-line rounded-xl px-4 py-3 pr-10 text-ink bg-surface text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
              g
            </span>
          </div>
        </div>
      )}

      {/* Grind size */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Grind Size
        </label>
        <select
          value={input.grindSize}
          onChange={(e) => update({ grindSize: e.target.value as GrindSize })}
          className="w-full border border-line rounded-xl px-4 py-3 text-ink bg-surface text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow appearance-none cursor-pointer"
        >
          {GRIND_SIZES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Process type */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Process
        </label>
        <select
          value={input.processType}
          onChange={(e) =>
            update({ processType: e.target.value as ProcessType })
          }
          className="w-full border border-line rounded-xl px-4 py-3 text-ink bg-surface text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow appearance-none cursor-pointer"
        >
          {COFFEE_PROCESSES.map((p) => (
            <option key={p.type} value={p.type}>
              {p.type} — {p.flavorNotes}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
