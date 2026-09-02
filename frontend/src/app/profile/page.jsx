"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Sliders, 
  ShieldAlert, 
  FileText, 
  TrendingUp, 
  Clock, 
  Users, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  ArrowRight, 
  Award, 
  Bell, 
  Share2, 
  Download, 
  Plus, 
  Check, 
  Filter,
  Layers,
  Activity,
  ChevronRight
} from "lucide-react";
import { useCandidates } from "@/hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const DEFAULT_PROFILE = {
  name: "Sarah Jenkins",
  title: "Lead AI & Technical Talent Partner",
  department: "Global AI & Engineering Talent Acquisition",
  company: "Redrob Enterprise AI",
  employeeId: "REC-80429",
  email: "sarah.jenkins@redrob.ai",
  phone: "+1 (415) 890-3342",
  location: "San Francisco, CA (Hybrid - Pune Hub)",
  joinedDate: "January 2024",
  status: "Active • Screening Candidates",
  bio: "Lead Technical Recruiter specializing in Machine Learning, Generative AI, and Distributed Systems hiring. Champion of fair, anti-cheat AI-assisted candidate evaluation and high-velocity talent matchmaking.",
  experienceYears: "7.5",
  targetQuarterHires: 12,
  completedQuarterHires: 9,
};

const DEFAULT_REQUISITIONS = [
  {
    id: "REQ-101",
    title: "Senior AI Engineer",
    department: "AI Research & Platform",
    location: "Pune / Noida / Hybrid",
    type: "Full-Time",
    experienceReq: "6-8 Years",
    targetHeadcount: 4,
    filledCount: 3,
    status: "Active",
    priority: "High",
    postedDate: "2026-05-10",
    keySkills: ["Python", "NLP", "PyTorch", "LLM", "RAG"]
  },
  {
    id: "REQ-102",
    title: "Staff ML Platform Engineer",
    department: "Infrastructure & Data",
    location: "Remote / USA / India",
    type: "Full-Time",
    experienceReq: "8+ Years",
    targetHeadcount: 2,
    filledCount: 1,
    status: "Active",
    priority: "Urgent",
    postedDate: "2026-05-18",
    keySkills: ["Kubernetes", "MLOps", "Kafka", "Python", "Ray"]
  },
  {
    id: "REQ-103",
    title: "Principal NLP Research Scientist",
    department: "Applied AI Core",
    location: "San Francisco / Hybrid",
    type: "Full-Time",
    experienceReq: "7+ Years",
    targetHeadcount: 1,
    filledCount: 0,
    status: "Screening",
    priority: "Medium",
    postedDate: "2026-06-01",
    keySkills: ["Transformers", "Embeddings", "Fine-Tuning", "Vector DB"]
  },
  {
    id: "REQ-104",
    title: "Fullstack AI Application Engineer",
    department: "Product Engineering",
    location: "Pune / Noida",
    type: "Full-Time",
    experienceReq: "4-6 Years",
    targetHeadcount: 3,
    filledCount: 3,
    status: "Filled",
    priority: "Standard",
    postedDate: "2026-04-12",
    keySkills: ["Next.js", "React", "TypeScript", "FastAPI", "Python"]
  }
];

const DEFAULT_SHORTLIST_MAP = {
  "CAND-0001": { stage: "Screening", starred: true, addedDate: "2026-06-20", reqId: "REQ-101" },
  "CAND-0002": { stage: "Tech Round 1", starred: true, addedDate: "2026-06-20", reqId: "REQ-101" },
  "CAND-0003": { stage: "System Design", starred: true, addedDate: "2026-06-20", reqId: "REQ-101" },
  "CAND-0004": { stage: "Offer Extended", starred: true, addedDate: "2026-06-20", reqId: "REQ-101" },
};

const DEFAULT_ACTIVITY = [
  {
    id: "act-1",
    action: "Shortlisted Candidate",
    details: "Added CAND-0012 to Technical Round 1 for Senior AI Engineer JD.",
    time: "10 mins ago",
    type: "shortlist"
  },
  {
    id: "act-2",
    action: "Scorer Weight Adjusted",
    details: "Increased Skill Match Weight to 45% and enabled Honeypot Strict Mode.",
    time: "2 hours ago",
    type: "config"
  },
  {
    id: "act-3",
    action: "Exported Candidate Ranking CSV",
    details: "Downloaded 50-candidate dossier report for hiring committee review.",
    time: "Yesterday, 4:30 PM",
    type: "export"
  },
  {
    id: "act-4",
    action: "Candidate Audited",
    details: "Inspected anti-cheat timeline overlap on CAND-0047 in Explainability Hub.",
    time: "2 days ago",
    type: "audit"
  }
];

export default function HRProfilePage() {
  const { allCandidates, filteredCandidates } = useCandidates();
  
  // Toast state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Profile State
  const [profile, setProfile] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_profile_data");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_PROFILE;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState(DEFAULT_PROFILE);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Requisitions State
  const [requisitions, setRequisitions] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_requisitions");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_REQUISITIONS;
  });

  // Shortlist State with stages
  const [shortlistedMap, setShortlistedMap] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_shortlist_map");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SHORTLIST_MAP;
  });

  const [candidateNotes, setCandidateNotes] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_candidate_notes");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Scorer Weights State
  const [scorerWeights, setScorerWeights] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_scorer_weights");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      skillMatch: 40,
      experienceMatch: 20,
      careerRelevance: 20,
      behavioralSignals: 20,
      honeypotSensitivity: "Strict",
      minScoreThreshold: 65
    };
  });

  // Activity Log State
  const [activities, setActivities] = useState(DEFAULT_ACTIVITY);

  // Notification Preferences
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hr_notifications");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      highMatchAlerts: true,
      honeypotWarning: true,
      dailyDigest: true,
      candidateStatusChange: true,
      weeklyReport: false
    };
  });

  // Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(editFormData);
    try {
      localStorage.setItem("hr_profile_data", JSON.stringify(editFormData));
    } catch {}
    setIsEditingProfile(false);
    showToast("HR Profile details updated successfully!");

    // Add activity
    const newAct = {
      id: `act-${Date.now()}`,
      action: "Profile Updated",
      details: "Recruiter bio and contact credentials updated.",
      time: "Just now",
      type: "config"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Update candidate stage
  const handleStageChange = (candidateId, stage) => {
    setShortlistedMap(prev => {
      const updated = {
        ...prev,
        [candidateId]: {
          ...(prev[candidateId] || { starred: true, addedDate: "2026-06-21", reqId: "REQ-101" }),
          stage
        }
      };
      try {
        localStorage.setItem("hr_shortlist_map", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Updated candidate ${candidateId} stage to "${stage}"`);
  };

  // Toggle star candidate
  const handleToggleStar = (candidateId) => {
    setShortlistedMap(prev => {
      const current = prev[candidateId];
      let updated;
      if (current) {
        updated = { ...prev };
        delete updated[candidateId];
        showToast(`Removed candidate ${candidateId} from shortlists.`);
      } else {
        updated = {
          ...prev,
          [candidateId]: {
            stage: "Screening",
            starred: true,
            addedDate: new Date().toISOString().split("T")[0],
            reqId: "REQ-101"
          }
        };
        showToast(`Candidate ${candidateId} added to HR shortlist!`);
      }
      try {
        localStorage.setItem("hr_shortlist_map", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Update notes
  const handleNoteChange = (candidateId, note) => {
    setCandidateNotes(prev => {
      const updated = { ...prev, [candidateId]: note };
      try {
        localStorage.setItem("hr_candidate_notes", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Save weights
  const handleSaveWeights = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("hr_scorer_weights", JSON.stringify(scorerWeights));
    } catch {}
    showToast("AI Scorer weights & anti-cheat preference saved!");
    
    // Add activity
    const newAct = {
      id: `act-${Date.now()}`,
      action: "Scorer Formula Saved",
      details: `Weights: Skill ${scorerWeights.skillMatch}%, Exp ${scorerWeights.experienceMatch}%, Career ${scorerWeights.careerRelevance}%, Behavioral ${scorerWeights.behavioralSignals}%.`,
      time: "Just now",
      type: "config"
    };
    setActivities(prev => [newAct, ...prev]);
  };

  // Reset weights to factory defaults
  const handleResetWeights = () => {
    const defaults = {
      skillMatch: 40,
      experienceMatch: 20,
      careerRelevance: 20,
      behavioralSignals: 20,
      honeypotSensitivity: "Strict",
      minScoreThreshold: 65
    };
    setScorerWeights(defaults);
    try {
      localStorage.setItem("hr_scorer_weights", JSON.stringify(defaults));
    } catch {}
    showToast("Reset AI Scorer weights to system defaults.");
  };

  // Computed recruiter stats
  const recruiterStats = useMemo(() => {
    const shortlistedCount = Object.keys(shortlistedMap).length;
    const totalPool = allCandidates.length;
    const totalOffers = Object.values(shortlistedMap).filter(v => v.stage === "Offer Extended").length;
    const interviewCount = Object.values(shortlistedMap).filter(v => v.stage?.includes("Round") || v.stage?.includes("Design")).length;
    const hiringTargetProgress = Math.round((profile.completedQuarterHires / (profile.targetQuarterHires || 1)) * 100);

    return {
      shortlistedCount,
      totalPool,
      totalOffers,
      interviewCount,
      hiringTargetProgress,
      avgTimeToHire: "17.8 days",
      acceptanceRate: "88.9%",
      activeReqCount: requisitions.filter(r => r.status === "Active" || r.status === "Screening").length
    };
  }, [allCandidates, shortlistedMap, requisitions, profile]);

  // Candidate objects in shortlisted map
  const shortlistedCandidates = useMemo(() => {
    const ids = Object.keys(shortlistedMap);
    return allCandidates.filter(c => ids.includes(c.candidate_id));
  }, [allCandidates, shortlistedMap]);

  // Export shortlisted candidates as CSV
  const handleExportShortlist = () => {
    if (shortlistedCandidates.length === 0) {
      showToast("No candidates in shortlist to export.");
      return;
    }

    const headers = ["Candidate ID", "Name", "Current Role", "Company", "Experience (Yrs)", "Location", "Match Score (%)", "Interview Stage", "Recruiter Notes"];
    const rows = shortlistedCandidates.map(c => {
      const stage = shortlistedMap[c.candidate_id]?.stage || "Screening";
      const note = (candidateNotes[c.candidate_id] || "").replace(/"/g, '""');
      return [
        c.candidate_id,
        `"${c.profile.anonymized_name}"`,
        `"${c.profile.current_title}"`,
        `"${c.profile.current_company}"`,
        c.profile.years_of_experience.toFixed(1),
        `"${c.profile.location}"`,
        c.scoreBreakdown.final_score.toFixed(1),
        `"${stage}"`,
        `"${note}"`
      ].join(",");
    });

    const csvText = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `recruiter_shortlist_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${shortlistedCandidates.length} shortlisted candidates to CSV!`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-primary/50 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Recruiter Header Dossier Card */}
      <div className="bg-slate-900 border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl glass relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Avatar and Primary Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-600/30 border-2 border-primary/40 flex items-center justify-center text-2xl font-bold text-slate-100 shadow-lg">
                {profile.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-slate-900" title="Online & Active" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{profile.name}</h1>
                <Badge variant="primary" className="font-mono text-[11px] flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {profile.employeeId}
                </Badge>
                <Badge variant="outline" className="text-success border-success/30 bg-success/5 text-[10px]">
                  Verified Recruiter
                </Badge>
              </div>

              <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary shrink-0" />
                {profile.title}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {profile.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {profile.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {profile.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportShortlist}
              className="flex items-center gap-1.5 text-xs h-9"
              title="Export Shortlist CSV Report"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              Export Shortlist
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setEditFormData(profile);
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-1.5 text-xs h-9"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>

            <Link href="/rankings">
              <Button size="sm" className="flex items-center gap-1.5 text-xs h-9">
                <Users className="h-3.5 w-3.5" />
                Screen Talent Pool
              </Button>
            </Link>
          </div>

        </div>

        {/* Recruiter Bio & Contact Strip */}
        <div className="relative z-10 mt-6 pt-6 border-t border-border/40 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recruiter Focus & Bio</span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-border/30">
              {profile.bio}
            </p>
          </div>

          <div className="space-y-2 bg-slate-950/30 p-3.5 rounded-xl border border-border/30 text-xs font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Direct Contact & Channels</span>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-success" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-[11px] pt-1">
                <Activity className="h-3.5 w-3.5 text-warning" />
                <span className="text-slate-300">{profile.status}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recruiter KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Requisitions */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Open Requisitions</CardDescription>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-50">{recruiterStats.activeReqCount} Roles</span>
              <Badge variant="primary" className="text-[10px]">Active</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">Assigned across AI & ML Platform</p>
          </CardContent>
        </Card>

        {/* Card 2: Shortlisted Candidates */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Shortlisted Talent</CardDescription>
            <Star className="h-4 w-4 text-warning fill-warning/20" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-50">{recruiterStats.shortlistedCount} Candidates</span>
              <span className="text-[10px] text-success font-medium font-mono">In Active Pipeline</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{recruiterStats.interviewCount} scheduled for tech interviews</p>
          </CardContent>
        </Card>

        {/* Card 3: Hiring Goal Progress */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Quarterly Hiring Target</CardDescription>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-50">{profile.completedQuarterHires} / {profile.targetQuarterHires}</span>
              <span className="text-xs font-bold font-mono text-success">{recruiterStats.hiringTargetProgress}%</span>
            </div>
            <Progress value={recruiterStats.hiringTargetProgress} color="bg-success" />
          </CardContent>
        </Card>

        {/* Card 4: Offer Acceptance & Velocity */}
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Offer Acceptance</CardDescription>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-50">{recruiterStats.acceptanceRate}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Avg {recruiterStats.avgTimeToHire}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">High candidate response velocity</p>
          </CardContent>
        </Card>

      </div>

      {/* Interactive Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-2">
        {[
          { id: "overview", label: "Overview & Analytics", icon: Activity },
          { id: "requisitions", label: "Job Requisitions", icon: Layers, count: requisitions.length },
          { id: "shortlist", label: "My Shortlist Pipeline", icon: Star, count: recruiterStats.shortlistedCount },
          { id: "weights", label: "AI Scorer Customizer", icon: Sliders },
          { id: "activity", label: "Activity Audit Log", icon: Clock },
          { id: "settings", label: "Recruiter Settings", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                  : "text-muted-foreground hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-primary text-slate-950 font-bold" : "bg-slate-800 text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left: Active Hiring Pipeline Funnel for HR */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Recruiter Pipeline Breakdown</CardTitle>
                <CardDescription className="text-xs">Current stage progression of candidates under active screening.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { stage: "Sourced & Evaluated", count: allCandidates.length, color: "bg-blue-500", percent: 100 },
                  { stage: "Passed AI Match Benchmark (≥ 60%)", count: allCandidates.filter(c => c.scoreBreakdown.final_score >= 60).length, color: "bg-cyan-500", percent: 78 },
                  { stage: "Shortlisted for HR Review", count: recruiterStats.shortlistedCount, color: "bg-yellow-500", percent: 34 },
                  { stage: "Technical & System Design Rounds", count: recruiterStats.interviewCount, color: "bg-purple-500", percent: 16 },
                  { stage: "Final Offer Extended", count: recruiterStats.totalOffers || 2, color: "bg-success", percent: 6 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 bg-slate-950/30 p-3 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{item.stage}</span>
                      <span className="font-mono text-muted-foreground">{item.count} profiles ({item.percent}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Right: Quick Starred Candidates Spotlight */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Priority Shortlist</CardTitle>
                  <CardDescription className="text-xs">Top ranked matches</CardDescription>
                </div>
                <button 
                  onClick={() => setActiveTab("shortlist")}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  View all
                </button>
              </CardHeader>
              <CardContent className="space-y-3">
                {shortlistedCandidates.slice(0, 4).map((c) => {
                  const stage = shortlistedMap[c.candidate_id]?.stage || "Screening";
                  const score = c.scoreBreakdown.final_score;
                  return (
                    <div key={c.candidate_id} className="p-3 rounded-xl bg-slate-950/40 border border-border/30 flex items-center justify-between hover:border-slate-700 transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-100">{c.profile.anonymized_name}</span>
                          <Badge variant="outline" className="font-mono text-[9px]">{c.candidate_id}</Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">{c.profile.current_title}</span>
                        <span className="text-[9px] text-primary font-mono font-semibold">{stage}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge 
                          variant={score >= 80 ? "success" : "primary"}
                          className="font-mono font-bold text-[10px]"
                        >
                          {score.toFixed(1)}%
                        </Badge>
                        <Link href={`/candidates/${c.candidate_id}`}>
                          <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                            Dossier
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>

          {/* Bottom Requisitions Snapshot */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Active Requisitions Under Management</CardTitle>
                <CardDescription className="text-xs">Direct oversight on candidate pools and match distributions.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab("requisitions")}
                className="text-xs"
              >
                Manage All Roles ({requisitions.length})
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-semibold bg-slate-900/40">
                      <th className="py-3 px-6">Req ID / Role</th>
                      <th className="py-3 px-6">Department</th>
                      <th className="py-3 px-6">Target Locations</th>
                      <th className="py-3 px-6">Headcount Status</th>
                      <th className="py-3 px-6">Priority</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {requisitions.slice(0, 3).map((req) => (
                      <tr key={req.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-200">{req.title}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{req.id} • {req.experienceReq}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-300">{req.department}</td>
                        <td className="py-3.5 px-6 font-mono text-muted-foreground">{req.location}</td>
                        <td className="py-3.5 px-6">
                          <span className="font-mono font-bold text-slate-200">
                            {req.filledCount} / {req.targetHeadcount} filled
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <Badge 
                            variant={req.priority === "Urgent" ? "danger" : req.priority === "High" ? "warning" : "secondary"}
                            className="font-mono text-[9px]"
                          >
                            {req.priority}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link href="/rankings">
                            <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                              View Candidates
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 2: ACTIVE JOB REQUISITIONS */}
      {activeTab === "requisitions" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Job Requisitions Portfolio</h3>
              <p className="text-xs text-muted-foreground">Monitor open positions, hiring criteria, and matched candidate pools.</p>
            </div>
            <Button size="sm" onClick={() => showToast("Job Requisition creation modal opened")} className="flex items-center gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Create New Requisition
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requisitions.map((req) => (
              <Card key={req.id} hoverEffect className="flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] bg-slate-950">{req.id}</Badge>
                        <Badge 
                          variant={req.status === "Active" ? "success" : req.status === "Screening" ? "primary" : "secondary"}
                          className="text-[10px]"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-slate-100">{req.title}</CardTitle>
                      <CardDescription className="text-xs">{req.department} • {req.type}</CardDescription>
                    </div>

                    <Badge 
                      variant={req.priority === "Urgent" ? "danger" : req.priority === "High" ? "warning" : "secondary"}
                      className="font-mono text-[10px] shrink-0"
                    >
                      {req.priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Metadata details */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/30">
                      <span className="text-muted-foreground block text-[10px]">EXPERIENCE RANGE</span>
                      <span className="font-bold text-slate-200">{req.experienceReq}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/30">
                      <span className="text-muted-foreground block text-[10px]">TARGET LOCATIONS</span>
                      <span className="font-bold text-slate-200 truncate block">{req.location}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/30">
                      <span className="text-muted-foreground block text-[10px]">HEADCOUNT PROGRESS</span>
                      <span className="font-bold text-slate-200">{req.filledCount} of {req.targetHeadcount} hired</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/30">
                      <span className="text-muted-foreground block text-[10px]">POSTED DATE</span>
                      <span className="font-bold text-slate-200">{req.postedDate}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Target Skills Profile</span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.keySkills.map(sk => (
                        <Badge key={sk} variant="outline" className="text-[10px] font-mono bg-slate-950">
                          {sk}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {allCandidates.filter(c => c.scoreBreakdown.final_score >= 60).length} matched candidates
                    </span>
                    <Link href="/rankings">
                      <Button size="sm" className="h-8 text-xs flex items-center gap-1.5">
                        Filter Rankings
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: CANDIDATE SHORTLIST & PIPELINE BOARD */}
      {activeTab === "shortlist" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">My Candidate Shortlist & Pipeline</h3>
              <p className="text-xs text-muted-foreground">Manage interview stages, add private recruiter notes, and view scores.</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="primary" className="font-mono text-xs">
                {shortlistedCandidates.length} Starred Candidates
              </Badge>
              <Link href="/rankings">
                <Button variant="outline" size="sm" className="text-xs">
                  Discover More
                </Button>
              </Link>
            </div>
          </div>

          {shortlistedCandidates.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <Star className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-semibold text-slate-200">No candidates in your shortlist yet</p>
              <p className="text-xs">Browse the Talent Pool in Candidate Rankings and star profiles to organize them into interview stages.</p>
              <Link href="/rankings">
                <Button size="sm">Go to Candidate Rankings</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {shortlistedCandidates.map((cand) => {
                const stageInfo = shortlistedMap[cand.candidate_id] || { stage: "Screening" };
                const note = candidateNotes[cand.candidate_id] || "";
                const score = cand.scoreBreakdown.final_score;

                return (
                  <Card key={cand.candidate_id} className="p-5 overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Info */}
                      <div className="flex items-start gap-4">
                        <button 
                          onClick={() => handleToggleStar(cand.candidate_id)}
                          className="mt-1 text-warning hover:scale-110 transition-transform cursor-pointer"
                          title="Remove from shortlist"
                        >
                          <Star className="h-5 w-5 fill-warning" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">{cand.profile.anonymized_name}</h4>
                            <Badge variant="outline" className="font-mono text-[10px] bg-slate-950">{cand.candidate_id}</Badge>
                            <Badge 
                              variant={score >= 80 ? "success" : score >= 60 ? "primary" : "warning"}
                              className="font-mono font-bold text-[10px]"
                            >
                              {score.toFixed(1)}% Match
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-300 font-medium">{cand.profile.current_title} @ {cand.profile.current_company}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono pt-0.5">
                            <span>Exp: {cand.profile.years_of_experience.toFixed(1)} yrs</span>
                            <span>Loc: {cand.profile.location}</span>
                            <span>Notice: {cand.redrob_signals.notice_period_days} days</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Stage Dropdown */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Interview Stage</span>
                          <select
                            value={stageInfo.stage}
                            onChange={(e) => handleStageChange(cand.candidate_id, e.target.value)}
                            className="h-8 px-3 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 font-semibold focus:outline-none focus:border-primary cursor-pointer"
                          >
                            <option value="Screening">1. Initial Screening</option>
                            <option value="Tech Round 1">2. Technical Round 1</option>
                            <option value="System Design">3. System Design & ML</option>
                            <option value="Managerial & Culture">4. Managerial & Culture</option>
                            <option value="Offer Extended">5. Offer Extended</option>
                            <option value="Rejected / Archived">6. Rejected / Archived</option>
                          </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-3 sm:pt-4">
                          <Link href={`/candidates/${cand.candidate_id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              Dossier
                            </Button>
                          </Link>
                          <Link href={`/explainability?candidate=${cand.candidate_id}`}>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              Audit
                            </Button>
                          </Link>
                        </div>
                      </div>

                    </div>

                    {/* Recruiter Note Box */}
                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-3">
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleNoteChange(cand.candidate_id, e.target.value)}
                        placeholder="Add private recruiter notes (e.g., strong in PyTorch, prefers Noida office, salary expectations discussed)..."
                        className="w-full bg-slate-950/60 border border-border/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-muted-foreground focus:outline-none focus:border-primary/60"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 4: AI SCORER WEIGHT TUNING */}
      {activeTab === "weights" && (
        <div className="space-y-6 animate-fade-in">
          
          <Card>
            <CardHeader className="border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Scoring Formula Customizer</CardTitle>
                  <CardDescription className="text-xs">
                    Fine-tune candidate ranking weights and anti-cheat sensitivity according to your team&apos;s hiring criteria.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleResetWeights} className="text-xs text-muted-foreground hover:text-slate-200">
                  Reset Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <form onSubmit={handleSaveWeights} className="space-y-6">
                
                {/* Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Skill Match */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">Skill Proficiency Weight</span>
                      <span className="font-mono text-primary font-bold">{scorerWeights.skillMatch}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      step="5"
                      value={scorerWeights.skillMatch}
                      onChange={(e) => setScorerWeights({ ...scorerWeights, skillMatch: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[10px] text-muted-foreground">Evaluates required skills overlap, duration, and assessment scores.</p>
                  </div>

                  {/* Experience Match */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">Experience Tenure Weight</span>
                      <span className="font-mono text-success font-bold">{scorerWeights.experienceMatch}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={scorerWeights.experienceMatch}
                      onChange={(e) => setScorerWeights({ ...scorerWeights, experienceMatch: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-success"
                    />
                    <p className="text-[10px] text-muted-foreground">Evaluates alignment with 6.0 - 8.0 years sweet-spot tenure.</p>
                  </div>

                  {/* Career Relevance */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">Career Trajectory Relevance</span>
                      <span className="font-mono text-warning font-bold">{scorerWeights.careerRelevance}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={scorerWeights.careerRelevance}
                      onChange={(e) => setScorerWeights({ ...scorerWeights, careerRelevance: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-warning"
                    />
                    <p className="text-[10px] text-muted-foreground">Evaluates title relevance, role seniority, and company stability.</p>
                  </div>

                  {/* Behavioral Score */}
                  <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-border/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">Behavioral Signals Weight</span>
                      <span className="font-mono text-purple-400 font-bold">{scorerWeights.behavioralSignals}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={scorerWeights.behavioralSignals}
                      onChange={(e) => setScorerWeights({ ...scorerWeights, behavioralSignals: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <p className="text-[10px] text-muted-foreground">Evaluates recruiter response, notice period, and GitHub activity.</p>
                  </div>

                </div>

                {/* Anti-Cheat & Honeypot Strictness */}
                <div className="bg-slate-950/40 p-5 rounded-xl border border-border/30 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Honeypot & Anti-Cheat Filter Sensitivity</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Strict", "Balanced", "Permissive"].map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setScorerWeights({ ...scorerWeights, honeypotSensitivity: mode })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          scorerWeights.honeypotSensitivity === mode
                            ? "bg-primary/20 border-primary text-slate-100"
                            : "bg-slate-900 border-border/60 text-muted-foreground hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{mode} Mode</span>
                          {scorerWeights.honeypotSensitivity === mode && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {mode === "Strict" ? "Deducts 100 pts per anomaly (overlaps, fake future tech)." : mode === "Balanced" ? "Deducts 50 pts with warning flags." : "Flags anomalies without direct disqualification."}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="submit" className="flex items-center gap-1.5 text-xs">
                    <Save className="h-4 w-4" />
                    Save Scoring Configuration
                  </Button>
                </div>

              </form>

            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 5: ACTIVITY & AUDIT LOG */}
      {activeTab === "activity" && (
        <div className="space-y-6 animate-fade-in">
          
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Recruiter Audit Trail & Activity Log</CardTitle>
              <CardDescription className="text-xs">Immutable record of scoring adjustments, candidate shortlists, and exports.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative pl-6 border-l-2 border-border/60 ml-3 space-y-6">
                {activities.map((act) => (
                  <div key={act.id} className="relative space-y-1">
                    <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-900 border-2 border-primary" />
                    
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h4 className="text-xs font-bold text-slate-200">{act.action}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono bg-slate-900 px-2 py-0.5 rounded border border-border/30">
                        {act.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {act.details}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 6: RECRUITER SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in">
          
          <Card>
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Alerts & Notification Preferences</CardTitle>
              <CardDescription className="text-xs">Configure automated alerts for top candidate matches and integrity warnings.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              
              {[
                { key: "highMatchAlerts", title: "High-Match Candidate Alerts", desc: "Notify when a candidate scores >= 80% against active JDs." },
                { key: "honeypotWarning", title: "Honeypot Disqualification Warnings", desc: "Alert immediately when candidate profile contains fraudulent timeline overlaps or fake tech skills." },
                { key: "candidateStatusChange", title: "Candidate Status Updates", desc: "Receive updates when candidate changes notice period or open-to-work availability." },
                { key: "dailyDigest", title: "Daily Sourcing & Ranking Digest", desc: "Daily summary email containing newly scored resumes and highest-ranking profiles." },
                { key: "weeklyReport", title: "Weekly Hiring Pipeline Report", desc: "Weekly analytics breakdown of recruiter throughput and offer acceptance metrics." }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-border/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => {
                        const updated = { ...notifications, [item.key]: e.target.checked };
                        setNotifications(updated);
                        try {
                          localStorage.setItem("hr_notifications", JSON.stringify(updated));
                        } catch {}
                        showToast("Updated notification preference.");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}

            </CardContent>
          </Card>

        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-100">Edit Recruiter Profile</h3>
                <p className="text-xs text-muted-foreground">Update your identity and talent team credentials.</p>
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-muted-foreground hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Professional Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Department</label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Organization</label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Location Hub</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Status / Availability</label>
                <input
                  type="text"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Bio & Philosophy</label>
                <textarea
                  rows={3}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-border text-slate-100 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
