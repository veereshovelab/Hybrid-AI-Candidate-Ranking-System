"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Database, ShieldCheck, Activity } from "lucide-react";

export function AnimatedLoader({ 
  message = "Loading AI Candidate Scoring Model...",
  subtext = "Hybrid AI Candidate Ranking System v1.2",
  showSkeleton = true
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  const statusMessages = [
    "Initializing Neural Ranking Engine...",
    "Vectorizing candidate resume embeddings...",
    "Computing semantic similarity & experience scores...",
    "Evaluating honeypot penalties & anti-gaming audit flags...",
    "Preparing candidate dossier comparison matrix..."
  ];

  useEffect(() => {
    // Cycle through status messages
    const messageInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 1200);

    // Smooth progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 92 ? 92 : prev + Math.floor(Math.random() * 12) + 5));
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [statusMessages.length]);

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-8 relative overflow-hidden">
      
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Outer Orbit & AI Core Spinner */}
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Outer glowing orbital ring 1 */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 animate-spin-slow" />
        
        {/* Counter-rotating ring 2 */}
        <div className="absolute inset-2 rounded-full border border-purple-500/30 border-t-purple-400 border-r-transparent animate-spin-reverse" />
        
        {/* Laser scan line overlay container */}
        <div className="absolute inset-4 rounded-full overflow-hidden border border-slate-700/60 bg-slate-950/80 glass shadow-2xl flex items-center justify-center">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-laser-scan" />
          
          {/* Inner Glowing AI Icon */}
          <div className="relative z-10 flex flex-col items-center justify-center p-3 rounded-full bg-slate-900/90 text-primary ai-glow">
            <Cpu className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Small orbiting satellite dots */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#3b82f6]" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
      </div>

      {/* Text & Progress Section */}
      <div className="flex flex-col items-center text-center space-y-3 max-w-md z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-spin" />
          <h3 className="text-base font-bold tracking-tight text-slate-100">{message}</h3>
        </div>

        {/* Dynamic cycling status message */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs font-mono text-primary/90 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full animate-fade-in flex items-center gap-1.5">
            <Activity className="h-3 w-3 animate-pulse" />
            {statusMessages[statusIndex]}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full space-y-1.5 pt-2">
          <div className="w-full bg-slate-900 border border-border/80 rounded-full h-2 overflow-hidden relative">
            <div 
              className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
            <span>{subtext}</span>
            <span className="text-primary font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Shimmering Skeleton Preview Cards below loader */}
      {showSkeleton && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 opacity-50 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl skeleton-shimmer border border-border/40 p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-slate-700/60 rounded" />
                <div className="h-4 w-12 bg-primary/20 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-slate-800/80 rounded" />
                <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
