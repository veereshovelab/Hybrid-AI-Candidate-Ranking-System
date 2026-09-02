import React from "react";
import { cn } from "@/utils/cn";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-slate-800/90 text-slate-100 border border-slate-700/80 shadow-sm",
    secondary: "bg-slate-900/80 text-slate-400 border border-slate-800",
    primary: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10",
    cyan: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10",
    warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10",
    danger: "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10",
    purple: "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10",
    gradient: "bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-200 border border-indigo-400/30 shadow-sm",
    outline: "bg-transparent text-slate-300 border border-slate-700/80"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
