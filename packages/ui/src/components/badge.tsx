import * as React from "react";
import { cn } from "../cn";

export const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-gold-bright",
        className,
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";
