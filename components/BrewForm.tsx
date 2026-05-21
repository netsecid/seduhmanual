"use client";

import { BrewInput, GrindSize, ProcessType } from "@/lib/types";
import { COFFEE_PROCESSES } from "@/constants/coffeeData";

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
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Coffee Weight
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={input.coffeeWeight}
            onChange={(e) => update({ coffeeWeight: Number(e.target.value) })}
            min={1}
            className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 pr-10 text-[#1E0E08] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6B4B3E]">
            g
          </span>
        </div>
      </div>

      {/* Ratio */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Ratio
        </label>
        <div className="flex gap-2">
          {RATIOS.map((r) => (
            <button
              key={r}
              onClick={() => update({ ratio: r })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 cursor-pointer ${
                input.ratio === r
                  ? "bg-[#C4622D] text-white border-[#C4622D] shadow-sm"
                  : "bg-white text-[#6B4B3E] border-[#D9CBC0] hover:border-[#C4622D] hover:text-[#C4622D]"
              }`}
            >
              1:{r}
            </button>
          ))}
        </div>
      </div>

      {/* Brew mode toggle */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Brew Mode
        </label>
        <div className="flex rounded-xl border border-[#D9CBC0] overflow-hidden bg-white">
          <button
            onClick={() => update({ brewMode: "hot" })}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
              input.brewMode === "hot"
                ? "bg-[#C4622D] text-white"
                : "text-[#6B4B3E] hover:bg-[#FBF0E9]"
            }`}
          >
            Hot
          </button>
          <button
            onClick={() => update({ brewMode: "ice" })}
            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
              input.brewMode === "ice"
                ? "bg-[#C4622D] text-white"
                : "text-[#6B4B3E] hover:bg-[#FBF0E9]"
            }`}
          >
            Ice Brew
          </button>
        </div>
      </div>

      {/* Ice weight — only in ice mode */}
      {input.brewMode === "ice" && (
        <div>
          <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
            Ice Weight
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={input.iceWeight}
              onChange={(e) => update({ iceWeight: Number(e.target.value) })}
              min={0}
              className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 pr-10 text-[#1E0E08] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6B4B3E]">
              g
            </span>
          </div>
        </div>
      )}

      {/* Grind size */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Grind Size
        </label>
        <select
          value={input.grindSize}
          onChange={(e) => update({ grindSize: e.target.value as GrindSize })}
          className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 text-[#1E0E08] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow appearance-none cursor-pointer"
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
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Process
        </label>
        <select
          value={input.processType}
          onChange={(e) =>
            update({ processType: e.target.value as ProcessType })
          }
          className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 text-[#1E0E08] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow appearance-none cursor-pointer"
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
