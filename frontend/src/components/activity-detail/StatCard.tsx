import { GlassCard } from "../ui/GlassCard";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  secondary?: string;
  colorClass?: string;
  bgColorClass?: string;
  delay?: number;
  infoComponent?: React.ReactNode;
}

export default function StatCard({
  icon,
  label,
  value,
  unit,
  secondary,
  colorClass = "text-[var(--text-primary)]",
  bgColorClass = "bg-[var(--accent-primary)]/10",
  delay = 0,
  infoComponent,
}: StatCardProps) {
  return (
    <GlassCard
      className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 ${bgColorClass} rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500`}
      />
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-xl ${bgColorClass} flex items-center justify-center text-xl mb-3 border border-current/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1 mb-1">
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-tertiary)] font-semibold">
            {label}
          </p>
          {infoComponent}
        </div>
        <p className={`text-2xl font-display font-bold ${colorClass}`}>
          {value}
          {unit && (
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">
              {unit}
            </span>
          )}
        </p>
        {secondary && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">{secondary}</p>
        )}
      </div>
    </GlassCard>
  );
}
