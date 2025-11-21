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
        "relative overflow-hidden rounded-3xl border border-[#8BC34A]/30 bg-[#0A191A]/60 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300",
        !noHover && "hover:-translate-y-[5px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
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
