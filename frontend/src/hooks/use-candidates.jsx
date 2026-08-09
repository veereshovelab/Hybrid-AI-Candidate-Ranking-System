"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { SAMPLE_CANDIDATES } from "@/lib/sample-data";
import { scoreCandidate } from "@/utils/scorer";

const CandidatesContext = createContext(undefined);

export function CandidatesProvider({ children }) {
  // Candidate dataset state (defaults to SAMPLE_CANDIDATES)
  const [candidates, setCandidates] = useState(SAMPLE_CANDIDATES);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [minExperience, setMinExperience] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [openToWorkOnly, setOpenToWorkOnly] = useState(false);
  const [willingToRelocateOnly, setWillingToRelocateOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [maxNoticePeriod, setMaxNoticePeriod] = useState(0); // 0 = any
  const [maxSalary, setMaxSalary] = useState(0); // 0 = any

  // Sorting states
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dynamic JD Scoring Parameters (defaults match the challenge constraints)
  const [requiredSkills, setRequiredSkills] = useState([
    "python", "nlp", "pytorch", "llm", "machine learning"
  ]);
  const [preferredSkills, setPreferredSkills] = useState([
    "vector", "fine-tuning", "scikit-learn"
  ]);
  const [minJobExp, setMinJobExp] = useState(5);

  // Starred / Bookmarked Candidates persistent state
  const [starredIds, setStarredIds] = useState([]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("redrob_starred_candidates");
        if (saved) {
          setStarredIds(JSON.parse(saved));
        }
      }
    } catch (e) {
      console.error("Failed to load starred candidates from localStorage", e);
    }
  }, []);

  const toggleStarCandidate = (candidateId) => {
    setStarredIds(prev => {
      const next = prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId];
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("redrob_starred_candidates", JSON.stringify(next));
        }
      } catch (e) {
        console.error("Failed to save starred candidates", e);
      }
      return next;
    });
  };

  const isCandidateStarred = (candidateId) => starredIds.includes(candidateId);

  // Reset candidates helper
  const resetCandidates = () => {
    setCandidates(SAMPLE_CANDIDATES);
  };

  // Compute all unique skills in the dataset for filtering UI
  const availableSkills = useMemo(() => {
    const skillSet = new Set();
    candidates.forEach(cand => {
      cand.skills.forEach(s => {
        if (s.name) skillSet.add(s.name);
      });
    });
    return Array.from(skillSet).sort();
  }, [candidates]);

  // 1. Process candidate scores based on JD parameters
  const allCandidates = useMemo(() => {
    const reqSet = new Set(requiredSkills.map(s => s.toLowerCase()));
    const prefSet = new Set(preferredSkills.map(s => s.toLowerCase()));

    return candidates.map(cand => {
      const breakdown = scoreCandidate(cand, reqSet, prefSet, minJobExp);
      return {
        ...cand,
        scoreBreakdown: breakdown
      };
    });
  }, [candidates, requiredSkills, preferredSkills, minJobExp]);

  // 2. Apply filters to candidates
  const filteredCandidates = useMemo(() => {
    let result = [...allCandidates];

    // Filter by search query (name, headline, id, or current company)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(cand => 
        cand.candidate_id.toLowerCase().includes(q) ||
        cand.profile.anonymized_name.toLowerCase().includes(q) ||
        cand.profile.headline.toLowerCase().includes(q) ||
        cand.profile.current_company.toLowerCase().includes(q)
      );
    }

    // Filter by location query
    if (locationQuery.trim() !== "") {
      const l = locationQuery.toLowerCase();
      result = result.filter(cand => 
        cand.profile.location.toLowerCase().includes(l) ||
        cand.profile.country.toLowerCase().includes(l)
      );
    }

    // Filter by experience
    if (minExperience > 0) {
      result = result.filter(cand => cand.profile.years_of_experience >= minExperience);
    }

    // Filter by open to work
    if (openToWorkOnly) {
      result = result.filter(cand => cand.redrob_signals.open_to_work_flag === true);
    }

    // Filter by willing to relocate
    if (willingToRelocateOnly) {
      result = result.filter(cand => cand.redrob_signals.willing_to_relocate === true);
    }

    // Filter by starred only
    if (starredOnly) {
      result = result.filter(cand => starredIds.includes(cand.candidate_id));
    }

    // Filter by max notice period
    if (maxNoticePeriod > 0) {
      result = result.filter(cand => (cand.redrob_signals?.notice_period_days ?? 60) <= maxNoticePeriod);
    }

    // Filter by max expected salary
    if (maxSalary > 0) {
      result = result.filter(cand => (cand.redrob_signals?.expected_salary_range_inr_lpa?.max ?? 999) <= maxSalary);
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      result = result.filter(cand => {
        const candidateSkillNames = cand.skills.map(s => s.name.toLowerCase());
        return selectedSkills.every(skill => 
          candidateSkillNames.some(cs => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
        );
      });
    }

    // 3. Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "score") {
        comparison = a.scoreBreakdown.final_score - b.scoreBreakdown.final_score;
      } else if (sortBy === "experience") {
        comparison = a.profile.years_of_experience - b.profile.years_of_experience;
      } else if (sortBy === "name") {
        comparison = a.profile.anonymized_name.localeCompare(b.profile.anonymized_name);
      } else if (sortBy === "id") {
        comparison = a.candidate_id.localeCompare(b.candidate_id);
      }

      // Default secondary sort to Candidate ID asc
      if (comparison === 0) {
        comparison = a.candidate_id.localeCompare(b.candidate_id);
        return comparison; // always ascending for candidate ID in ties
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [allCandidates, searchQuery, locationQuery, minExperience, selectedSkills, openToWorkOnly, willingToRelocateOnly, starredOnly, starredIds, maxNoticePeriod, maxSalary, sortBy, sortOrder]);

  const toggleSkillFilter = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearSkillFilters = () => {
    setSelectedSkills([]);
  };

  // CSV Exporter helper
  const exportToCSV = (targetCandidates = filteredCandidates, filename = "redrob_candidate_shortlist.csv") => {
    if (!targetCandidates || targetCandidates.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const headers = [
      "Rank",
      "Candidate ID",
      "Anonymized Name",
      "Current Title",
      "Current Company",
      "Experience Yrs",
      "Location",
      "Final Score (%)",
      "Skill Score",
      "Experience Score",
      "Career Score",
      "Behavioral Score",
      "Penalties",
      "Notice Period (Days)",
      "Expected Salary Max (LPA)",
      "Audit Flags"
    ];

    const rows = targetCandidates.map((cand, idx) => {
      const b = cand.scoreBreakdown;
      const flags = (b.flags || []).join("; ");
      const salaryMax = cand.redrob_signals?.expected_salary_range_inr_lpa?.max || "N/A";
      const noticeDays = cand.redrob_signals?.notice_period_days ?? "N/A";

      return [
        idx + 1,
        `"${cand.candidate_id}"`,
        `"${cand.profile?.anonymized_name || ""}"`,
        `"${(cand.profile?.current_title || "").replace(/"/g, '""')}"`,
        `"${(cand.profile?.current_company || "").replace(/"/g, '""')}"`,
        cand.profile?.years_of_experience || 0,
        `"${cand.profile?.location || ""}"`,
        b.final_score.toFixed(1),
        b.skill_match.toFixed(1),
        b.experience_match.toFixed(1),
        b.career_relevance.toFixed(1),
        b.behavioral_score.toFixed(1),
        b.penalty_total.toFixed(1),
        noticeDays,
        salaryMax,
        `"${flags}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Exporter helper
  const exportToJSON = (targetCandidates = filteredCandidates, filename = "redrob_candidate_shortlist.json") => {
    if (!targetCandidates || targetCandidates.length === 0) {
      alert("No candidates available to export.");
      return;
    }

    const exportData = targetCandidates.map((cand, idx) => ({
      rank: idx + 1,
      candidate_id: cand.candidate_id,
      name: cand.profile?.anonymized_name,
      current_title: cand.profile?.current_title,
      current_company: cand.profile?.current_company,
      experience_years: cand.profile?.years_of_experience,
      location: cand.profile?.location,
      score_breakdown: cand.scoreBreakdown,
      redrob_signals: cand.redrob_signals,
      skills: cand.skills
    }));

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <CandidatesContext.Provider value={{
      allCandidates,
      filteredCandidates,
      candidates,
      setCandidates,
      resetCandidates,
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
      requiredSkills,
      setRequiredSkills,
      preferredSkills,
      setPreferredSkills,
      minJobExp,
      setMinJobExp,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
      availableSkills
    }}>
      {children}
    </CandidatesContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidatesContext);
  if (!context) {
    throw new Error("useCandidates must be used within a CandidatesProvider");
  }
  return context;
}

