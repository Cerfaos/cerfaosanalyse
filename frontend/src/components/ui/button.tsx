import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-organic-gold/50",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-br from-organic-gold to-organic-gold/80 text-organic-bg hover:from-organic-gold/90 hover:to-organic-gold/70 shadow-lg",
        secondary:
          "bg-linear-to-br from-organic-green to-organic-green/80 text-organic-bg hover:from-organic-green/90 hover:to-organic-green/70 shadow-lg",
        outline:
          "border border-organic-text/20 bg-organic-card/50 text-white hover:bg-organic-card/70 hover:border-organic-gold/50",
        ghost:
          "hover:bg-organic-card/30 hover:text-organic-gold text-organic-text",
        link: "text-organic-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-2xl px-6 has-[>svg]:px-4 text-base",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
