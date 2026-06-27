"use client";

import React, { useMemo } from "react";

export function FunnelChart({ candidates }) {
  // Compute stages based on candidate filters & scores
  const funnelData = useMemo(() => {
    const totalCount = 100000; // Total challenge size
    const analyzedCount = candidates.length || 1; // Active representative sample, fallback to 1 to avoid division by zero
    const passedBasicRules = candidates.filter(c => c.scoreBreakdown.penalty_total === 0).length;
    const passedThreshold = candidates.filter(c => c.scoreBreakdown.final_score >= 60).length;
    const topShortlisted = candidates.filter(c => c.scoreBreakdown.final_score >= 80).length;

    // Scale counts to display a beautiful representative funnel
    return [
      { stage: "Total Scored Pool", count: totalCount, displayCount: "100.0k", width: 100, color: "fill-primary/60 border-primary" },
      { stage: "Passed Basic Rules", count: Math.round((passedBasicRules / analyzedCount) * totalCount), displayCount: `${((passedBasicRules / analyzedCount) * 100).toFixed(1)}k`, width: 85, color: "fill-primary/70 border-primary" },
      { stage: "Match Score ≥ 60%", count: Math.round((passedThreshold / analyzedCount) * totalCount), displayCount: `${((passedThreshold / analyzedCount) * 100).toFixed(1)}k`, width: 65, color: "fill-primary/80 border-primary" },
      { stage: "Ranked Shortlist (Top 100)", count: 100, displayCount: "100", width: 35, color: "fill-success/80 border-success" }
    ];
  }, [candidates]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-semibold text-slate-300">Screening Funnel</span>
        <span className="text-[10px] text-muted-foreground font-mono">Conversion Ratio</span>
      </div>

      <div className="flex flex-col space-y-3">
        {funnelData.map((stage, idx) => {
          // calculate conversion rate from previous stage
          const prevCount = funnelData[idx-1]?.count || 0;
          const conversionRate = idx === 0 
            ? "100%" 
            : prevCount === 0 
            ? "0.0%" 
            : `${((stage.count / prevCount) * 100).toFixed(1)}%`;

          return (
            <div key={idx} className="relative flex items-center justify-between group">
              {/* Symmetrical narrowing layout */}
              <div className="w-[140px] text-xs font-medium text-slate-300 group-hover:text-primary transition-colors">
                {stage.stage}
              </div>

              <div className="flex-1 px-4 flex justify-center">
                <svg viewBox="0 0 200 24" className="w-full h-6">
                  {/* Symmetrical trapezoid block */}
                  <polygon
                    points={`
                      ${100 - stage.width / 2}, 2
                      ${100 + stage.width / 2}, 2
                      ${100 + (stage.width - 6) / 2}, 22
                      ${100 - (stage.width - 6) / 2}, 22
                    `}
                    className={`${stage.color} stroke-[1.5] cursor-pointer hover:opacity-90 transition-opacity`}
                  />
                  <text
                    x="100"
                    y="16"
                    textAnchor="middle"
                    className="fill-slate-100 text-[9px] font-bold tracking-wider pointer-events-none"
                  >
                    {stage.displayCount}
                  </text>
                </svg>
              </div>

              <div className="w-[50px] text-right font-mono text-xs text-muted-foreground">
                {conversionRate}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
