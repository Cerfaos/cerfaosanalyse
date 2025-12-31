import { type CSSProperties, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "./utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noPadding?: boolean;
  noHover?: boolean;
}

export function GlassCard({
  children,
  className = "",
  style,
  noPadding = false,
  noHover = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] backdrop-blur-[var(--glass-blur)] shadow-[var(--shadow-md)] transition-all duration-300",
        !noHover && "hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border-strong)]",
        noPadding ? "" : "p-6",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
