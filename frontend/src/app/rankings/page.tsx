"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { useCandidates, ScoredCandidate } from "../../hooks/use-candidates";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export default function Rankings() {
  const {
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
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    availableSkills,
    requiredSkills,
    setRequiredSkills,
    preferredSkills,
    setPreferredSkills
  } = useCandidates();

  // Selected filters count
  const activeFiltersCount = 
    (minExperience > 0 ? 1 : 0) +
    (locationQuery ? 1 : 0) +
    selectedSkills.length +
    (openToWorkOnly ? 1 : 0) +
    (willingToRelocateOnly ? 1 : 0);

  // Quick reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setMinExperience(0);
    clearSkillFilters();
    setOpenToWorkOnly(false);
    setWillingToRelocateOnly(false);
  };

  // Toggle sorting
  const handleSort = (field: "score" | "experience" | "name" | "id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Selected skills for filters panel (popular ones to toggle easily)
  const popularSkills = ["Python", "NLP", "PyTorch", "LLM", "RAG", "Vector", "LangChain", "SQL", "Milvus", "Kafka"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search and Quick Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Intelligent Candidate Search</h2>
          <p className="text-xs text-muted-foreground">
            Dynamic scoring based on Senior AI Engineer Job Description (sweet spot: 6-8 years experience).
          </p>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters} 
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset all filters ({activeFiltersCount})
          </Button>
        )}
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
                <CardTitle className="text-sm font-bold tracking-tight uppercase">Talent Pool Scores</CardTitle>
                <CardDescription>
                  {filteredCandidates.length} candidate profiles matching search parameters.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Active Filter Chips */}
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
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
                    Skill: {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSkillFilter(skill)} />
                  </Badge>
                ))}
                {openToWorkOnly && (
                  <Badge variant="success" className="flex items-center gap-1">
                    Open To Work
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOpenToWorkOnly(false)} />
                  </Badge>
                )}
                {willingToRelocateOnly && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    Willing Reloc
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setWillingToRelocateOnly(false)} />
                  </Badge>
                )}
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
                        {/* Headers with Sort controls */}
                        <th className="py-3.5 px-6 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("score")}>
                          <div className="flex items-center gap-1.5">
                            Rank / Score {sortBy === "score" && <ArrowUpDown className="h-3 w-3 text-primary" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("id")}>
                          <div className="flex items-center gap-1.5">
                            Candidate ID {sortBy === "id" && <ArrowUpDown className="h-3 w-3 text-primary" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-bold">Current Role & Company</th>
                        <th className="py-3.5 px-6 font-bold cursor-pointer hover:text-slate-100" onClick={() => handleSort("experience")}>
                          <div className="flex items-center gap-1.5">
                            Experience {sortBy === "experience" && <ArrowUpDown className="h-3 w-3 text-primary" />}
                          </div>
                        </th>
                        <th className="py-3.5 px-6 font-bold">Location</th>
                        <th className="py-3.5 px-6 font-bold">Auditing Flags</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredCandidates.map((cand, index) => {
                        const score = cand.scoreBreakdown.final_score;
                        const flags = cand.scoreBreakdown.flags;
                        const isHoneypotTriggered = cand.scoreBreakdown.penalty_total >= 100;
                        const hasConsultingHistory = flags.some(f => f.includes("CONSULTING") || f.includes("SERVICE"));
                        const hasOverlap = flags.some(f => f.includes("OVERLAP"));

                        return (
                          <tr key={cand.candidate_id} className="hover:bg-slate-900/35 transition-colors group">
                            
                            {/* Rank and Match score badge */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <span className="font-bold font-mono text-slate-400 group-hover:text-slate-200">
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
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-slate-100">{cand.candidate_id}</span>
                                <span className="text-[10px] text-muted-foreground">{cand.profile.anonymized_name}</span>
                              </div>
                            </td>

                            {/* Current Title and Company */}
                            <td className="py-4 px-6">
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
                            <td className="py-4 px-6">
                              <span className="font-mono font-semibold text-slate-300">
                                {cand.profile.years_of_experience.toFixed(1)} yrs
                              </span>
                            </td>

                            {/* Location */}
                            <td className="py-4 px-6">
                              <span className="text-slate-300">{cand.profile.location}</span>
                            </td>

                            {/* Flags indicator */}
                            <td className="py-4 px-6">
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
                                  // compact label e.g. HONEYPOT_SKILL_EXP_DISCREPANCY -> Skill Discrepancy
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
                              <div className="flex justify-end space-x-1.5">
                                <Link href={`/candidates/${cand.candidate_id}`}>
                                  <Button variant="outline" size="sm" className="h-7 text-[11px] px-2 flex items-center gap-1.5">
                                    <Eye className="h-3 w-3" />
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
    </div>
  );
}
