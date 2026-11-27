"use client";

import { ExperimentalInput, ExperimentalStep, GrindSize, ProcessType } from "@/lib/types";
import { getStepStartSeconds } from "@/lib/calculations";
import { COFFEE_PROCESSES } from "@/constants/coffeeData";
import NumericInput from "@/components/NumericInput";

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
      <div className="bg-ink/5 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink-muted leading-relaxed">
        <span className="font-semibold text-ink">Experimental mode</span> — every
        parameter is yours to set. Step start times auto-stack from each step's duration.
      </div>

      {/* Brew mode */}
      <div>
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
          Brew Mode
        </label>
        <div className="flex rounded-xl border border-line overflow-hidden bg-surface">
          {(["hot", "ice"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => upd({ brewMode: mode })}
              className={`flex-1 py-3 text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                value.brewMode === mode
                  ? "bg-accent text-on-accent"
                  : "text-ink-muted hover:bg-accent-soft"
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
        <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
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
          className="mt-3 w-full py-2.5 text-sm text-ink-muted border border-dashed border-line rounded-xl hover:bg-line-soft/40 hover:border-accent/40 transition-colors duration-150 cursor-pointer"
        >
          ＋ Add Step
        </button>
      </div>

      {/* Grind & process */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
            Grind Size
          </label>
          <select
            value={value.grindSize}
            onChange={(e) => upd({ grindSize: e.target.value as GrindSize })}
            className="w-full border border-line rounded-xl px-3 py-3 text-ink bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow appearance-none cursor-pointer"
          >
            {GRIND_SIZES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
            Process
          </label>
          <select
            value={value.processType}
            onChange={(e) => upd({ processType: e.target.value as ProcessType })}
            className="w-full border border-line rounded-xl px-3 py-3 text-ink bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow appearance-none cursor-pointer"
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
    <div className="border border-line rounded-xl p-3 bg-surface space-y-2">
      {/* Step header: number + name input + time range + remove */}
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-accent text-on-accent text-xs flex items-center justify-center font-bold flex-shrink-0 select-none">
          {index + 1}
        </span>
        <input
          type="text"
          value={step.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="flex-1 min-w-0 text-sm font-semibold text-ink bg-transparent focus:outline-none focus:bg-accent-soft rounded px-1 -mx-1 transition-colors"
          placeholder="Step name"
          aria-label={`Step ${index + 1} name`}
        />
        <span className="text-xs text-ink-subtle tabular-nums flex-shrink-0">
          {fmtTime(startSec)} → {fmtTime(endSec)}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-5 h-5 flex items-center justify-center text-accent/40 hover:text-accent hover:bg-accent-soft rounded-full transition-colors cursor-pointer flex-shrink-0 text-xs"
            aria-label={`Remove step ${index + 1}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Water + Duration inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <NumericInput
            value={step.waterAmount}
            min={0}
            onChange={(v) => onChange({ waterAmount: v })}
            className="w-full border border-line rounded-lg px-3 py-2 pr-9 text-ink bg-surface/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Water"
            ariaLabel={`Step ${index + 1} water amount`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-subtle pointer-events-none">
            ml
          </span>
        </div>
        <div className="relative">
          <NumericInput
            value={step.duration}
            min={1}
            onChange={(v) => onChange({ duration: v })}
            className="w-full border border-line rounded-lg px-3 py-2 pr-9 text-ink bg-surface/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Duration"
            ariaLabel={`Step ${index + 1} duration`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-subtle pointer-events-none">
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
      <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <NumericInput
          value={value}
          min={min}
          max={max}
          onChange={onChange}
          ariaLabel={label}
          className="w-full border border-line rounded-xl px-4 py-3 pr-10 text-ink bg-surface text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted pointer-events-none">
          {unit}
        </span>
      </div>
    </div>
  );
}
