"use client";

import React, { useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Briefcase, FileSearch, Sparkles, UserCheck, X } from "lucide-react";
import { useCandidates } from "@/hooks/use-candidates";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef(null);
  const { searchQuery, setSearchQuery, filteredCandidates, allCandidates } = useCandidates();

  // Determine page title based on path
  const getPageTitle = () => {
    if (pathname.startsWith("/profile")) return "Recruiter HR Profile & Workspace";
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

  // Keyboard shortcut listener: Press "/" to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable);
      
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 shrink-0 z-20">
      {/* Title */}
      <div className="flex items-center space-x-3">
        {pathname.startsWith("/profile") ? (
          <UserCheck className="h-5 w-5 text-indigo-400" />
        ) : (
          <Briefcase className="h-5 w-5 text-indigo-400" />
        )}
        <h2 className="text-md font-bold tracking-tight text-slate-100">{getPageTitle()}</h2>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400/70" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search candidate ID, skills, company..."
          className="w-full h-9 pl-10 pr-9 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-2.5 top-2.5 hidden sm:inline-flex items-center justify-center h-4 px-1.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/80 rounded pointer-events-none opacity-80">
            /
          </kbd>
        )}
      </div>

      {/* Active Role Info & Recruiter Profile Avatar */}
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-bold text-slate-100">Senior AI Engineer JD</span>
          </div>
          <span className="text-[10px] text-indigo-300/70 font-mono">
            {filteredCandidates.length} matched / {allCandidates.length} candidates
          </span>
        </div>

        {/* HR Profile Quick Link */}
        <Link 
          href="/profile" 
          className={`relative group flex items-center justify-center p-0.5 rounded-full transition-all duration-200 ${
            pathname.startsWith("/profile") 
              ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950" 
              : "hover:scale-105 hover:ring-1 hover:ring-indigo-400/60"
          }`}
          title="Open HR Recruiter Profile"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 border border-indigo-400/40 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20">
            HR
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
        </Link>
      </div>
    </header>
  );
}
