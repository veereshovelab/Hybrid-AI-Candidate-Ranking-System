"use client";

import React, { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldQuestion, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown,
  Percent,
  Sliders,
  DollarSign
} from "lucide-react";
import { useCandidates } from "../../hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

function ExplainabilityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateParam = searchParams.get("candidate");

  const { allCandidates, requiredSkills, preferredSkills, minJobExp } = useCandidates();

  // Calculate initial ID
  const initialId = useMemo(() => {
    if (candidateParam && allCandidates.some(c => c.candidate_id === candidateParam)) {
      return candidateParam;
    }
    return allCandidates[0] ? allCandidates[0].candidate_id : "";
  }, [allCandidates, candidateParam]);

  const [selectedId, setSelectedId] = useState(initialId);

  // Sync state with url/context updates
  const [prevInitialId, setPrevInitialId] = useState(initialId);
  if (initialId !== prevInitialId) {
    setSelectedId(initialId);
    setPrevInitialId(initialId);
  }

  // Handle dropdown selection change
  const handleCandidateChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    // Sync query parameters for bookmarkable URL
    router.replace(`/explainability?candidate=${id}`);
  };

  // Selected candidate object
  const candidate = useMemo(() => {
    return allCandidates.find(c => c.candidate_id === selectedId);
  }, [allCandidates, selectedId]);

  // Compute breakdowns
  const details = useMemo(() => {
    if (!candidate) return null;
    const { scoreBreakdown, profile, skills, career_history, redrob_signals } = candidate;

    // Check specific rule flags
    const hasNLPSearch = skills.some(s => 
      ["nlp", "llm", "retrieval", "embeddings", "vector", "ranking", "rag"].includes(s.name.toLowerCase())
    );

    const hasConsulting = scoreBreakdown.flags.some(f => f.includes("CONSULTING") || f.includes("SERVICE"));
    const hasOverlap = scoreBreakdown.flags.some(f => f.includes("OVERLAP"));

    return {
      scoreBreakdown,
      hasNLPSearch,
      hasConsulting,
      hasOverlap,
      skillsCount: skills.length,
      historyCount: career_history.length,
      yearsExp: profile.years_of_experience
    };
  }, [candidate]);

  if (!candidate || !details) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <ShieldQuestion className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-pulse" />
        <span>Loading explainability context...</span>
      </div>
    );
  }

  const { scoreBreakdown } = details;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header and Selector dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldQuestion className="h-5 w-5 text-primary" />
            Decision Explainability Engine
          </h2>
          <p className="text-xs text-muted-foreground">
            Audit ML scoring criteria, examine honeypot trigger logs, and evaluate matching equations.
          </p>
        </div>

        {/* Dropdown selector */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-300">Auditing profile:</span>
          <select
            value={selectedId}
            onChange={handleCandidateChange}
            className="h-10 px-3 rounded-lg bg-slate-900 border border-border text-xs text-slate-100 font-medium focus:outline-none focus:border-primary"
          >
            {allCandidates.map(c => (
              <option key={c.candidate_id} value={c.candidate_id}>
                {c.candidate_id} - {c.profile.anonymized_name} ({c.scoreBreakdown.final_score.toFixed(1)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns (Breakdowns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main composition card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Score Composition Equations</CardTitle>
              <CardDescription className="text-xs">Formula: (Skill x 0.40) + (Exp x 0.20) + (Career x 0.20) + (Behavior x 0.20) - Penalties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Skill Match */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">1. Skill Match Weight (40%)</span>
                  <span className="font-mono text-primary font-bold">
                    {scoreBreakdown.skill_match.toFixed(1)}/100 (x0.4 = {(scoreBreakdown.skill_match * 0.4).toFixed(2)} pts)
                  </span>
                </div>
                <Progress value={scoreBreakdown.skill_match} color="bg-primary" />
              </div>

              {/* Experience Match */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">2. Experience Match Weight (20%)</span>
                  <span className="font-mono text-success font-bold">
                    {scoreBreakdown.experience_match.toFixed(1)}/100 (x0.2 = {(scoreBreakdown.experience_match * 0.2).toFixed(2)} pts)
                  </span>
                </div>
                <Progress value={scoreBreakdown.experience_match} color="bg-success" />
              </div>

              {/* Career Relevance */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">3. Career Relevance Weight (20%)</span>
                  <span className="font-mono text-warning font-bold">
                    {scoreBreakdown.career_relevance.toFixed(1)}/100 (x0.2 = {(scoreBreakdown.career_relevance * 0.2).toFixed(2)} pts)
                  </span>
                </div>
                <Progress value={scoreBreakdown.career_relevance} color="bg-warning" />
              </div>

              {/* Behavioral Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">4. Behavioral Score Weight (20%)</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {scoreBreakdown.behavioral_score.toFixed(1)}/100 (x0.2 = {(scoreBreakdown.behavioral_score * 0.2).toFixed(2)} pts)
                  </span>
                </div>
                <Progress value={scoreBreakdown.behavioral_score} color="bg-purple-500" />
              </div>

              {/* Penalties */}
              {scoreBreakdown.penalty_total > 0 && (
                <div className="space-y-2 bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center text-xs text-red-400">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Automated Penalty Deduction
                    </span>
                    <span className="font-mono font-bold font-bold">-{scoreBreakdown.penalty_total.toFixed(1)} Points</span>
                  </div>
                  <p className="text-[10px] text-red-300/80 leading-relaxed font-mono">
                    Candidate failed safety filters or triggered honeypots. Deducted directly from weighted score.
                  </p>
                </div>
              )}

              {/* Formula Summation */}
              <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
                <div className="text-[11px] text-muted-foreground">
                  <span>Calculated: </span>
                  <span className="text-slate-300">
                    {((scoreBreakdown.skill_match * 0.4) + (scoreBreakdown.experience_match * 0.2) + (scoreBreakdown.career_relevance * 0.2) + (scoreBreakdown.behavioral_score * 0.2)).toFixed(2)}
                    {scoreBreakdown.penalty_total > 0 ? ` - ${scoreBreakdown.penalty_total.toFixed(0)}` : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-xl border border-border">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Final Score:</span>
                  <span className="text-lg font-bold text-slate-100">{scoreBreakdown.final_score.toFixed(1)}%</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Matching Rule Audit logs</CardTitle>
              <CardDescription className="text-xs">Verifying individual constraints defined in the challenge sweet-spot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              
              {/* Experience check */}
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-slate-300">Experience Tenure constraint:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground font-mono">{details.yearsExp} Years</span>
                  {details.yearsExp >= 5 ? (
                    <Badge variant="success">PASS</Badge>
                  ) : (
                    <Badge variant="danger">UNDER_EXPERIENCED</Badge>
                  )}
                </div>
              </div>

              {/* NLP check */}
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-slate-300">Core NLP / Search check:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground font-mono">{details.hasNLPSearch ? "NLP/LLM Skills Present" : "Missing NLP Core"}</span>
                  {details.hasNLPSearch ? (
                    <Badge variant="success">PASS</Badge>
                  ) : (
                    <Badge variant="warning">NO_NLP_PENALTY</Badge>
                  )}
                </div>
              </div>

              {/* Company check */}
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-slate-300">Consulting Stability check:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground font-mono">{details.hasConsulting ? "Consulting firm history" : "Direct Enterprise focus"}</span>
                  {details.hasConsulting ? (
                    <Badge variant="warning">PENALIZED</Badge>
                  ) : (
                    <Badge variant="success">PASS</Badge>
                  )}
                </div>
              </div>

              {/* Overlap timeline */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Timeline Overlaps Check:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground font-mono">{details.hasOverlap ? "Overlap > 4m detected" : "Clean chronologies"}</span>
                  {details.hasOverlap ? (
                    <Badge variant="danger">HONEYPOT_FAIL</Badge>
                  ) : (
                    <Badge variant="success">PASS</Badge>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Column: Security Audits */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-red-400">Security & Honeypot Auditor</CardTitle>
              <CardDescription className="text-xs">ML anti-cheat filters checks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-xs font-mono">
              
              {/* Box: Honeypot Flags */}
              <div className="space-y-3">
                <span className="text-slate-300 font-semibold uppercase tracking-wider block text-[10px]">Honeypot Trigger logs</span>
                
                {scoreBreakdown.flags.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-border text-center text-success flex flex-col items-center justify-center space-y-1.5">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-[11px] font-bold">All safety checks passed</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scoreBreakdown.flags.map((flag, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-red-950/15 border border-red-500/20 text-red-400 flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-[10px]">
                          <span className="font-bold block uppercase tracking-wider">{flag.replace(/_/g, " ")}</span>
                          <span className="text-red-300/80 leading-normal block">Deducted -100 pts from score. Honeypot check detected inconsistent candidate profile metrics.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sweet spot check parameters */}
              <div className="pt-4 border-t border-border/40 space-y-2.5">
                <span className="text-slate-300 font-semibold uppercase tracking-wider block text-[10px]">Job sweet-spot parameters</span>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[9px]">SWEET SPOT EXP</span>
                    <span className="text-slate-300 font-bold">6.0 - 8.0 Years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px]">MIN EXPERIENCE</span>
                    <span className="text-slate-300 font-bold">{minJobExp} Years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px]">REQUIRED SKILLS</span>
                    <span className="text-slate-300 font-bold">{requiredSkills.length} defined</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px]">PREFERRED SKILLS</span>
                    <span className="text-slate-300 font-bold">{preferredSkills.length} defined</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function Explainability() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
        <ShieldQuestion className="h-10 w-10 text-primary animate-pulse" />
        <span>Loading explainability auditor...</span>
      </div>
    }>
      <ExplainabilityContent />
    </Suspense>
  );
}
