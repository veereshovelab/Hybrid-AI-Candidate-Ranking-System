import React from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "primary" | "purple";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-100 border border-slate-700",
    secondary: "bg-slate-900 text-slate-400 border border-slate-800",
    primary: "bg-primary/10 text-primary border border-primary/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    outline: "bg-transparent text-slate-300 border border-border"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
