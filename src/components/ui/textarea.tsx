import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-sm text-forge-foreground placeholder:text-forge-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-accent/30 focus-visible:border-forge-accent/50",
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
