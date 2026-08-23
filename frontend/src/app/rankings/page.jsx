"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  UserCheck, 
  PlaneTakeoff, 
  Calendar,
  X,
  RefreshCw,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  DollarSign,
  GitCompare,
  CheckSquare,
  Star,
  Download,
  FileSpreadsheet,
  FileCode,
  Clock
} from "lucide-react";
import { useCandidates } from "@/hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickViewModal } from "@/components/ui/quick-view-modal";

export default function Rankings() {
  const router = useRouter();
  const {
    candidates,
    filteredCandidates,
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    minExperience,
    setMinExperience,
    selectedSkills,
    toggleSkillFilter,
    clearSkillFilters,
    openToWorkOnly,
    setOpenToWorkOnly,
    willingToRelocateOnly,
    setWillingToRelocateOnly,
    starredOnly,
    setStarredOnly,
    maxNoticePeriod,
    setMaxNoticePeriod,
    maxSalary,
    setMaxSalary,
    starredIds,
    toggleStarCandidate,
    isCandidateStarred,
    exportToCSV,
    exportToJSON,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useCandidates();

  // Selected candidates for side-by-side comparison
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  // Quick View Modal Candidate
  const [quickViewCandidate, setQuickViewCandidate] = useState(null);
  // Export Menu Open Toggle
  const [showExportMenu, setShowExportMenu] = useState(false);

  const toggleCompareSelect = (candidateId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      }
      if (prev.length >= 3) {
        alert("You can select up to 3 candidates for side-by-side comparison.");
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const handleLaunchComparison = () => {
    if (selectedForCompare.length < 2) return;
    const params = new URLSearchParams();
    params.set("c1", selectedForCompare[0]);
    params.set("c2", selectedForCompare[1]);
    if (selectedForCompare[2]) params.set("c3", selectedForCompare[2]);
    router.push(`/compare?${params.toString()}`);
  };

  // Selected filters count
  const activeFiltersCount = 
    (searchQuery.trim() !== "" ? 1 : 0) +
    (minExperience > 0 ? 1 : 0) +
    (locationQuery ? 1 : 0) +
    selectedSkills.length +
    (openToWorkOnly ? 1 : 0) +
    (willingToRelocateOnly ? 1 : 0) +
    (starredOnly ? 1 : 0) +
    (maxNoticePeriod > 0 ? 1 : 0) +
    (maxSalary > 0 ? 1 : 0);

  // Quick reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setMinExperience(0);
    clearSkillFilters();
    setOpenToWorkOnly(false);
    setWillingToRelocateOnly(false);
    setStarredOnly(false);
    setMaxNoticePeriod(0);
    setMaxSalary(0);
  };

  // Toggle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Popular skills chips
  const popularSkills = ["Python", "NLP", "PyTorch", "LLM", "RAG", "Vector", "LangChain", "SQL", "Milvus", "Kafka"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search and Quick Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Intelligent Candidate Search
            {starredIds.length > 0 && (
              <Badge variant="warning" className="font-mono text-[10px] flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {starredIds.length} Starred
              </Badge>
            )}
          </h2>
          <p className="text-xs text-muted-foreground">
            AI-powered hybrid scoring matching candidate skills, experience & behavioral metrics (sweet spot: 6-8 years experience).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-8 text-xs flex items-center gap-1.5 border-border/80 hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              Export Shortlist
            </Button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-slate-900 border border-border/80 rounded-xl shadow-2xl py-1.5 z-40 animate-fade-in glass"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => {
                    exportToCSV(filteredCandidates);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-success" />
                  Export as CSV Report
                </button>
                <button
                  onClick={() => {
                    exportToJSON(filteredCandidates);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileCode className="h-4 w-4 text-warning" />
                  Export as JSON Dataset
                </button>
                {starredIds.length > 0 && (
                  <button
                    onClick={() => {
                      const starredList = filteredCandidates.filter(c => starredIds.includes(c.candidate_id));
                      exportToCSV(starredList.length > 0 ? starredList : filteredCandidates.filter(c => starredIds.includes(c.candidate_id)), "redrob_starred_candidates.csv");
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-yellow-400 hover:bg-slate-800 flex items-center gap-2 border-t border-border/40"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    Export Starred Only ({starredIds.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comparison Launcher */}
          {selectedForCompare.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-xl animate-fade-in">
              <span className="text-xs text-primary font-semibold">
                {selectedForCompare.length} selected
              </span>
              <Button
                size="sm"
                onClick={handleLaunchComparison}
                disabled={selectedForCompare.length < 2}
                className="h-7 text-xs flex items-center gap-1 px-2.5"
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare Now
              </Button>
              <button
                onClick={() => setSelectedForCompare([])}
                className="text-muted-foreground hover:text-red-400 p-0.5"
                title="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters} 
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset filters ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Grid: Filters Sidebar + Results Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Scoring Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Keyword / Candidate Search Input */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" /> Keyword / Name Search
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate, role, skill..."
                    className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 placeholder-muted-foreground focus:outline-none focus:border-primary/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-slate-200"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Starred Shortlist Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setStarredOnly(!starredOnly)}
                  className={`w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                    starredOnly 
                      ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-300" 
                      : "bg-slate-950 border-border/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Star className={`h-4 w-4 ${starredOnly ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"}`} />
                  {starredOnly ? "Showing Starred Only" : `Show Starred (${starredIds.length})`}
                </button>
              </div>

              {/* Experience slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Min Experience</span>
                  <span className="font-mono text-primary font-bold">{minExperience}+ Yrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary border border-slate-700"
                />
              </div>

              {/* Location query */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Location Hub
                </span>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. Pune, Noida, USA..."
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 placeholder-muted-foreground focus:outline-none focus:border-primary/60"
                />
              </div>

              {/* Notice Period Filter */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Max Notice Period
                </span>
                <select
                  value={maxNoticePeriod}
                  onChange={(e) => setMaxNoticePeriod(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 focus:outline-none focus:border-primary/60 cursor-pointer"
                >
                  <option value={0}>Any Notice Period</option>
                  <option value={30}>≤ 30 Days (Immediate / Fast)</option>
                  <option value={60}>≤ 60 Days</option>
                  <option value={90}>≤ 90 Days</option>
                </select>
              </div>

              {/* Expected Salary Range Filter */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Max Expected Salary
                </span>
                <select
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-border text-xs text-slate-200 focus:outline-none focus:border-primary/60 cursor-pointer"
                >
                  <option value={0}>Any Salary Expectation</option>
                  <option value={20}>≤ 20 LPA</option>
                  <option value={30}>≤ 30 LPA</option>
                  <option value={40}>≤ 40 LPA</option>
                </select>
              </div>

              {/* Skills filters */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300">Filter by Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkillFilter(skill)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-all duration-150 ${
                          isSelected 
                            ? "bg-primary/25 border-primary text-primary" 
                            : "bg-slate-900 border-border/80 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability flags */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <span className="text-xs font-semibold text-slate-300">Availability Signals</span>
                
                {/* Open to Work flag */}
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={openToWorkOnly}
                    onChange={(e) => setOpenToWorkOnly(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-950 border-border accent-primary focus:ring-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-success" />
                    <span>Open to Work only</span>
                  </div>
                </label>

                {/* Willing to Relocate */}
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={willingToRelocateOnly}
                    onChange={(e) => setWillingToRelocateOnly(e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-950 border-border accent-primary focus:ring-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <PlaneTakeoff className="h-3.5 w-3.5 text-warning" />
                    <span>Willing to Relocate only</span>
                  </div>
                </label>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Candidate Rankings List Table */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 bg-slate-900/40 border-b border-border/50">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight uppercase flex items-center gap-2">
                  Talent Pool Scores
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {filteredCandidates.length}/{candidates.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Showing {filteredCandidates.length} of {candidates.length} candidate profiles matching search parameters.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Active Filter Chips */}
                {searchQuery.trim() !== "" && (
                  <Badge variant="primary" className="flex items-center gap-1">
                    Search: &quot;{searchQuery}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {starredOnly && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    Starred Only
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setStarredOnly(false)} />
                  </Badge>
                )}
                {openToWorkOnly && (
                  <Badge variant="success" className="flex items-center gap-1">
                    Open to Work
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOpenToWorkOnly(false)} />
                  </Badge>
                )}
                {willingToRelocateOnly && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    Relocate Only
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setWillingToRelocateOnly(false)} />
                  </Badge>
                )}
                {minExperience > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Exp ≥ {minExperience} yrs
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMinExperience(0)} />
                  </Badge>
                )}
                {locationQuery && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Loc: {locationQuery}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocationQuery("")} />
                  </Badge>
                )}
                {maxNoticePeriod > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Notice ≤ {maxNoticePeriod}d
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxNoticePeriod(0)} />
                  </Badge>
                )}
                {maxSalary > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Salary ≤ {maxSalary} LPA
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxSalary(0)} />
                  </Badge>
                )}
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    Skill: {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSkillFilter(skill)} />
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCandidates.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center space-y-3">
                  <AlertTriangle className="h-10 w-10 text-warning" />
                  <span className="text-sm">No candidates match your current filter selection.</span>
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 text-muted-foreground font-semibold bg-slate-900/20">
                        {/* Star Shortlist Bookmark */}
                        <th className="py-3.5 px-3 w-10 text-center">
                          <Star className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
                        </th>
                        {/* Compare Selection Checkbox */}
                        <th className="py-3.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedForCompare.length > 0 && selectedForCompare.length === Math.min(3, filteredCandidates.length)}
                            onChange={() => {
                              if (selectedForCompare.length > 0) {
                                setSelectedForCompare([]);
                              } else {
                                setSelectedForCompare(filteredCandidates.slice(0, 3).map(c => c.candidate_id));
                              }
                            }}
                            className="h-3.5 w-3.5 rounded bg-slate-950 border-border accent-primary cursor-pointer"
                            title="Toggle select top 3 candidates for comparison"
                          />
                        </th>
                        {/* Headers with Sort controls */}
                        <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("score")}>
                          <div className="flex items-center gap-1.5">
                            Rank / Score {sortBy === "score" ? (sortOrder === "desc" ? <ArrowDown className="h-3.5 w-3.5 text-primary" /> : <ArrowUp className="h-3.5 w-3.5 text-primary" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("id")}>
                          <div className="flex items-center gap-1.5">
                            Candidate ID {sortBy === "id" ? (sortOrder === "desc" ? <ArrowDown className="h-3.5 w-3.5 text-primary" /> : <ArrowUp className="h-3.5 w-3.5 text-primary" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 font-bold">Current Role & Company</th>
                        <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("experience")}>
                          <div className="flex items-center gap-1.5">
                            Experience {sortBy === "experience" ? (sortOrder === "desc" ? <ArrowDown className="h-3.5 w-3.5 text-primary" /> : <ArrowUp className="h-3.5 w-3.5 text-primary" />) : <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-4 font-bold">Location</th>
                        <th className="py-3.5 px-4 font-bold">Auditing Flags</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredCandidates.map((cand, index) => {
                        const score = cand.scoreBreakdown.final_score;
                        const flags = cand.scoreBreakdown.flags;
                        const isHoneypotTriggered = cand.scoreBreakdown.penalty_total >= 100;
                        const isSelected = selectedForCompare.includes(cand.candidate_id);
                        const isStarred = isCandidateStarred(cand.candidate_id);

                        return (
                          <tr key={cand.candidate_id} className={`hover:bg-slate-900/35 transition-colors group ${isSelected ? "bg-primary/5" : ""}`}>
                            
                            {/* Star Toggle */}
                            <td className="py-4 px-3 text-center">
                              <button
                                onClick={() => toggleStarCandidate(cand.candidate_id)}
                                className="p-1 rounded hover:bg-slate-800 transition-colors text-muted-foreground hover:text-yellow-400"
                                title={isStarred ? "Remove star" : "Star candidate"}
                              >
                                <Star className={`h-4 w-4 ${isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                              </button>
                            </td>

                            {/* Compare Checkbox */}
                            <td className="py-4 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleCompareSelect(cand.candidate_id)}
                                className="h-4 w-4 rounded bg-slate-950 border-border accent-primary focus:ring-0 cursor-pointer"
                                title="Select for side-by-side comparison"
                              />
                            </td>

                            {/* Rank and Match score badge */}
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2.5">
                                <span className="font-bold font-mono text-slate-400 group-hover:text-slate-200 text-xs">
                                  #{index + 1}
                                </span>
                                <Badge
                                  variant={score >= 80 ? "success" : score >= 60 ? "primary" : score > 0 ? "warning" : "danger"}
                                  className="font-mono font-bold px-2 py-0.5"
                                >
                                  {score.toFixed(1)}%
                                </Badge>
                              </div>
                            </td>

                            {/* Candidate ID & name */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-100">{cand.candidate_id}</span>
                                  {cand.redrob_signals?.open_to_work_flag && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" title="Open to Work Immediately" />
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{cand.profile.anonymized_name}</span>
                              </div>
                            </td>

                            {/* Current Title and Company */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-200 group-hover:text-primary transition-colors">
                                  {cand.profile.current_title}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  @{cand.profile.current_company}
                                </span>
                              </div>
                            </td>

                            {/* Years of experience */}
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="font-mono font-semibold text-slate-300">
                                  {cand.profile.years_of_experience.toFixed(1)} yrs
                                </span>
                                {cand.redrob_signals?.notice_period_days !== undefined && (
                                  <span className="text-[9px] text-muted-foreground font-mono">
                                    {cand.redrob_signals.notice_period_days <= 30 ? "⚡ Fast Joiner" : `${cand.redrob_signals.notice_period_days}d notice`}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-4 px-4">
                              <span className="text-slate-300">{cand.profile.location}</span>
                            </td>

                            {/* Flags indicator */}
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1">
                                {isHoneypotTriggered && (
                                  <Badge variant="danger" className="text-[9px] font-mono py-0 px-1.5">HONEYPOT</Badge>
                                )}
                                {cand.scoreBreakdown.penalty_total > 0 && !isHoneypotTriggered && (
                                  <Badge variant="warning" className="text-[9px] font-mono py-0 px-1.5">PENALIZED</Badge>
                                )}
                                {flags.length === 0 && (
                                  <Badge variant="secondary" className="text-[9px] font-mono py-0 px-1.5 opacity-60">PASS</Badge>
                                )}
                                {flags.slice(0, 2).map((f, idx) => {
                                  let label = f.replace("HONEYPOT_", "").replace("FLAG_", "").replace(/_/g, " ");
                                  if (label.length > 15) label = label.substring(0, 15) + "..";
                                  return (
                                    <Badge key={idx} variant="outline" className="text-[9px] font-mono py-0 px-1 border-yellow-500/30 text-yellow-500 bg-yellow-500/5">
                                      {label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </td>

                            {/* View Action buttons */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end items-center space-x-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setQuickViewCandidate(cand)}
                                  className="h-7 text-[11px] px-2 text-slate-300 hover:text-white hover:bg-slate-800" 
                                  title="Quick View Candidate Dossier"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Link href={`/compare?c1=${cand.candidate_id}&c2=${filteredCandidates[0]?.candidate_id === cand.candidate_id ? filteredCandidates[1]?.candidate_id || "CAND-0002" : filteredCandidates[0]?.candidate_id || "CAND-0001"}`}>
                                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10" title="Compare with benchmark">
                                    <GitCompare className="h-3 w-3" />
                                  </Button>
                                </Link>
                                <Link href={`/candidates/${cand.candidate_id}`}>
                                  <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 flex items-center gap-1">
                                    Dossier
                                  </Button>
                                </Link>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Quick View Modal */}
      {quickViewCandidate && (
        <QuickViewModal
          candidate={quickViewCandidate}
          onClose={() => setQuickViewCandidate(null)}
          isStarred={isCandidateStarred(quickViewCandidate.candidate_id)}
          onToggleStar={toggleStarCandidate}
        />
      )}
    </div>
  );
}
