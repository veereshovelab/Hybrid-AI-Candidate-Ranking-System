"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Briefcase, FileSearch, Sparkles } from "lucide-react";
import { useCandidates } from "../../hooks/use-candidates";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery, filteredCandidates, allCandidates } = useCandidates();

  // Determine page title based on path
  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/rankings")) return "Candidate Discovery Rankings";
    if (pathname.startsWith("/candidates")) return "Candidate Detail Dossier";
    if (pathname.startsWith("/analytics")) return "Macro Talent Pool Analytics";
    if (pathname.startsWith("/explainability")) return "Explainability & Audit Logs";
    return "AI Recruitment Hub";
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If user is typing in search but is not on rankings page, redirect to rankings page so they see results
    if (pathname !== "/rankings" && !pathname.startsWith("/candidates")) {
      router.push("/rankings");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 shrink-0 z-20">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <Briefcase className="h-5 w-5 text-primary" />
        <h2 className="text-md font-semibold text-slate-100">{getPageTitle()}</h2>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by ID, name, headline, company..."
          className="w-full h-9 pl-10 pr-4 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all duration-200"
        />
      </div>

      {/* Active Role Info */}
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-warning fill-warning/20" />
            <span className="text-xs font-semibold text-slate-100">Senior AI Engineer JD</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {filteredCandidates.length} matched / {allCandidates.length} samples
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
          HR
        </div>
      </div>
    </header>
  );
}
