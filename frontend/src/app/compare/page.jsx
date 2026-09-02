"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  GitCompare, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Eye, 
  Download, 
  Plus, 
  X, 
  Sliders, 
  Zap,
  Star,
  Layers,
  TrendingUp,
  GraduationCap
} from "lucide-react";
import { useCandidates } from "@/hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CircularScore } from "@/components/visual/circular-score";

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allCandidates, requiredSkills } = useCandidates();

  // URL params for selected candidates
  const c1Param = searchParams.get("c1");
  const c2Param = searchParams.get("c2");
  const c3Param = searchParams.get("c3");

  // Sorted candidates by final score for default selections
  const sortedCandidates = useMemo(() => {
    return [...allCandidates].sort((a, b) => b.scoreBreakdown.final_score - a.scoreBreakdown.final_score);
  }, [allCandidates]);

  // Initial candidate IDs
  const [candidateIds, setCandidateIds] = useState(() => {
    const list = [];
    if (c1Param && allCandidates.some(c => c.candidate_id === c1Param)) list.push(c1Param);
    if (c2Param && allCandidates.some(c => c.candidate_id === c2Param)) list.push(c2Param);
    if (c3Param && allCandidates.some(c => c.candidate_id === c3Param)) list.push(c3Param);

    if (list.length >= 2) return list;
    // Default to top 2 ranked candidates
    const default1 = sortedCandidates[0]?.candidate_id || "CAND-0001";
    const default2 = sortedCandidates[1]?.candidate_id || "CAND-0002";
    return [default1, default2];
  });

  // Keep search params in sync
  const updateCandidate = (index, newId) => {
    setCandidateIds(prev => {
      const next = [...prev];
      next[index] = newId;
      syncUrl(next);
      return next;
    });
  };

  const addSlot = () => {
    if (candidateIds.length >= 3) return;
    const remaining = sortedCandidates.find(c => !candidateIds.includes(c.candidate_id));
    if (remaining) {
      setCandidateIds(prev => {
        const next = [...prev, remaining.candidate_id];
        syncUrl(next);
        return next;
      });
    }
  };

  const removeSlot = (index) => {
    if (candidateIds.length <= 2) return;
    setCandidateIds(prev => {
      const next = prev.filter((_, i) => i !== index);
      syncUrl(next);
      return next;
    });
  };

  const syncUrl = (ids) => {
    const params = new URLSearchParams();
    if (ids[0]) params.set("c1", ids[0]);
    if (ids[1]) params.set("c2", ids[1]);
    if (ids[2]) params.set("c3", ids[2]);
    router.replace(`/compare?${params.toString()}`);
  };

  // Selected candidate objects
  const selectedCandidates = useMemo(() => {
    return candidateIds.map(id => allCandidates.find(c => c.candidate_id === id)).filter(Boolean);
  }, [allCandidates, candidateIds]);

  // Preset match-ups
  const loadPreset = (type) => {
    if (sortedCandidates.length < 2) return;
    if (type === "top2") {
      const ids = [sortedCandidates[0].candidate_id, sortedCandidates[1].candidate_id];
      setCandidateIds(ids);
      syncUrl(ids);
    } else if (type === "seniorVsMid") {
      const senior = sortedCandidates.find(c => c.profile.years_of_experience >= 7);
      const mid = sortedCandidates.find(c => c.profile.years_of_experience >= 4 && c.profile.years_of_experience < 6);
      if (senior && mid) {
        const ids = [senior.candidate_id, mid.candidate_id];
        setCandidateIds(ids);
        syncUrl(ids);
      }
    } else if (type === "fastAvailability") {
      const fastList = [...allCandidates].filter(c => c.redrob_signals.notice_period_days <= 30 && c.scoreBreakdown.final_score > 50);
      if (fastList.length >= 2) {
        const ids = [fastList[0].candidate_id, fastList[1].candidate_id];
        setCandidateIds(ids);
        syncUrl(ids);
      }
    } else if (type === "honeypotCheck") {
      const topPick = sortedCandidates[0];
      const honeypotCand = allCandidates.find(c => c.scoreBreakdown.penalty_total >= 100);
      if (topPick && honeypotCand) {
        const ids = [topPick.candidate_id, honeypotCand.candidate_id];
        setCandidateIds(ids);
        syncUrl(ids);
      }
    }
  };

  // Export Comparative Matrix as CSV
  const handleExportComparison = () => {
    if (selectedCandidates.length === 0) return;
    const headers = [
      "Metric / Dimension",
      ...selectedCandidates.map(c => `${c.candidate_id} (${c.profile.anonymized_name})`)
    ];

    const rows = [
      ["Current Title", ...selectedCandidates.map(c => `"${c.profile.current_title}"`)],
      ["Company", ...selectedCandidates.map(c => `"${c.profile.current_company}"`)],
      ["Overall Match Score", ...selectedCandidates.map(c => `${c.scoreBreakdown.final_score.toFixed(1)}%`)],
      ["Skill Match (40%)", ...selectedCandidates.map(c => `${c.scoreBreakdown.skill_match.toFixed(1)}/100`)],
      ["Experience Match (20%)", ...selectedCandidates.map(c => `${c.scoreBreakdown.experience_match.toFixed(1)}/100`)],
      ["Career Relevance (20%)", ...selectedCandidates.map(c => `${c.scoreBreakdown.career_relevance.toFixed(1)}/100`)],
      ["Behavioral Score (20%)", ...selectedCandidates.map(c => `${c.scoreBreakdown.behavioral_score.toFixed(1)}/100`)],
      ["Penalty Deductions", ...selectedCandidates.map(c => `-${c.scoreBreakdown.penalty_total} pts`)],
      ["Years of Experience", ...selectedCandidates.map(c => `${c.profile.years_of_experience.toFixed(1)} yrs`)],
      ["Location", ...selectedCandidates.map(c => `"${c.profile.location}"`)],
      ["Notice Period (Days)", ...selectedCandidates.map(c => `${c.redrob_signals.notice_period_days} days`)],
      ["Expected CTC (LPA)", ...selectedCandidates.map(c => `${c.redrob_signals.expected_salary_range_inr_lpa.min}-${c.redrob_signals.expected_salary_range_inr_lpa.max} LPA`)],
      ["GitHub Activity", ...selectedCandidates.map(c => c.redrob_signals.github_activity_score >= 0 ? `${c.redrob_signals.github_activity_score}/100` : "N/A")],
      ["Recruiter Response Rate", ...selectedCandidates.map(c => `${Math.round(c.redrob_signals.recruiter_response_rate * 100)}%`)],
      ["Anti-Cheat Flags", ...selectedCandidates.map(c => `"${c.scoreBreakdown.flags.join("; ") || "Clean (Pass)"}"`)]
    ];

    const csvText = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `candidate_comparison_${selectedCandidates.map(c => c.candidate_id).join("_vs_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Comparative AI Synthesis Insights
  const comparativeInsights = useMemo(() => {
    if (selectedCandidates.length < 2) return null;
    const [c1, c2, c3] = selectedCandidates;

    const winner = [...selectedCandidates].sort((a, b) => b.scoreBreakdown.final_score - a.scoreBreakdown.final_score)[0];
    const fastestNotice = [...selectedCandidates].sort((a, b) => a.redrob_signals.notice_period_days - b.redrob_signals.notice_period_days)[0];
    const mostExperienced = [...selectedCandidates].sort((a, b) => b.profile.years_of_experience - a.profile.years_of_experience)[0];
    const highestBehavior = [...selectedCandidates].sort((a, b) => b.scoreBreakdown.behavioral_score - a.scoreBreakdown.behavioral_score)[0];

    const points = [];

    // Score differentiator
    if (winner.scoreBreakdown.final_score - (selectedCandidates.find(c => c !== winner)?.scoreBreakdown.final_score || 0) > 10) {
      points.push({
        title: "Score Dominance",
        text: `${winner.candidate_id} (${winner.profile.anonymized_name}) leads the match-up with a ${winner.scoreBreakdown.final_score.toFixed(1)}% compatibility score, significantly ahead in required NLP/AI tech skill density.`,
        type: "positive"
      });
    }

    // Availability trade-off
    if (fastestNotice.redrob_signals.notice_period_days <= 30) {
      points.push({
        title: "Velocity Advantage",
        text: `${fastestNotice.candidate_id} offers the fastest onboarding velocity with only a ${fastestNotice.redrob_signals.notice_period_days}-day notice period.`,
        type: "neutral"
      });
    }

    // Risk / Honeypot Warning
    const flagged = selectedCandidates.filter(c => c.scoreBreakdown.penalty_total >= 100);
    if (flagged.length > 0) {
      points.push({
        title: "Anti-Cheat Audit Alert",
        text: `${flagged.map(f => f.candidate_id).join(", ")} failed automated integrity checks (penalized -100 pts) and should not proceed to technical interview without manual verification.`,
        type: "warning"
      });
    }

    // Cost vs Experience ROI
    const minSalaryCand = [...selectedCandidates].sort((a, b) => a.redrob_signals.expected_salary_range_inr_lpa.max - b.redrob_signals.expected_salary_range_inr_lpa.max)[0];
    points.push({
      title: "Compensation & ROI Insight",
      text: `${minSalaryCand.candidate_id} represents the most cost-efficient candidate at ₹${minSalaryCand.redrob_signals.expected_salary_range_inr_lpa.min}-${minSalaryCand.redrob_signals.expected_salary_range_inr_lpa.max} LPA expected compensation bracket.`,
      type: "info"
    });

    return { winner, points };
  }, [selectedCandidates]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/rankings" className="text-xs text-muted-foreground hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Rankings
            </Link>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Candidate Comparison Matrix
          </h2>
          <p className="text-xs text-muted-foreground">
            Side-by-side head-to-head evaluation across 4-pillar scores, skill depth, compensation ROI, and integrity signals.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {candidateIds.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addSlot}
              className="text-xs flex items-center gap-1.5 h-9"
            >
              <Plus className="h-3.5 w-3.5" />
              Add 3rd Candidate
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportComparison}
            className="text-xs flex items-center gap-1.5 h-9"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            Export Head-to-Head Brief
          </Button>
        </div>
      </div>

      {/* Matchup Presets Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Quick Matchup Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset("top2")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            🏆 Top 2 Ranked Candidates
          </button>
          <button
            onClick={() => loadPreset("seniorVsMid")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            👔 Senior (7y+) vs Mid-Level
          </button>
          <button
            onClick={() => loadPreset("fastAvailability")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            ⚡ Fast Availability (&le;30d Notice)
          </button>
          <button
            onClick={() => loadPreset("honeypotCheck")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
          >
            🛡️ Clean vs Honeypot Penalty
          </button>
        </div>
      </div>

      {/* Candidate Dropdown Selectors Strip */}
      <div className={`grid grid-cols-1 md:grid-cols-${candidateIds.length} gap-6`}>
        {candidateIds.map((id, index) => {
          const cand = selectedCandidates[index];
          return (
            <Card key={index} className="relative overflow-hidden border-t-4 border-t-primary">
              {candidateIds.length > 2 && (
                <button
                  onClick={() => removeSlot(index)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-red-400 p-1 rounded-md transition-colors"
                  title="Remove candidate slot"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Candidate Slot #{index + 1}
                  </span>
                  {cand && (
                    <Badge variant={cand.scoreBreakdown.final_score >= 80 ? "success" : cand.scoreBreakdown.final_score >= 60 ? "primary" : "danger"}>
                      {cand.scoreBreakdown.final_score.toFixed(1)}% Match
                    </Badge>
                  )}
                </div>

                {/* Dropdown Selector */}
                <select
                  value={id}
                  onChange={(e) => updateCandidate(index, e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-border text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
                >
                  {allCandidates.map(c => (
                    <option key={c.candidate_id} value={c.candidate_id}>
                      {c.candidate_id} - {c.profile.anonymized_name} ({c.scoreBreakdown.final_score.toFixed(1)}% • {c.profile.years_of_experience.toFixed(1)}y)
                    </option>
                  ))}
                </select>

                {cand && (
                  <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-100 block">{cand.profile.anonymized_name}</span>
                      <span className="text-[10px] text-muted-foreground block">{cand.profile.current_title} @ {cand.profile.current_company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/candidates/${cand.candidate_id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Dossier
                        </Button>
                      </Link>
                      <Link href={`/explainability?candidate=${cand.candidate_id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-primary" title="Audit Equations">
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Head-to-Head Synthesis Banner */}
      {comparativeInsights && (
        <Card className="bg-gradient-to-r from-slate-900 via-slate-900 to-primary/10 border-primary/30">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-warning fill-warning/20" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Head-to-Head Verdict & Trade-off Synthesis</CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                Recommended Choice: {comparativeInsights.winner.candidate_id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparativeInsights.points.map((pt, idx) => (
                <div key={idx} className="bg-slate-950/40 p-3.5 rounded-xl border border-border/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {pt.type === "positive" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                    {pt.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                    {pt.type === "neutral" && <Zap className="h-3.5 w-3.5 text-primary" />}
                    {pt.type === "info" && <DollarSign className="h-3.5 w-3.5 text-warning" />}
                    <span className="text-slate-200 uppercase text-[10px]">{pt.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300/90 leading-relaxed font-sans">
                    {pt.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Side-by-Side Evaluation Matrix */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-slate-900/40 border-b border-border/50 pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Comprehensive Head-to-Head Comparison Matrix</CardTitle>
          <CardDescription className="text-xs">Multi-dimensional scoring criteria and background comparison.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-slate-900/60 font-semibold text-slate-300">
                  <th className="py-4 px-6 w-1/4 uppercase tracking-wider text-[10px] text-muted-foreground">Evaluation Dimension</th>
                  {selectedCandidates.map((c) => (
                    <th key={c.candidate_id} className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100">{c.candidate_id}</span>
                        <span className="text-muted-foreground font-normal">({c.profile.anonymized_name})</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                
                {/* SECTION: OVERALL SCORE & CLASSIFICATION */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    1. Overall Fit & Recommendation
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-300">Overall Match Score</td>
                  {selectedCandidates.map(c => {
                    const s = c.scoreBreakdown.final_score;
                    return (
                      <td key={c.candidate_id} className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <CircularScore score={s} size="sm" />
                          <div>
                            <span className="font-bold font-mono text-sm text-slate-100">{s.toFixed(1)}%</span>
                            <span className="text-[10px] text-muted-foreground block">
                              {s >= 80 ? "Top Shortlist Pick" : s >= 60 ? "Qualified Match" : "Below Cutoff / Penalized"}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* SECTION: 4-PILLAR WEIGHTED BREAKDOWNS */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    2. Core 4-Pillar Score Components
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Skill Match (40% Weight)</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Keyword & NLP stack overlap</span>
                  </td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-primary font-bold">{c.scoreBreakdown.skill_match.toFixed(1)}/100</span>
                          <span className="text-muted-foreground">x0.4 = {(c.scoreBreakdown.skill_match * 0.4).toFixed(1)} pts</span>
                        </div>
                        <Progress value={c.scoreBreakdown.skill_match} color="bg-primary" />
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Experience Match (20% Weight)</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Sweet-spot tenure alignment</span>
                  </td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-success font-bold">{c.scoreBreakdown.experience_match.toFixed(1)}/100</span>
                          <span className="text-muted-foreground">x0.2 = {(c.scoreBreakdown.experience_match * 0.2).toFixed(1)} pts</span>
                        </div>
                        <Progress value={c.scoreBreakdown.experience_match} color="bg-success" />
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Career Relevance (20% Weight)</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Company tier & stability</span>
                  </td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-warning font-bold">{c.scoreBreakdown.career_relevance.toFixed(1)}/100</span>
                          <span className="text-muted-foreground">x0.2 = {(c.scoreBreakdown.career_relevance * 0.2).toFixed(1)} pts</span>
                        </div>
                        <Progress value={c.scoreBreakdown.career_relevance} color="bg-warning" />
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Behavioral Signals (20% Weight)</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Redrob platform signals</span>
                  </td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      <div className="space-y-1 max-w-[200px]">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="text-purple-400 font-bold">{c.scoreBreakdown.behavioral_score.toFixed(1)}/100</span>
                          <span className="text-muted-foreground">x0.2 = {(c.scoreBreakdown.behavioral_score * 0.2).toFixed(1)} pts</span>
                        </div>
                        <Progress value={c.scoreBreakdown.behavioral_score} color="bg-purple-500" />
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Penalty Deductions</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Anti-cheat & honeypot strikes</span>
                  </td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      {c.scoreBreakdown.penalty_total > 0 ? (
                        <Badge variant="danger" className="font-mono">
                          -{c.scoreBreakdown.penalty_total.toFixed(0)} Points Penalty
                        </Badge>
                      ) : (
                        <span className="text-success font-mono font-medium">0 pts (Clean)</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* SECTION: EXPERIENCE & EMPLOYMENT DETAILS */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    3. Experience & Background Tenure
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Total Experience</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6 font-mono font-semibold text-slate-200">
                      {c.profile.years_of_experience.toFixed(1)} Years
                      {c.profile.years_of_experience >= 6 && c.profile.years_of_experience <= 8 && (
                        <Badge variant="success" className="ml-2 text-[9px]">Sweet Spot</Badge>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Current Role & Company</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6">
                      <span className="font-bold text-slate-200 block">{c.profile.current_title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">@{c.profile.current_company} ({c.profile.current_company_size})</span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Education & Tier</td>
                  {selectedCandidates.map(c => {
                    const topEdu = c.education[0];
                    return (
                      <td key={c.candidate_id} className="py-3 px-6">
                        {topEdu ? (
                          <div>
                            <span className="text-slate-200 font-semibold block">{topEdu.degree} in {topEdu.field_of_study}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{topEdu.institution} • Tier {topEdu.tier.replace("tier_", "")}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* SECTION: SKILLS COMPARISON */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    4. Technical Skills & Proficiencies
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">
                    <div>Required AI Skills Matched</div>
                    <span className="text-[10px] text-muted-foreground font-normal">Python, NLP, PyTorch, LLM, ML</span>
                  </td>
                  {selectedCandidates.map(c => {
                    const candSkillNames = c.skills.map(s => s.name.toLowerCase());
                    const matched = requiredSkills.filter(r => candSkillNames.some(cs => cs.includes(r.toLowerCase())));
                    return (
                      <td key={c.candidate_id} className="py-3.5 px-6">
                        <div className="flex flex-wrap gap-1">
                          {matched.map(skill => (
                            <Badge key={skill} variant="primary" className="text-[9px] uppercase font-mono">
                              {skill}
                            </Badge>
                          ))}
                          {matched.length === 0 && <span className="text-muted-foreground">No matches</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-300">All Top Reported Skills</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3.5 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {c.skills.slice(0, 6).map(s => (
                          <span key={s.name} className="px-1.5 py-0.5 rounded bg-slate-900 border border-border/40 text-[10px] text-slate-300 font-mono">
                            {s.name}
                          </span>
                        ))}
                        {c.skills.length > 6 && (
                          <span className="text-[9px] text-muted-foreground self-center">+{c.skills.length - 6} more</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* SECTION: COMPENSATION & AVAILABILITY */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    5. Availability, Compensation & Logistics
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Notice Period</td>
                  {selectedCandidates.map(c => {
                    const days = c.redrob_signals.notice_period_days;
                    return (
                      <td key={c.candidate_id} className="py-3 px-6 font-mono font-bold">
                        <span className={days <= 30 ? "text-success" : days <= 60 ? "text-slate-200" : "text-warning"}>
                          {days} Days
                        </span>
                        {days <= 30 && <Badge variant="success" className="ml-2 text-[9px]">Immediate</Badge>}
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Expected Salary Range</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6 font-mono text-slate-200 font-semibold">
                      ₹{c.redrob_signals.expected_salary_range_inr_lpa.min} - ₹{c.redrob_signals.expected_salary_range_inr_lpa.max} LPA
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Location & Work Mode</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6">
                      <div className="space-y-0.5">
                        <span className="text-slate-200 block">{c.profile.location}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">
                          {c.redrob_signals.preferred_work_mode} • {c.redrob_signals.willing_to_relocate ? "Willing Relocate" : "No Relocate"}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* SECTION: BEHAVIORAL & ANTI-CHEAT AUDIT */}
                <tr className="bg-slate-900/20 font-bold text-primary">
                  <td colSpan={selectedCandidates.length + 1} className="py-2.5 px-6 uppercase tracking-wider text-[10px]">
                    6. Platform Behavioral & Anti-Cheat Signals
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Recruiter Response Rate</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6 font-mono text-slate-200 font-bold">
                      {Math.round(c.redrob_signals.recruiter_response_rate * 100)}%
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">GitHub Activity Score</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6 font-mono text-slate-200">
                      {c.redrob_signals.github_activity_score >= 0 ? (
                        <span className="font-bold text-success">{c.redrob_signals.github_activity_score}/100</span>
                      ) : (
                        <span className="text-muted-foreground">Not linked</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-6 font-semibold text-slate-300">Anti-Cheat Flags Log</td>
                  {selectedCandidates.map(c => (
                    <td key={c.candidate_id} className="py-3 px-6">
                      {c.scoreBreakdown.flags.length === 0 ? (
                        <div className="flex items-center gap-1 text-success text-[11px] font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Passed All Audits
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {c.scoreBreakdown.flags.map((f, i) => (
                            <Badge key={i} variant="danger" className="text-[9px] block text-center font-mono">
                              {f.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
        <GitCompare className="h-10 w-10 text-primary animate-pulse" />
        <span>Loading Candidate Comparison Matrix...</span>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
