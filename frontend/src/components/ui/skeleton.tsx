import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-organic-card/50 animate-pulse rounded-2xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
