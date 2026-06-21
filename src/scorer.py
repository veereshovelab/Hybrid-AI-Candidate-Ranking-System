import logging
from typing import Dict, Any, List, Set, Tuple
from src.feature_engineering import JobDescription, CandidateFeatureExtractor
from src.utils import parse_date

logger = logging.getLogger(__name__)

class CandidateScorer:
    """
    Evaluates and scores candidates based on skills, experience, career history,
    and behavioral signals. Detects honeypots and suspicious profiles.
    """
    
    def __init__(self, job_description: JobDescription):
        self.jd = job_description
        
        # Standardize JD skills for fast lookup
        self.required_skills = {s.lower() for s in self.jd.required_skills}
        self.preferred_skills = {s.lower() for s in self.jd.preferred_skills}

    def score_candidate(self, candidate: Dict[str, Any]) -> Tuple[float, Dict[str, float], List[str]]:
        """
        Calculates the complete weighted score, sub-scores, and list of penalty/audit flags.
        
        Returns:
            Tuple[float, Dict[str, float], List[str]]: 
                - final_score: float (0 to 100)
                - sub_scores: dict containing breakdown
                - flags: list of warnings/alerts (e.g. "HONEYPOT_TECH_DURATION")
        """
        # 1. Extract standardized candidate features
        skills = CandidateFeatureExtractor.extract_skills(candidate)
        experience = CandidateFeatureExtractor.extract_experience_history(candidate)
        behavioral = CandidateFeatureExtractor.extract_behavioral_signals(candidate)
        
        profile = candidate.get("profile", {})
        years_of_exp = float(profile.get("years_of_experience", 0))
        
        # 2. Compute individual components
        skill_score = self._compute_skill_score(skills)
        exp_score = self._compute_experience_score(years_of_exp)
        career_score = self._compute_career_relevance(experience)
        behavioral_score = self._compute_behavioral_score(behavioral)
        
        # 3. Detect suspicious profiles & calculate penalties
        penalties, audit_flags = self._detect_penalties(candidate, skills, experience, behavioral, years_of_exp)
        
        # 4. Calculate final weighted score
        # Weights: Skill (40%), Experience (20%), Career (20%), Behavioral (20%)
        weighted_score = (
            (skill_score * 0.40) +
            (exp_score * 0.20) +
            (career_score * 0.20) +
            (behavioral_score * 0.20)
        )
        
        final_score = max(0.0, min(100.0, weighted_score - penalties))
        
        sub_scores = {
            "skill_match": skill_score,
            "experience_match": exp_score,
            "career_relevance": career_score,
            "behavioral_score": behavioral_score,
            "penalty_total": penalties
        }
        
        return final_score, sub_scores, audit_flags

    def _compute_skill_score(self, candidate_skills: Dict[str, int]) -> float:
        """
        Computes Skill Match Score (0-100).
        Required skills carry 85% of weight, preferred skills carry 15%.
        Applies skill experience (duration in months) weighting.
        """
        if not self.required_skills:
            return 100.0
            
        # Helper to compute weighted match for a set of target skills
        def get_match_score(target_set: Set[str]) -> float:
            if not target_set:
                return 1.0
            score_sum = 0.0
            for skill in target_set:
                if skill in candidate_skills:
                    months = candidate_skills[skill]
                    # Full credit for 24 months or more, scaled down for less
                    experience_factor = min(1.0, months / 24.0)
                    score_sum += experience_factor
            return score_sum / len(target_set)

        req_match = get_match_score(self.required_skills)
        pref_match = get_match_score(self.preferred_skills) if self.preferred_skills else 1.0
        
        # Calculate weighted skill match
        skill_score = (req_match * 85.0) + (pref_match * 15.0)
        return skill_score

    def _compute_experience_score(self, years_of_exp: float) -> float:
        """
        Computes Experience Match Score (0-100).
        """
        min_years = self.jd.min_years_experience
        
        if years_of_exp >= min_years:
            # Ideal band is within min_years to min_years + 8 years
            if years_of_exp <= min_years + 8:
                return 100.0
            else:
                # Slight decay for overqualification to favor candidates in target experience range
                excess = years_of_exp - (min_years + 8)
                decayed_score = 100.0 - (excess * 2.0)
                return max(80.0, decayed_score)
        else:
            # Penalty for underqualification
            shortfall = min_years - years_of_exp
            score = 100.0 - (shortfall * 15.0)
            return max(0.0, score)

    def _compute_career_relevance(self, experience_history: List[Dict[str, Any]]) -> float:
        """
        Computes Career Relevance Score (0-100) based on title match and recency.
        """
        if not experience_history:
            return 30.0  # Base score for empty history to avoid total failure
            
        high_relevance_keywords = {"ai", "machine learning", "ml", "nlp", "computer vision", "deep learning", "llm"}
        med_relevance_keywords = {"data scientist", "research scientist", "algorithm", "scientist", "analyst"}
        low_relevance_keywords = {"software", "developer", "engineer", "backend", "fullstack", "data engineer"}
        
        total_score_weight = 0.0
        weighted_duration_sum = 0.0
        
        # Process roles and apply recency weighting (roles in the last 4 years get double weight)
        for idx, role in enumerate(experience_history):
            title = role.get("title", "")
            duration = float(role.get("duration_months", 24))
            
            # Recency multiplier: first role (index 0 is newest) gets highest multiplier
            recency_factor = 2.0 if idx == 0 else (1.5 if idx == 1 else 1.0)
            
            # Compute role relevance weight
            role_relevance = 0.1
            if any(kw in title for kw in high_relevance_keywords):
                role_relevance = 1.0
            elif any(kw in title for kw in med_relevance_keywords):
                role_relevance = 0.6
            elif any(kw in title for kw in low_relevance_keywords):
                role_relevance = 0.4
                
            # If the candidate was a Senior or Lead, give a small boost to relevance
            if any(s in title for s in ["senior", "sr", "lead", "principal", "staff"]):
                role_relevance = min(1.0, role_relevance + 0.15)
                
            weighted_duration = duration * recency_factor
            weighted_duration_sum += weighted_duration
            total_score_weight += (role_relevance * weighted_duration)
            
        # Normalize over history
        history_score = (total_score_weight / weighted_duration_sum * 100.0) if weighted_duration_sum > 0 else 50.0
        
        # Direct Match Bonus for current/last title
        current_title = experience_history[0].get("title", "") if experience_history else ""
        current_bonus = 0.0
        if any(kw in current_title for kw in high_relevance_keywords):
            current_bonus = 15.0
            if "senior" in current_title or "sr" in current_title:
                current_bonus += 5.0
                
        return min(100.0, history_score + current_bonus)

    def _compute_behavioral_score(self, behavioral: Dict[str, Any]) -> float:
        """
        Computes Behavioral Signals Score (0-100) using the specified metrics.
        """
        # Extract features
        resp_rate = behavioral.get("recruiter_response_rate", 0.70)
        github_score = behavioral.get("github_activity_score", 0.50)
        completion_rate = behavioral.get("interview_completion_rate", 0.80)
        saves_30d = behavioral.get("saved_by_recruiters_30d", 2)
        searches_30d = behavioral.get("search_appearance_30d", 15)
        open_to_work = behavioral.get("open_to_work_flag", False)
        willing_relocate = behavioral.get("willing_to_relocate", False)
        
        # Normalization
        saves_normalized = min(10.0, float(saves_30d)) / 10.0
        searches_normalized = min(100.0, float(searches_30d)) / 100.0
        
        # Weighted linear combination:
        # Response Rate: 20%
        # Github Activity: 20%
        # Completion Rate: 20%
        # Saves 30d: 15%
        # Searches 30d: 15%
        # Open to Work: 5% (bonus)
        # Relocation: 5% (bonus)
        
        score = (
            (resp_rate * 20.0) +
            (github_score * 20.0) +
            (completion_rate * 20.0) +
            (saves_normalized * 15.0) +
            (searches_normalized * 15.0) +
            (5.0 if open_to_work else 0.0) +
            (5.0 if willing_relocate else 0.0)
        )
        return min(100.0, score)

    def _detect_penalties(
        self,
        candidate: Dict[str, Any],
        skills: Dict[str, int],
        experience: List[Dict[str, Any]],
        behavioral: Dict[str, Any],
        years_of_exp: float
    ) -> Tuple[float, List[str]]:
        """
        Detects red flags, honeypots, and suspicious patterns.
        Returns total penalty points and list of triggered flags.
        """
        penalty_total = 0.0
        flags = []
        
        # 1. Unrealistic skill duration check (Honeypot detection)
        # Year of evaluation is 2026.
        # LangChain, LlamaIndex, ChatGPT/GPT-4 were released late 2022. Experience should not exceed 48 months (4 years).
        honeypot_cutoff_months = 48
        recent_techs = ["langchain", "llamaindex", "chatgpt", "gpt-4", "qdrant", "vector database"]
        for tech in recent_techs:
            if skills.get(tech, 0) > honeypot_cutoff_months:
                penalty_total += 40.0
                flags.append(f"SUSPICIOUS_TECH_DURATION_{tech.upper()}")
                
        # Transformers was released mid-2017 (Attention Is All You Need). Experience should not exceed 9 years (108 months).
        if skills.get("transformers", 0) > 108:
            penalty_total += 40.0
            flags.append("SUSPICIOUS_TECH_DURATION_TRANSFORMERS")
            
        # 2. Chronological overlap check in experience
        # Let's count overlapping months of full-time roles
        # If roles overlap significantly (e.g. > 6 months), flag it
        overlap_detected = False
        if len(experience) > 1:
            # We can run a quick check of job entries
            # If dates are missing, we skip.
            raw_exp = candidate.get("experience", [])
            parsed_intervals = []
            for r in raw_exp:
                if isinstance(r, dict) and r.get("start_date"):
                    try:
                        start_dt = parse_date(str(r["start_date"]))
                        end_dt = parse_date(str(r["end_date"])) if r.get("end_date") else parse_date("present")
                        parsed_intervals.append((start_dt, end_dt))
                    except Exception:
                        pass
            
            # Check overlap count
            parsed_intervals.sort(key=lambda x: x[0])
            overlap_months = 0
            for i in range(len(parsed_intervals) - 1):
                curr_end = parsed_intervals[i][1]
                next_start = parsed_intervals[i+1][0]
                if curr_end > next_start:
                    # Overlap found!
                    overlap_end = min(curr_end, parsed_intervals[i+1][1])
                    diff = (overlap_end.year - next_start.year) * 12 + (overlap_end.month - next_start.month)
                    if diff > 0:
                        overlap_months += diff
            
            if overlap_months > 6:
                penalty_total += 30.0
                flags.append("EXPERIENCE_OVERLAP_DETECTED")

        # 3. Low activity despite senior claims
        # Candidate claims to be senior (> 8 years experience) but has very low behavioral metrics
        if years_of_exp >= 8.0:
            github = behavioral.get("github_activity_score", 0.5)
            saves = behavioral.get("saved_by_recruiters_30d", 2)
            searches = behavioral.get("search_appearance_30d", 15)
            response = behavioral.get("recruiter_response_rate", 0.7)
            
            if github < 0.15 and saves <= 0 and searches < 5 and response < 0.3:
                penalty_total += 25.0
                flags.append("LOW_ACTIVITY_SENIOR_ANOMALY")

        # 4. Keyword stuffing
        # Listing too many skills (> 40 skills) is often a sign of suspicious profile scraping/stuffing
        if len(skills) > 40:
            penalty_total += 20.0
            flags.append("KEYWORD_STUFFING_DETECTION")

        # 5. Candidate Availability
        # Check if availability status indicates not interested or locked
        profile_availability = str(candidate.get("profile", {}).get("availability", "")).lower()
        behavioral_availability = str(behavioral.get("availability", "")).lower()
        if "not looking" in profile_availability or "not open" in profile_availability or "unavailable" in profile_availability:
            penalty_total += 30.0
            flags.append("CANDIDATE_UNAVAILABLE")

        return penalty_total, flags
