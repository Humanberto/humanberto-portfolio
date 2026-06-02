import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:pointer-events-none disabled:opacity-50 rounded-[var(--btn-radius,9999px)]",
  {
    variants: {
      variant: {
        gold: "bg-gradient-to-b from-gold-bright to-gold text-ink shadow-[0_0_24px_-6px_rgba(230,194,96,0.6)] hover:shadow-[0_0_36px_-4px_rgba(230,194,96,0.8)] hover:-translate-y-0.5",
        purple:
          "bg-purple text-fg hover:bg-purple-soft shadow-[0_0_24px_-8px_rgba(123,63,228,0.8)]",
        outline:
          "border border-gold/40 text-gold-bright hover:border-gold hover:bg-gold/10",
        ghost: "text-muted hover:text-fg hover:bg-white/5",
      },
      size: {
        sm: "h-[var(--btn-sm-height,2.25rem)] px-[var(--btn-sm-px,1rem)] text-[length:var(--btn-sm-text,0.875rem)]",
        md: "h-[var(--btn-md-height,2.75rem)] px-[var(--btn-md-px,1.5rem)] text-[length:var(--btn-md-text,0.875rem)]",
        lg: "h-[var(--btn-lg-height,3.5rem)] px-[var(--btn-lg-px,2rem)] text-[length:var(--btn-lg-text,1rem)]",
      },
    },
    defaultVariants: {
      variant: "gold",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
