"use client";

import React from "react";
import { cn } from "../../utils/cn";

interface CircularScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CircularScore({ score, size = "md", className }: CircularScoreProps) {
  // SVG configurations
  const sizes = {
    sm: { radius: 24, stroke: 4, textClass: "text-sm", sizeClass: "h-14 w-14" },
    md: { radius: 36, stroke: 6, textClass: "text-lg", sizeClass: "h-24 w-24" },
    lg: { radius: 52, stroke: 8, textClass: "text-2xl", sizeClass: "h-32 w-32" }
  };

  const { radius, stroke, textClass, sizeClass } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine score color based on thresholds
  const getScoreColor = (val: number) => {
    if (val >= 80) return "stroke-success";
    if (val >= 60) return "stroke-primary";
    if (val >= 40) return "stroke-warning";
    return "stroke-red-500";
  };

  const getScoreBg = (val: number) => {
    if (val >= 80) return "text-success bg-success/5";
    if (val >= 60) return "text-primary bg-primary/5";
    if (val >= 40) return "text-warning bg-warning/5";
    return "text-red-500 bg-red-500/5";
  };

  return (
    <div className={cn("relative flex items-center justify-center rounded-full border border-border/40", sizeClass, getScoreBg(score), className)}>
      <svg className="absolute transform -rotate-90 w-full h-full">
        {/* Background track circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-800"
          fill="transparent"
        />
        {/* Foreground progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className={cn("transition-all duration-1000 ease-out", getScoreColor(score))}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="flex flex-col items-center">
        <span className={cn("font-bold font-mono tracking-tight text-slate-100", textClass)}>
          {score.toFixed(1)}
        </span>
        {size === "lg" && <span className="text-[10px] text-muted-foreground uppercase font-semibold">Match %</span>}
      </div>
    </div>
  );
}
