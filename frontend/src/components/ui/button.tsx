import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/10 active:scale-[0.98]",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 active:scale-[0.98]",
    outline: "border border-border text-slate-200 hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]",
    ghost: "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/10 active:scale-[0.98]",
    link: "text-primary underline-offset-4 hover:underline bg-transparent p-0"
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
