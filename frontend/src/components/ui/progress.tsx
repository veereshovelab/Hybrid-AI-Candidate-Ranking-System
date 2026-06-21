import React from "react";
import { cn } from "../../utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: string; // Tailwind color overrides e.g. "bg-success"
  showLabel?: boolean;
}

export function Progress({
  className,
  value,
  color = "bg-primary",
  showLabel = false,
  ...props
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
        {showLabel && (
          <span className="font-medium text-slate-300">{clampedValue}%</span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", color)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
