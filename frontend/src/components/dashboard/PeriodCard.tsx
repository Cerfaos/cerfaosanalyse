import { periodDetails } from "../../utils/dashboardConfig";
import type { PeriodType } from "../../types/dashboard";

interface PeriodCardProps {
  option: {
    value: PeriodType;
    label: string;
  };
  isActive: boolean;
  onSelect: () => void;
}

export default function PeriodCard({
  option,
  isActive,
  onSelect,
}: PeriodCardProps) {
  const info = periodDetails[option.value];

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
        isActive
          ? "border-[#8BC34A] bg-[#8BC34A]/10 shadow-lg ring-2 ring-[#8BC34A]/20"
          : "border-[#8BC34A]/20 bg-[#0A191A]/60 hover:border-[#8BC34A]/40 hover:bg-[#8BC34A]/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl">{info?.icon}</span>
        {isActive && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8BC34A]">
            Actif
          </span>
        )}
      </div>
      <p className="mt-2 text-base font-semibold text-white">
        {info?.title ?? option.label}
      </p>
      <p className="text-xs text-gray-400">{info?.subtitle}</p>
    </button>
  );
}
