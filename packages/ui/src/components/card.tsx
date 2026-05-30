import * as React from "react";
import { cn } from "../cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line/70 bg-surface/60 backdrop-blur-xl",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_48px_-24px_rgba(0,0,0,0.8)]",
        "transition-colors duration-300 hover:border-gold/40",
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";
