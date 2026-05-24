"use client";

import { ExperimentalInput, GrindSize, ProcessType } from "@/lib/types";
import { COFFEE_PROCESSES } from "@/constants/coffeeData";

interface ExperimentalFormProps {
  value: ExperimentalInput;
  onChange: (v: ExperimentalInput) => void;
}

const GRIND_SIZES: GrindSize[] = [
  "Extra-Fine",
  "Fine",
  "Medium-Fine",
  "Medium",
  "Medium-Coarse",
  "Coarse",
];

export default function ExperimentalForm({ value, onChange }: ExperimentalFormProps) {
  const upd = (partial: Partial<ExperimentalInput>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-[#1E0E08]/5 border border-[#1E0E08]/10 rounded-xl px-4 py-3 text-xs text-[#6B4B3E] leading-relaxed">
        <span className="font-semibold text-[#1E0E08]">Experimental mode</span> — every
        parameter is yours to set. No calculations applied.
      </div>

      {/* Brew mode */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
          Brew Mode
        </label>
        <div className="flex rounded-xl border border-[#D9CBC0] overflow-hidden bg-white">
          {(["hot", "ice"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => upd({ brewMode: mode })}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                value.brewMode === mode
                  ? "bg-[#C4622D] text-white"
                  : "text-[#6B4B3E] hover:bg-[#FBF0E9]"
              }`}
            >
              {mode === "hot" ? "Hot" : "Ice Brew"}
            </button>
          ))}
        </div>
      </div>

      {/* Row: Coffee weight + Total water */}
      <div className="grid grid-cols-2 gap-3">
        <NumField
          label="Coffee Weight"
          unit="g"
          value={value.coffeeWeight}
          min={1}
          onChange={(v) => upd({ coffeeWeight: v })}
        />
        <NumField
          label="Total Water"
          unit="ml"
          value={value.totalWater}
          min={1}
          onChange={(v) => upd({ totalWater: v })}
        />
      </div>

      {/* Ice weight — only in ice mode */}
      {value.brewMode === "ice" && (
        <NumField
          label="Ice Weight"
          unit="g"
          value={value.iceWeight}
          min={0}
          onChange={(v) => upd({ iceWeight: v })}
        />
      )}

      {/* Temperature */}
      <NumField
        label="Temperature"
        unit="°C"
        value={value.temperature}
        min={60}
        max={100}
        onChange={(v) => upd({ temperature: v })}
      />

      {/* Steps */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-2">
          Brew Steps
        </label>
        <div className="space-y-3">
          {/* Bloom */}
          <StepRow
            label="Bloom"
            stepNum={1}
            water={value.bloomWater}
            startSec={0}
            endSec={value.bloomEnd}
            onWater={(v) => upd({ bloomWater: v })}
            onEnd={(v) => upd({ bloomEnd: v })}
          />
          {/* Pour 1 */}
          <StepRow
            label="Pour 1"
            stepNum={2}
            water={value.pour1Water}
            startSec={value.bloomEnd}
            endSec={value.pour1End}
            onWater={(v) => upd({ pour1Water: v })}
            onEnd={(v) => upd({ pour1End: v })}
          />
          {/* Pour 2 */}
          <StepRow
            label="Pour 2"
            stepNum={3}
            water={value.pour2Water}
            startSec={value.pour1End}
            endSec={value.pour2End}
            onWater={(v) => upd({ pour2Water: v })}
            onEnd={(v) => upd({ pour2End: v })}
          />
        </div>
      </div>

      {/* Grind & process */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
            Grind Size
          </label>
          <select
            value={value.grindSize}
            onChange={(e) => upd({ grindSize: e.target.value as GrindSize })}
            className="w-full border border-[#D9CBC0] rounded-xl px-3 py-3 text-[#1E0E08] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow appearance-none cursor-pointer"
          >
            {GRIND_SIZES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
            Process
          </label>
          <select
            value={value.processType}
            onChange={(e) => upd({ processType: e.target.value as ProcessType })}
            className="w-full border border-[#D9CBC0] rounded-xl px-3 py-3 text-[#1E0E08] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow appearance-none cursor-pointer"
          >
            {COFFEE_PROCESSES.map((p) => (
              <option key={p.type} value={p.type}>
                {p.type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function NumField({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border border-[#D9CBC0] rounded-xl px-4 py-3 pr-10 text-[#1E0E08] bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent transition-shadow"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#6B4B3E] pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function StepRow({
  label,
  stepNum,
  water,
  startSec,
  endSec,
  onWater,
  onEnd,
}: {
  label: string;
  stepNum: number;
  water: number;
  startSec: number;
  endSec: number;
  onWater: (v: number) => void;
  onEnd: (v: number) => void;
}) {
  const fmtSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${s}s`;
  };

  return (
    <div className="border border-[#D9CBC0] rounded-xl p-3 bg-white space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[#C4622D] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
          {stepNum}
        </span>
        <span className="text-sm font-semibold text-[#1E0E08]">{label}</span>
        <span className="ml-auto text-xs text-[#A07060]">
          {fmtSec(startSec)} → {fmtSec(endSec)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={water}
            min={0}
            onChange={(e) => onWater(Number(e.target.value))}
            className="w-full border border-[#D9CBC0] rounded-lg px-3 py-2 pr-9 text-[#1E0E08] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
            placeholder="Water"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A07060] pointer-events-none">
            ml
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={endSec}
            min={startSec + 1}
            onChange={(e) => onEnd(Number(e.target.value))}
            className="w-full border border-[#D9CBC0] rounded-lg px-3 py-2 pr-9 text-[#1E0E08] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
            placeholder="End (s)"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A07060] pointer-events-none">
            s
          </span>
        </div>
      </div>
    </div>
  );
}
