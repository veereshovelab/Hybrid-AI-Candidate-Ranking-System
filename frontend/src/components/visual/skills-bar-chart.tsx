"use client";

import React, { useMemo } from "react";
import { ScoredCandidate } from "../../hooks/use-candidates";

interface SkillsBarChartProps {
  candidates: ScoredCandidate[];
}

export function SkillsBarChart({ candidates }: SkillsBarChartProps) {
  // Compute top skills and their frequency counts
  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    candidates.forEach(cand => {
      cand.skills.forEach(s => {
        const name = s.name;
        counts[name] = (counts[name] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [candidates]);

  const maxCount = useMemo(() => {
    return Math.max(...topSkills.map(s => s.count), 1);
  }, [topSkills]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-slate-300">Top Candidate Skills</span>
        <span className="text-[10px] text-muted-foreground font-mono">Occurrences in Active Pool</span>
      </div>

      <div className="space-y-4">
        {topSkills.map((skill, index) => {
          const percent = (skill.count / maxCount) * 100;
          return (
            <div key={index} className="group">
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300 group-hover:text-primary transition-colors">
                  {skill.name}
                </span>
                <span className="font-mono text-muted-foreground">
                  {skill.count} {skill.count === 1 ? "candidate" : "candidates"}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50 flex">
                <div
                  className="h-full rounded-full bg-primary/80 group-hover:bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
