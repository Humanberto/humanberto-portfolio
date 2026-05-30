import * as React from "react";
import { cn } from "../cn";

/** Gold-foil gradient text used for hero and section accents. */
export function GradientText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-gradient-to-br from-gold-dust via-gold-bright to-gold bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
}
