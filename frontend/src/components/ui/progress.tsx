import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { cn } from "./utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "teal" | "gold" | "default";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "teal", ...props }, ref) => {
  const variantClasses = {
    teal: "bg-organic-green",
    gold: "bg-organic-gold",
    default: "bg-linear-to-r from-organic-gold to-organic-green",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-card)]/80",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          variantClasses[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
