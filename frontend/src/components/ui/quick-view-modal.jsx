"use client";

import React from "react";
import Link from "next/link";
import { 
  X, 
  Star, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Award
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularScore } from "@/components/visual/circular-score";

export function QuickViewModal({ candidate, onClose, isStarred, onToggleStar }) {
  if (!candidate) return null;

  const b = candidate.scoreBreakdown || {};
  const profile = candidate.profile || {};
  const signals = candidate.redrob_signals || {};
  const flags = b.flags || [];
  const isHoneypotTriggered = (b.penalty_total || 0) >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-slate-900 border border-border/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden glass"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleStar(candidate.candidate_id)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-slate-300 hover:text-yellow-400"
              title={isStarred ? "Remove from starred shortlist" : "Add to starred shortlist"}
            >
              <Star className={`h-5 w-5 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{profile.anonymized_name}</h2>
                <Badge variant="outline" className="font-mono text-xs">{candidate.candidate_id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{profile.current_title} @ {profile.current_company}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/candidates/${candidate.candidate_id}`}>
              <Button size="sm" className="text-xs flex items-center gap-1.5">
                Full Dossier
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-border/50 items-center">
            <div className="flex flex-col items-center justify-center border-r border-border/30 pr-2">
              <CircularScore score={b.final_score || 0} size={70} strokeWidth={6} />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Final Match Score</span>
            </div>

            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-border/40">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Skill Match</span>
                <span className="font-mono text-sm font-bold text-primary">{(b.skill_match || 0).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-border/40">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Experience</span>
                <span className="font-mono text-sm font-bold text-success">{(b.experience_match || 0).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-border/40">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Career Fit</span>
                <span className="font-mono text-sm font-bold text-warning">{(b.career_relevance || 0).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-border/40">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Behavioral</span>
                <span className="font-mono text-sm font-bold text-purple-400">{(b.behavioral_score || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2 bg-slate-950/40 p-3 rounded-lg border border-border/40">
              <MapPin className="h-4 w-4 text-red-400 shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Location</span>
                <span className="font-medium text-slate-200">{profile.location || "India"}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/40 p-3 rounded-lg border border-border/40">
              <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Total Exp</span>
                <span className="font-medium text-slate-200">{profile.years_of_experience || 0} Years</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/40 p-3 rounded-lg border border-border/40">
              <Clock className="h-4 w-4 text-warning shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Notice Period</span>
                <span className="font-medium text-slate-200">{signals.notice_period_days ?? 60} Days</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/40 p-3 rounded-lg border border-border/40">
              <DollarSign className="h-4 w-4 text-success shrink-0" />
              <div>
                <span className="text-[10px] text-muted-foreground block">Expected Salary</span>
                <span className="font-medium text-slate-200">{signals.expected_salary_range_inr_lpa?.max ? `${signals.expected_salary_range_inr_lpa.max} LPA` : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* AI Reasoning Summary */}
          {candidate.reasoning && (
            <div className="space-y-1.5 bg-primary/5 p-4 rounded-xl border border-primary/20">
              <span className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4" /> AI Fit Assessment Reasoning
              </span>
              <p className="text-slate-300 leading-relaxed">{candidate.reasoning}</p>
            </div>
          )}

          {/* Auditing Flags if any */}
          {flags.length > 0 && (
            <div className="space-y-2 bg-red-500/10 p-3.5 rounded-xl border border-red-500/30">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>Auditing & Integrity Signals ({flags.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {flags.map((flag, idx) => (
                  <Badge key={idx} variant="danger" className="text-[9px] font-mono">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills Matrix */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Top Skill Proficiencies</h3>
            <div className="flex flex-wrap gap-1.5">
              {(candidate.skills || []).map((skill, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950 border border-border/60 px-2.5 py-1 rounded-lg flex items-center gap-2"
                >
                  <span className="font-semibold text-slate-200">{skill.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-border/40">
                    {skill.proficiency || "intermediate"} ({skill.duration_months || 0}m)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Career History Snapshot */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Career Timeline</h3>
            <div className="space-y-2">
              {(candidate.career_history || []).slice(0, 3).map((job, idx) => (
                <div key={idx} className="flex justify-between items-start bg-slate-950/40 p-3 rounded-lg border border-border/40">
                  <div>
                    <span className="font-semibold text-slate-100 block">{job.title}</span>
                    <span className="text-muted-foreground text-[10px]">{job.company} • {job.industry}</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px]">
                    {job.duration_months} Months
                  </Badge>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/60 bg-slate-950/50 flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Preview
          </Button>

          <Link href={`/candidates/${candidate.candidate_id}`}>
            <Button size="sm" className="text-xs flex items-center gap-1.5">
              View Detailed Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
