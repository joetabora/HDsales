import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-forge-border bg-forge-surface-raised px-3.5 py-2.5 text-sm text-forge-foreground placeholder:text-forge-muted transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-accent/30 focus-visible:border-forge-accent/50 focus-visible:bg-forge-surface",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
