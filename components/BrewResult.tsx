import { BrewInput, BrewResult as BrewResultType } from "@/lib/types";

interface BrewResultProps {
  result: BrewResultType;
  input: BrewInput;
}

export default function BrewResult({ result, input }: BrewResultProps) {
  return (
    <div className="bg-[#FBF0E9] rounded-2xl p-5 space-y-4 border border-[#EDD9C8]">
      <h2 className="font-display text-base font-semibold text-[#1E0E08] tracking-wide">
        Brew Recipe
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Water" value={`${result.totalWater}`} unit="ml" />
        <StatCard label="Hot Water" value={`${result.hotWater}`} unit="ml" />
        <StatCard
          label="Bloom Water"
          value={`${result.bloomWater}`}
          unit="ml"
        />
        <StatCard
          label="Temperature"
          value={`${result.recommendedTemp}`}
          unit="°C"
          accent
        />
      </div>

      {input.brewMode === "ice" && (
        <p className="text-sm text-[#6B4B3E] bg-white/70 rounded-xl px-4 py-2.5 border border-[#D9CBC0]">
          Add <strong>{input.iceWeight}g</strong> of ice to your server before brewing.
        </p>
      )}

      <div className="space-y-1.5 pt-1 border-t border-[#EDD9C8]">
        <PourRow label="Bloom" water={result.bloomWater} time="0 – 45s" />
        <PourRow label="Pour 1" water={result.pour1Water} time="45 – 90s" />
        <PourRow label="Pour 2" water={result.pour2Water} time="90 – 150s" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
      <p className="text-xs text-[#6B4B3E] mb-0.5">{label}</p>
      <p
        className={`text-xl font-semibold tabular-nums ${accent ? "text-[#C4622D]" : "text-[#1E0E08]"}`}
      >
        {value}
        <span className="text-sm font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

function PourRow({
  label,
  water,
  time,
}: {
  label: string;
  water: number;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#6B4B3E]">{label}</span>
      <span className="tabular-nums font-medium text-[#1E0E08]">
        {water}ml{" "}
        <span className="font-normal text-[#A07060] text-xs">{time}</span>
      </span>
    </div>
  );
}
