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
          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 shadow-lg ring-2 ring-[var(--brand-primary)]/20"
          : "border-[var(--brand-primary)]/20 bg-[var(--surface-deep)]/60 hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl">{info?.icon}</span>
        {isActive && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--brand-primary)]">
            Actif
          </span>
        )}
      </div>
      <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
        {info?.title ?? option.label}
      </p>
      <p className="text-xs text-[var(--text-tertiary)]">{info?.subtitle}</p>
    </button>
  );
}
