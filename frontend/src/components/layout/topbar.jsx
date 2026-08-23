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
    <header className="h-16 border-b border-border bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 shrink-0 z-20">
      {/* Title */}
      <div className="flex items-center space-x-3">
        {pathname.startsWith("/profile") ? (
          <UserCheck className="h-5 w-5 text-primary" />
        ) : (
          <Briefcase className="h-5 w-5 text-primary" />
        )}
        <h2 className="text-md font-semibold text-slate-100">{getPageTitle()}</h2>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by ID, name, headline, company..."
          className="w-full h-9 pl-10 pr-9 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 placeholder-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all duration-200"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-slate-200 transition-colors"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-2.5 top-2.5 hidden sm:inline-flex items-center justify-center h-4 px-1.5 text-[10px] font-mono text-muted-foreground bg-slate-900 border border-border/60 rounded pointer-events-none opacity-80">
            /
          </kbd>
        )}
      </div>

      {/* Active Role Info & Recruiter Profile Avatar */}
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

        {/* HR Profile Quick Link */}
        <Link 
          href="/profile" 
          className={`relative group flex items-center justify-center p-0.5 rounded-full transition-all duration-200 ${
            pathname.startsWith("/profile") 
              ? "ring-2 ring-primary ring-offset-2 ring-offset-slate-900" 
              : "hover:scale-105 hover:ring-1 hover:ring-primary/50"
          }`}
          title="Open HR Recruiter Profile"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 border border-primary/40 flex items-center justify-center text-xs font-bold text-slate-100 shadow-sm">
            HR
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-slate-900" />
        </Link>
      </div>
    </header>
  );
}
