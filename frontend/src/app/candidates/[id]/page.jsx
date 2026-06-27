"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  BookOpen
} from "lucide-react";
import { useCandidates } from "../../../hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { CircularScore } from "../../../components/visual/circular-score";

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function CandidateDetail({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const candidateId = resolvedParams.id;

  const { allCandidates } = useCandidates();

  // Find candidate details
  const candidate = useMemo(() => {
    return allCandidates.find(c => c.candidate_id === candidateId);
  }, [allCandidates, candidateId]);

  // Generate dynamic AI reasoning highlights based on candidate scores
  const aiReasoning = useMemo(() => {
    if (!candidate) return { highlights: [], concerns: [] };
    const { profile, skills, redrob_signals, scoreBreakdown } = candidate;
    const highlights = [];
    const concerns = [];

    // Experience Check
    if (profile.years_of_experience >= 6 && profile.years_of_experience <= 8) {
      highlights.push(`Matches the experience sweet spot perfectly with ${profile.years_of_experience} years of ML/Software engineering history.`);
    } else if (profile.years_of_experience >= 5) {
      highlights.push(`Strong engineering background with ${profile.years_of_experience} years of experience.`);
    } else {
      concerns.push(`Shortfall in experience: Candidate has ${profile.years_of_experience} years, below the requested 5-year minimum.`);
    }

    // Skills Check
    const candidateSkillNames = skills.map(s => s.name.toLowerCase());
    const matchedRequired = ["python", "nlp", "pytorch", "llm", "machine learning"].filter(s => 
      candidateSkillNames.some(cs => cs.includes(s) || s.includes(cs))
    );
    if (matchedRequired.length >= 4) {
      highlights.push(`Excellent skill overlap. Demonstrates proficiency in core required technologies: ${matchedRequired.map(s => s.toUpperCase()).join(", ")}.`);
    } else if (matchedRequired.length > 0) {
      highlights.push(`Matches some required skills: ${matchedRequired.map(s => s.toUpperCase()).join(", ")}.`);
    } else {
      concerns.push("Lacks required AI/NLP core skills in profile (Python, NLP, PyTorch, LLMs).");
    }

    // Honeypot/Red flag Checks
    if (scoreBreakdown.penalty_total >= 100) {
      concerns.push(`Triggered critical automated audit checks (Honeypot Penalty: -${scoreBreakdown.penalty_total} pts). See Explainability for flag log.`);
    }
    const consultingHistory = scoreBreakdown.flags.some(f => f.includes("CONSULTING") || f.includes("SERVICE"));
    if (consultingHistory) {
      concerns.push("Consulting firm history detected in timeline (Wipro/TCS/Infosys/Accenture), score penalized for role stability.");
    }

    // Behavioral Signals Check
    if (redrob_signals.recruiter_response_rate >= 0.75) {
      highlights.push(`High recruiter engagement: responds to messages at a ${Math.round(redrob_signals.recruiter_response_rate * 100)}% rate.`);
    }
    if (redrob_signals.github_activity_score >= 70) {
      highlights.push(`Active open-source contributor with high GitHub Activity score of ${redrob_signals.github_activity_score}/100.`);
    }
    if (redrob_signals.notice_period_days <= 30) {
      highlights.push(`Highly available: Notice period is only ${redrob_signals.notice_period_days} days.`);
    } else if (redrob_signals.notice_period_days > 90) {
      concerns.push(`Notice period is ${redrob_signals.notice_period_days} days. Candidate may require buyout or transition grace period.`);
    }

    return { highlights, concerns };
  }, [candidate]);

  if (!candidate) {
    return (
      <div className="p-8 text-center text-muted-foreground max-w-xl mx-auto space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Candidate Not Found</h3>
        <p className="text-sm">The requested candidate ID {candidateId} does not exist in the active pool.</p>
        <Link href="/rankings">
          <Button variant="primary">Return to rankings</Button>
        </Link>
      </div>
    );
  }

  const { profile, career_history, education, skills, certifications, redrob_signals, scoreBreakdown } = candidate;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1.5 text-xs">
          <ArrowLeft className="h-4 w-4" />
          Back to Rankings
        </Button>
        <Link href={`/explainability?candidate=${candidateId}`}>
          <Button variant="ghost" size="sm" className="text-xs text-primary flex items-center gap-1.5">
            Audit Score Breakdown
            <Sparkles className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Candidate Dossier Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Profile Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                {profile.anonymized_name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-100">{profile.anonymized_name}</h2>
                  <Badge variant="outline" className="font-mono font-bold text-[10px] bg-slate-950">{candidateId}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-300">{profile.headline}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono pt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}, {profile.country}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {profile.years_of_experience.toFixed(1)} years exp</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Professional Summary</span>
              <p className="text-xs leading-5 text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-border/40">
                {profile.summary}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Match Score Card */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Scoring Classification</CardTitle>
            <CardDescription className="text-xs">Overall compatibility metric</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <CircularScore score={scoreBreakdown.final_score} size="lg" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200 uppercase">
                {scoreBreakdown.final_score >= 80 ? "Top Shortlist Pick" : scoreBreakdown.final_score >= 60 ? "Qualified Candidate" : "Unsuitable / Penalized"}
              </span>
              <p className="text-[10px] text-muted-foreground max-w-[200px]">
                Calculated on weights: Skills (40%), Exp (20%), Career Relevance (20%), Behavior (20%).
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* AI Generated Reasoning */}
      <Card>
        <CardHeader className="border-b border-border/30 bg-slate-900/10">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-warning fill-warning/10" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Scorer Fit Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Strong Indicators
            </h4>
            {aiReasoning.highlights.length === 0 ? (
              <p className="text-xs text-muted-foreground">No positive match highlights identified.</p>
            ) : (
              <ul className="space-y-2">
                {aiReasoning.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-success before:font-bold">
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Concerns / Penalties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-4 w-4" /> Areas of Concern / Flags
            </h4>
            {aiReasoning.concerns.length === 0 ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pl-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                No negative signals or honeypots triggered.
              </p>
            ) : (
              <ul className="space-y-2">
                {aiReasoning.concerns.map((c, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-red-400 before:font-bold">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid: Career Timeline + Skills Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Timeline (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-border/40">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Career Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {career_history.length === 0 ? (
                <p className="text-xs text-muted-foreground">No employment timeline recorded.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-border/60 ml-3 space-y-8">
                  {career_history.map((job, idx) => (
                    <div key={idx} className="relative space-y-1">
                      {/* Timeline dot indicator */}
                      <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-900 border-2 border-primary" />
                      
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{job.title}</h4>
                          <span className="text-[11px] text-primary font-medium">@{job.company}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono bg-slate-900 px-2 py-0.5 rounded border border-border/30">
                          {job.duration_months} months
                        </span>
                      </div>
                      
                      <span className="text-[10px] font-mono text-muted-foreground block">{job.start_date} to {job.end_date || "Present"}</span>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5">
                        {job.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Education & Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-border/30 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200">{edu.degree} in {edu.field_of_study}</span>
                    <span className="text-[10px] text-muted-foreground block">{edu.institution} • Tier {edu.tier.replace("tier_", "")}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono text-[9px]">{edu.grade}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono block mt-1">{edu.start_year} - {edu.end_year}</span>
                  </div>
                </div>
              ))}
              {education.length === 0 && <p className="text-xs text-muted-foreground">No academic records reported.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Skills Matrix (Right 1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Skills Matrix</CardTitle>
              <CardDescription className="text-xs">Endorsements & duration</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {skills.map((skill, idx) => {
                const colors = {
                  expert: "success",
                  advanced: "primary",
                  intermediate: "warning",
                  beginner: "secondary"
                };

                return (
                  <div key={idx} className="flex items-center justify-between border-b border-border/30 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200">{skill.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {skill.duration_months} months • {skill.endorsements} endorsements
                      </span>
                    </div>
                    <Badge variant={colors[skill.proficiency.toLowerCase()] || "secondary"} className="text-[10px] uppercase font-bold tracking-wider">
                      {skill.proficiency}
                    </Badge>
                  </div>
                );
              })}
              {skills.length === 0 && <p className="text-xs text-muted-foreground">No reported skills.</p>}
            </CardContent>
          </Card>

          {/* Behavioral Signals */}
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Behavioral Signals</CardTitle>
              <CardDescription className="text-xs">Engagement tracking metrics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Recruiter response */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Recruiter Response Rate</span>
                  <span className="font-mono text-primary font-bold">{Math.round(redrob_signals.recruiter_response_rate * 100)}%</span>
                </div>
                <Progress value={redrob_signals.recruiter_response_rate * 100} color="bg-primary" />
              </div>

              {/* GitHub score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1"><GithubIcon className="h-3.5 w-3.5 text-muted-foreground" /> GitHub Activity</span>
                  <span className="font-mono text-success font-bold">
                    {redrob_signals.github_activity_score >= 0 ? `${redrob_signals.github_activity_score}/100` : "No profile"}
                  </span>
                </div>
                <Progress value={Math.max(0, redrob_signals.github_activity_score)} color="bg-success" />
              </div>

              {/* Interview completion */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Interview Completion</span>
                  <span className="font-mono text-purple-400 font-bold">{Math.round(redrob_signals.interview_completion_rate * 100)}%</span>
                </div>
                <Progress value={redrob_signals.interview_completion_rate * 100} color="bg-purple-500" />
              </div>

              {/* Numerical details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-border/30 pt-4">
                <div>
                  <span className="text-muted-foreground block text-[10px]">NOTICE PERIOD</span>
                  <span className="font-bold text-slate-200">{redrob_signals.notice_period_days} Days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">SALARY RANGE</span>
                  <span className="font-bold text-slate-200">{redrob_signals.expected_salary_range_inr_lpa.min}-{redrob_signals.expected_salary_range_inr_lpa.max} LPA</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">WORK MODE</span>
                  <span className="font-bold text-slate-200 uppercase">{redrob_signals.preferred_work_mode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">LAST ACTIVE</span>
                  <span className="font-bold text-slate-200">{redrob_signals.last_active_date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
