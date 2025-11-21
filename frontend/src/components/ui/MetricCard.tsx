import type { ReactNode } from "react";
import { cn } from "./utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  variant?: "gold" | "teal" | "neutral";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  variant = "neutral",
  className,
}: MetricCardProps) {
  const variantClasses = {
    gold: "border-[var(--color-secondary)]/20 hover:border-[var(--color-secondary)]/40",
    teal: "border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40",
    neutral:
      "border-[var(--color-foreground)]/10 hover:border-[var(--color-foreground)]/20",
  };

  const iconBgClasses = {
    gold: "bg-linear-to-br from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/10",
    teal: "bg-linear-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10",
    neutral: "bg-[var(--color-background)]/5",
  };

  const iconColorClasses = {
    gold: "text-[var(--color-secondary)]",
    teal: "text-[var(--color-primary)]",
    neutral: "text-[var(--color-foreground)]",
  };

  const trendColorClasses = {
    up: "text-[var(--color-primary)]",
    down: "text-red-400",
    neutral: "text-[var(--color-foreground)]/60",
  };

  const trendSymbol = {
    up: "↑",
    down: "↓",
    neutral: "",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-4xl p-6 transition-all duration-300",
        "bg-[var(--color-card)]/70 backdrop-blur-xl border",
        "hover:bg-[var(--color-card)]/90 hover:-translate-y-1 hover:shadow-2xl",
        variantClasses[variant],
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-organic-text/60 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-white tracking-tight">
              {value}
            </p>
          </div>

          {icon && (
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-2xl",
                iconBgClasses[variant]
              )}
            >
              <div className={cn("text-2xl", iconColorClasses[variant])}>
                {icon}
              </div>
            </div>
          )}
        </div>

        {/* Subtitle and trend */}
        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-sm">
            {subtitle && (
              <span className="text-organic-text/60">{subtitle}</span>
            )}
            {trend && trendValue && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  trendColorClasses[trend]
                )}
              >
                <span>{trendSymbol[trend]}</span>
                <span>{trendValue}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
