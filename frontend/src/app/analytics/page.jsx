"use client";

import React, { useMemo } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  GitBranch, 
  HelpCircle,
  Clock,
  Sparkles,
  Users
} from "lucide-react";
import { useCandidates } from "../../hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { FunnelChart } from "../../components/visual/funnel-chart";
import { DistributionCurve } from "../../components/visual/distribution-curve";

export default function Analytics() {
  const { allCandidates } = useCandidates();

  // Compute Experience Buckets Histogram
  const experienceBuckets = useMemo(() => {
    const buckets = {
      "0-3 Years": 0,
      "3-5 Years": 0,
      "5-8 Years": 0,
      "8+ Years": 0
    };

    allCandidates.forEach(cand => {
      const exp = cand.profile.years_of_experience;
      if (exp < 3) buckets["0-3 Years"]++;
      else if (exp < 5) buckets["3-5 Years"]++;
      else if (exp <= 8) buckets["5-8 Years"]++;
      else buckets["8+ Years"]++;
    });

    const total = allCandidates.length || 1;
    return Object.entries(buckets).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100)
    }));
  }, [allCandidates]);

  // Aggregate behavioral signals
  const behavioralAverages = useMemo(() => {
    let totalResp = 0;
    let totalGit = 0;
    let gitCount = 0;
    let totalCompl = 0;
    let totalSaves = 0;

    allCandidates.forEach(cand => {
      totalResp += cand.redrob_signals.recruiter_response_rate;
      if (cand.redrob_signals.github_activity_score >= 0) {
        totalGit += cand.redrob_signals.github_activity_score;
        gitCount++;
      }
      totalCompl += cand.redrob_signals.interview_completion_rate;
      totalSaves += cand.redrob_signals.saved_by_recruiters_30d;
    });

    const size = allCandidates.length || 1;
    return {
      avgResponse: Math.round((totalResp / size) * 100),
      avgGithub: Math.round(totalGit / (gitCount || 1)),
      avgCompletion: Math.round((totalCompl / size) * 100),
      avgSaves: (totalSaves / size).toFixed(1)
    };
  }, [allCandidates]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Talent Pool Analytics
        </h2>
        <p className="text-xs text-muted-foreground">
          Aggregated statistics representing the candidate distribution across skills, tenure, and availability signals.
        </p>
      </div>

      {/* Top Section: Funnel + Experience Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symmetrical funnel visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Talent Acquisition Funnel</CardTitle>
            <CardDescription>Visualizing candidate screening drop-offs through scoring stages.</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart candidates={allCandidates} />
          </CardContent>
        </Card>

        {/* Experience histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Experience Tenure Histogram</CardTitle>
            <CardDescription>Percentage breakdown of experience brackets within the pool.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {experienceBuckets.map((bucket, idx) => {
              const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"];
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{bucket.name}</span>
                    <span className="font-mono text-muted-foreground">{bucket.count} profiles ({bucket.percent}%)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-800 border border-slate-700/50 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-700 ease-out`} 
                      style={{ width: `${bucket.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Score Density */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Match Score Distribution</CardTitle>
          <CardDescription>Mathematical probability curve representing scores before and after red-flag audit checks.</CardDescription>
        </CardHeader>
        <CardContent>
          <DistributionCurve candidates={allCandidates} />
        </CardContent>
      </Card>

      {/* Bottom Section: Behavioral Signal Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Behavioral Signal Metrics</CardTitle>
          <CardDescription>Average activity indicators evaluated across active profiles.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          
          {/* Box 1: Response Rate */}
          <div className="bg-slate-900 border border-border/50 rounded-xl p-5 space-y-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="uppercase font-semibold tracking-wider">Recruiter Response</span>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{behavioralAverages.avgResponse}%</span>
              <p className="text-[10px] text-muted-foreground">Average response rate to incoming invitations</p>
            </div>
          </div>

          {/* Box 2: GitHub activity */}
          <div className="bg-slate-900 border border-border/50 rounded-xl p-5 space-y-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="uppercase font-semibold tracking-wider">GitHub Score</span>
              <GitBranch className="h-4 w-4 text-success" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{behavioralAverages.avgGithub}/100</span>
              <p className="text-[10px] text-muted-foreground">Open source activity rating of profiles</p>
            </div>
          </div>

          {/* Box 3: Interview Completion */}
          <div className="bg-slate-900 border border-border/50 rounded-xl p-5 space-y-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="uppercase font-semibold tracking-wider">Assessment completion</span>
              <Activity className="h-4 w-4 text-warning" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{behavioralAverages.avgCompletion}%</span>
              <p className="text-[10px] text-muted-foreground">Ratio of finished screenings vs starts</p>
            </div>
          </div>

          {/* Box 4: Saves */}
          <div className="bg-slate-900 border border-border/50 rounded-xl p-5 space-y-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="uppercase font-semibold tracking-wider">Recruiter Saves</span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{behavioralAverages.avgSaves}</span>
              <p className="text-[10px] text-muted-foreground">Average folder saves per candidate in 30d</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
