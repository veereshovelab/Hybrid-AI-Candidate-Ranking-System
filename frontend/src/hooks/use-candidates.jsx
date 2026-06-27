"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import { SAMPLE_CANDIDATES } from "../lib/sample-data";
import { scoreCandidate } from "../utils/scorer";

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
  }, [allCandidates, searchQuery, locationQuery, minExperience, selectedSkills, openToWorkOnly, willingToRelocateOnly, sortBy, sortOrder]);

  const toggleSkillFilter = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearSkillFilters = () => {
    setSelectedSkills([]);
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
