import React from "react";
import { cn } from "@/utils/cn";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-indigo-600/25 active:scale-[0.98] border border-indigo-400/20",
    gradient: "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/25 active:scale-[0.98]",
    secondary: "bg-slate-800/90 text-slate-100 hover:bg-slate-700 active:scale-[0.98] border border-slate-700/60",
    outline: "border border-slate-700/80 text-slate-200 hover:bg-indigo-500/10 hover:border-indigo-500/50 hover:text-indigo-300 active:scale-[0.98] backdrop-blur-sm",
    ghost: "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-900/20 active:scale-[0.98]",
    link: "text-indigo-400 underline-offset-4 hover:underline bg-transparent p-0"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
