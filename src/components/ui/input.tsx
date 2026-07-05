import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-forge-border bg-forge-surface-raised px-3.5 py-2 text-sm text-forge-foreground placeholder:text-forge-muted transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-accent/30 focus-visible:border-forge-accent/50 focus-visible:bg-forge-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
