interface TypeChipProps {
  label: string;
  icon: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}

export default function TypeChip({
  label,
  icon,
  count,
  selected,
  onClick,
}: TypeChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 group ${
        selected
          ? "border-[var(--brand-primary)]/70 bg-[var(--brand-primary)]/10 text-white shadow-md hover:shadow-lg"
          : "border-[var(--brand-primary)]/20 bg-[var(--surface-deep)]/60 text-[var(--text-tertiary)] hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/5 opacity-60 hover:opacity-100"
      }`}
    >
      <span
        className={`text-xl transition-transform duration-300 ${
          selected ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </span>
      <div className="flex flex-col text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
          {count} activité{count > 1 ? "s" : ""}
        </span>
      </div>
      {selected && (
        <div className="ml-auto">
          <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
}
