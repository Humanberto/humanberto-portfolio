import * as React from "react";
import { cn } from "../cn";

/** A titled page section with an eyebrow, heading, and optional lead text. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-gold">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-light leading-tight sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-2xl text-base text-muted sm:text-lg",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
