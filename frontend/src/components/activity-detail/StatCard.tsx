interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  secondary?: string;
  colorClass?: string;
  dotColor?: string;
  delay?: number;
  infoComponent?: React.ReactNode;
  variant?: "hero" | "standard" | "compact";
}

export default function StatCard({
  label,
  value,
  unit,
  secondary,
  colorClass = "text-white",
  dotColor = "#f8712f",
  delay = 0,
  infoComponent,
  variant = "standard",
}: StatCardProps) {
  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] animate-in fade-in duration-500"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          className="w-[7px] h-[7px] rounded-full flex-shrink-0 shadow-[0_0_6px_var(--glow)]"
          style={{ backgroundColor: dotColor, "--glow": `${dotColor}60` } as React.CSSProperties}
        />
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#475569]">
          {label}
        </p>
        {infoComponent}
        <p className={`font-bold font-mono tabular-nums text-base ml-auto ${colorClass}`}>
          {value}
          {unit && (
            <span className="text-xs font-semibold text-[#475569] ml-1">{unit}</span>
          )}
        </p>
        {secondary && (
          <span className="text-xs text-[#475569] font-medium">{secondary}</span>
        )}
      </div>
    );
  }

  // hero et standard partagent le même style unifié
  const isHero = variant === "hero";

  return (
    <div
      className="group relative rounded-xl border border-white/[0.06] p-4 overflow-hidden hover:border-white/[0.12] transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{
        animationDelay: `${delay}ms`,
        background: "linear-gradient(135deg, rgba(15,21,32,0.8) 0%, rgba(12,16,23,0.9) 100%)",
      }}
    >
      {/* Accent bar gauche */}
      <div
        className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full"
        style={{ backgroundColor: dotColor, opacity: 0.5 }}
      />

      {/* Orbe subtil pour hero uniquement */}
      {isHero && (
        <div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ background: dotColor }}
        />
      )}

      <div className="relative z-10 pl-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: dotColor }}
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#475569] truncate">
            {label}
          </p>
          {infoComponent}
        </div>
        <p className={`text-2xl font-black font-mono tabular-nums leading-tight ${colorClass}`}>
          {value}
          {unit && (
            <span className="text-xs font-semibold text-[#475569] ml-1">
              {unit}
            </span>
          )}
        </p>
        {secondary && (
          <p className="text-[11px] text-[#475569] mt-1 font-medium truncate">{secondary}</p>
        )}
      </div>
    </div>
  );
}
