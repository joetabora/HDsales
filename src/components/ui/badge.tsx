import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          default: "bg-forge-accent/15 text-forge-accent border border-forge-accent/20",
          secondary: "bg-forge-surface text-forge-muted-foreground border border-forge-border",
          success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
          warning: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
          destructive: "bg-red-500/15 text-red-400 border border-red-500/20",
          outline: "border border-forge-border text-forge-muted-foreground",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
