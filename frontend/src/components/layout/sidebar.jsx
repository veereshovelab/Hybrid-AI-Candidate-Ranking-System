"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  ShieldQuestion, 
  Cpu, 
  Zap,
  Upload,
  RotateCcw
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useCandidates } from "../../hooks/use-candidates";

export function Sidebar() {
  const pathname = usePathname();
  const fileInputRef = useRef(null);
  const { candidates, setCandidates, resetCandidates } = useCandidates();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "KPIs and Overview"
    },
    {
      name: "Candidate Rankings",
      path: "/rankings",
      icon: Users,
      description: "Interactive Talent Table"
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      description: "Macro Talent Spreads"
    },
    {
      name: "Explainability",
      path: "/explainability",
      icon: ShieldQuestion,
      description: "Score Audit Logs"
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        let parsed = [];
        
        if (file.name.endsWith(".jsonl")) {
          // Parse JSONL line by line
          parsed = text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => JSON.parse(line));
        } else {
          // Parse standard JSON
          parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            alert("JSON file must contain an array of candidates.");
            return;
          }
        }
        
        // Basic validation: must have candidate_id
        const validCandidates = parsed.filter(c => c && typeof c === "object" && c.candidate_id);
        if (validCandidates.length === 0) {
          alert("No valid candidates found with 'candidate_id'.");
          return;
        }

        // Standardize fields to avoid crashes in React
        const standardized = validCandidates.map(c => {
          return {
            candidate_id: String(c.candidate_id),
            profile: {
              anonymized_name: String(c.profile?.anonymized_name || c.candidate_id),
              headline: String(c.profile?.headline || "Software Engineer"),
              summary: String(c.profile?.summary || ""),
              location: String(c.profile?.location || "India"),
              country: String(c.profile?.country || "India"),
              years_of_experience: Number(c.profile?.years_of_experience || 0),
              current_title: String(c.profile?.current_title || "Software Engineer"),
              current_company: String(c.profile?.current_company || "Company"),
              current_company_size: String(c.profile?.current_company_size || "11-50"),
              current_industry: String(c.profile?.current_industry || "Technology"),
              ...c.profile
            },
            career_history: (Array.isArray(c.career_history) ? c.career_history : []).map((h) => ({
              company: String(h?.company || ""),
              title: String(h?.title || ""),
              start_date: String(h?.start_date || ""),
              end_date: h?.end_date ? String(h.end_date) : null,
              duration_months: Number(h?.duration_months || 0),
              is_current: Boolean(h?.is_current),
              industry: String(h?.industry || "Technology"),
              company_size: String(h?.company_size || "11-50"),
              description: String(h?.description || ""),
            })),
            education: (Array.isArray(c.education) ? c.education : []).map((edu) => ({
              institution: String(edu?.institution || ""),
              degree: String(edu?.degree || ""),
              field_of_study: String(edu?.field_of_study || ""),
              start_year: Number(edu?.start_year || 0),
              end_year: Number(edu?.end_year || 0),
              grade: String(edu?.grade || ""),
              tier: String(edu?.tier || "tier_4"),
            })),
            skills: (Array.isArray(c.skills) ? c.skills : []).map((s) => ({
              name: String(s?.name || ""),
              proficiency: String(s?.proficiency || "intermediate"),
              endorsements: Number(s?.endorsements || 0),
              duration_months: Number(s?.duration_months || 0),
            })),
            redrob_signals: {
              profile_completeness_score: Number(c.redrob_signals?.profile_completeness_score ?? 80),
              signup_date: String(c.redrob_signals?.signup_date || "2025-01-01"),
              last_active_date: String(c.redrob_signals?.last_active_date || "2026-06-20"),
              open_to_work_flag: Boolean(c.redrob_signals?.open_to_work_flag),
              profile_views_received_30d: Number(c.redrob_signals?.profile_views_received_30d ?? 5),
              applications_submitted_30d: Number(c.redrob_signals?.applications_submitted_30d ?? 2),
              recruiter_response_rate: Number(c.redrob_signals?.recruiter_response_rate ?? 0.7),
              avg_response_time_hours: Number(c.redrob_signals?.avg_response_time_hours ?? 24),
              skill_assessment_scores: c.redrob_signals?.skill_assessment_scores || {},
              connection_count: Number(c.redrob_signals?.connection_count ?? 100),
              endorsements_received: Number(c.redrob_signals?.endorsements_received ?? 10),
              notice_period_days: Number(c.redrob_signals?.notice_period_days ?? 60),
              expected_salary_range_inr_lpa: c.redrob_signals?.expected_salary_range_inr_lpa || { min: 15, max: 25 },
              preferred_work_mode: String(c.redrob_signals?.preferred_work_mode || "hybrid"),
              willing_to_relocate: Boolean(c.redrob_signals?.willing_to_relocate),
              github_activity_score: Number(c.redrob_signals?.github_activity_score ?? -1),
              search_appearance_30d: Number(c.redrob_signals?.search_appearance_30d ?? 15),
              saved_by_recruiters_30d: Number(c.redrob_signals?.saved_by_recruiters_30d ?? 2),
              interview_completion_rate: Number(c.redrob_signals?.interview_completion_rate ?? 0.8),
              offer_acceptance_rate: Number(c.redrob_signals?.offer_acceptance_rate ?? 0.8),
              verified_email: Boolean(c.redrob_signals?.verified_email ?? true),
              verified_phone: Boolean(c.redrob_signals?.verified_phone ?? true),
              linkedin_connected: Boolean(c.redrob_signals?.linkedin_connected ?? false),
              ...c.redrob_signals
            },
            certifications: (Array.isArray(c.certifications) ? c.certifications : []).map((cert) => ({
              name: String(cert?.name || ""),
              issuer: String(cert?.issuer || ""),
              year: Number(cert?.year || 0),
            })),
            languages: (Array.isArray(c.languages) ? c.languages : []).map((lang) => ({
              language: String(lang?.language || ""),
              proficiency: String(lang?.proficiency || "intermediate"),
            })),
          };
        });

        setCandidates(standardized);
        alert(`Successfully loaded ${standardized.length} candidates!`);
      } catch (err) {
        console.error(err);
        alert("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-border flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30">
      {/* Upper Section */}
      <div className="flex flex-col flex-1 py-6 px-4">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-lg text-primary border border-primary/30 flex items-center justify-center">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              HYBRID <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/20">AI</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">CANDIDATE RANKING</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  isActive
                    ? "bg-slate-800 text-slate-100 border border-slate-700/50 shadow-inner"
                    : "text-muted-foreground hover:bg-slate-800/40 hover:text-slate-200 hover:translate-x-[2px]"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-slate-300"
                )} />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Pipeline & Upload Section */}
      <div className="p-4 border-t border-border/50 bg-slate-950/40 m-4 rounded-xl border space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-success" />
            <span>Local Engine Status</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-success animate-pulse inline-block"></span>
        </div>

        <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
          <div className="flex justify-between">
            <span>Pool Size:</span>
            <span className="text-slate-300 font-medium">{candidates.length.toLocaleString()} profiles</span>
          </div>
          <div className="flex justify-between">
            <span>RAM Usage:</span>
            <span className="text-slate-300">{(200 + candidates.length * 0.05).toFixed(1)} MB (CPU)</span>
          </div>
        </div>

        {/* Action Buttons for Upload */}
        <div className="space-y-2 pt-1 border-t border-border/30">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.jsonl"
            className="hidden"
          />
          <button
            onClick={triggerFileSelect}
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Dataset (.json/.jsonl)
          </button>
          
          {candidates.length !== 50 && (
            <button
              onClick={resetCandidates}
              className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium cursor-pointer transition-all duration-200 active:scale-95 animate-fade-in"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Sample Data
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
