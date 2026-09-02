import React from "react";
import { cn } from "@/utils/cn";

export function Card({ className, hoverEffect = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/80 bg-slate-900/80 text-card-foreground shadow-xl backdrop-blur-md transition-all duration-300",
        hoverEffect && "hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:translate-y-[-2px]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight text-slate-100", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center p-6 pt-0 border-t border-border/40 mt-4", className)} {...props} />;
}
