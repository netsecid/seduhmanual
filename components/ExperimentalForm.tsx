"use client";

import { ExperimentalInput, ExperimentalStep, GrindSize, ProcessType } from "@/lib/types";
import { getStepStartSeconds } from "@/lib/calculations";
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
  const upd = (partial: Partial<ExperimentalInput>) => onChange({ ...value, ...partial });

  const updateStep = (index: number, partial: Partial<ExperimentalStep>) => {
    const next = value.steps.map((s, i) => (i === index ? { ...s, ...partial } : s));
    upd({ steps: next });
  };

  const addStep = () => {
    const newStep: ExperimentalStep = {
      id: crypto.randomUUID(),
      name: `Pour ${value.steps.length}`,
      waterAmount: 0,
      duration: 45,
    };
    upd({ steps: [...value.steps, newStep] });
  };

  const removeStep = (index: number) => {
    if (value.steps.length <= 1) return;
    upd({ steps: value.steps.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-[#1E0E08]/5 border border-[#1E0E08]/10 rounded-xl px-4 py-3 text-xs text-[#6B4B3E] leading-relaxed">
        <span className="font-semibold text-[#1E0E08]">Experimental mode</span> — every
        parameter is yours to set. Step start times auto-stack from each step's duration.
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

      {/* Coffee weight + Total water */}
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

      {/* Ice weight */}
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

      {/* N-step list */}
      <div>
        <label className="block text-xs font-medium text-[#6B4B3E] uppercase tracking-wider mb-2">
          Brew Steps
        </label>

        <div className="space-y-2">
          {value.steps.map((step, i) => {
            const startSec = getStepStartSeconds(value.steps, i);
            return (
              <StepRow
                key={step.id}
                step={step}
                index={i}
                startSec={startSec}
                canRemove={value.steps.length > 1}
                onChange={(partial) => updateStep(i, partial)}
                onRemove={() => removeStep(i)}
              />
            );
          })}
        </div>

        <button
          onClick={addStep}
          className="mt-3 w-full py-2.5 text-sm text-[#6B4B3E] border border-dashed border-[#D9CBC0] rounded-xl hover:bg-[#EDD9C8]/40 hover:border-[#C4622D]/40 transition-colors duration-150 cursor-pointer"
        >
          ＋ Add Step
        </button>
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepRow({
  step,
  index,
  startSec,
  canRemove,
  onChange,
  onRemove,
}: {
  step: ExperimentalStep;
  index: number;
  startSec: number;
  canRemove: boolean;
  onChange: (p: Partial<ExperimentalStep>) => void;
  onRemove: () => void;
}) {
  const endSec = startSec + step.duration;

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${s}s`;
  };

  return (
    <div className="border border-[#D9CBC0] rounded-xl p-3 bg-white space-y-2">
      {/* Step header: number + name input + time range + remove */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-[#C4622D] text-white text-xs flex items-center justify-center font-bold flex-shrink-0 select-none">
          {index + 1}
        </span>
        <input
          type="text"
          value={step.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="flex-1 min-w-0 text-sm font-semibold text-[#1E0E08] bg-transparent focus:outline-none focus:bg-[#FBF0E9] rounded px-1 -mx-1 transition-colors"
          placeholder="Step name"
          aria-label={`Step ${index + 1} name`}
        />
        <span className="text-xs text-[#A07060] tabular-nums flex-shrink-0">
          {fmtTime(startSec)} → {fmtTime(endSec)}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center text-[#C4622D]/40 hover:text-[#C4622D] hover:bg-[#FBF0E9] rounded-full transition-colors cursor-pointer flex-shrink-0 text-xs"
            aria-label={`Remove step ${index + 1}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Water + Duration inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={step.waterAmount}
            min={0}
            onChange={(e) => onChange({ waterAmount: Number(e.target.value) })}
            className="w-full border border-[#D9CBC0] rounded-lg px-3 py-2 pr-9 text-[#1E0E08] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
            placeholder="Water"
            aria-label={`Step ${index + 1} water amount`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A07060] pointer-events-none">
            ml
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={step.duration}
            min={1}
            onChange={(e) => onChange({ duration: Math.max(1, Number(e.target.value)) })}
            className="w-full border border-[#D9CBC0] rounded-lg px-3 py-2 pr-9 text-[#1E0E08] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent"
            placeholder="Duration"
            aria-label={`Step ${index + 1} duration`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A07060] pointer-events-none">
            s
          </span>
        </div>
      </div>
    </div>
  );
}

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
