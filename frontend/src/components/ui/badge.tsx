import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 focus-visible:ring-2 focus-visible:ring-organic-gold/50 transition-all overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-organic-gold/30 bg-organic-gold/10 text-organic-gold hover:bg-organic-gold/20",
        secondary:
          "border-organic-green/30 bg-organic-green/10 text-organic-green hover:bg-organic-green/20",
        outline:
          "border-organic-text/20 bg-transparent text-organic-text/80 hover:bg-organic-card/50 hover:text-white",
        ghost:
          "border-transparent bg-organic-card/30 text-organic-text hover:bg-organic-card/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
