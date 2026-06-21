"use client";

import React, { useMemo } from "react";
import { ScoredCandidate } from "../../hooks/use-candidates";

interface DistributionCurveProps {
  candidates: ScoredCandidate[];
}

export function DistributionCurve({ candidates }: DistributionCurveProps) {
  // Aggregate candidate scores into buckets of 10 points
  const buckets = useMemo(() => {
    const counts = Array(10).fill(0);
    candidates.forEach(cand => {
      const score = cand.scoreBreakdown.final_score;
      const index = Math.min(9, Math.floor(score / 10));
      counts[index]++;
    });
    return counts;
  }, [candidates]);

  // SVG parameters
  const width = 500;
  const height = 180;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value in buckets for scaling
  const maxCount = Math.max(...buckets, 1);

  // Generate points for the smooth curve
  const points = useMemo(() => {
    return buckets.map((count, i) => {
      const x = paddingLeft + (i / 9) * chartWidth;
      const y = paddingTop + chartHeight - (count / maxCount) * chartHeight;
      return { x, y };
    });
  }, [buckets, chartWidth, chartHeight, maxCount]);

  // Construct SVG path for area fill and outline curve using bezier curves
  const { curvePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { curvePath: "", areaPath: "" };

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const area = `${path} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    return { curvePath: path, areaPath: area };
  }, [points, chartHeight]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-slate-300">Candidate Score Density</span>
        <span className="text-[10px] text-muted-foreground font-mono">X: Score Range | Y: Candidates</span>
      </div>
      
      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line
                key={index}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="stroke-slate-800"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Fill Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#scoreAreaGradient)" className="transition-all duration-500 ease-out" />
          )}

          {/* Curve Line */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Points circles */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-slate-950 stroke-primary hover:r-5 transition-all duration-150"
                strokeWidth="2"
              />
              <title>{`Score ${i * 10}-${(i + 1) * 10}: ${buckets[i]} candidates`}</title>
            </g>
          ))}

          {/* X Axis Labels */}
          {buckets.map((_, i) => {
            const x = paddingLeft + (i / 9) * chartWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {i * 10}
              </text>
            );
          })}

          {/* Y Axis Labels (Min / Max) */}
          <text
            x={5}
            y={paddingTop + 10}
            className="fill-muted-foreground text-[9px] font-mono"
          >
            {maxCount}
          </text>
          <text
            x={5}
            y={paddingTop + chartHeight}
            className="fill-muted-foreground text-[9px] font-mono"
          >
            0
          </text>
        </svg>
      </div>
    </div>
  );
}
