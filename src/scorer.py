import logging
from typing import Dict, Any, List, Set, Tuple
from datetime import datetime
from src.feature_engineering import JobDescription, CandidateFeatureExtractor
from src.utils import parse_date

logger = logging.getLogger(__name__)

# List of consulting/service companies to exclude/penalize if candidate has only worked there
CONSULTING_COMPANIES = {
    "tcs", "tata consultancy services", "infosys", "wipro", "accenture", 
    "cognizant", "capgemini", "mindtree", "hcl", "tech mahindra", "l&t", "cts"
}

# CV/Speech/Robotics skills that are not relevant without NLP/IR exposure
CV_SPEECH_SKILLS = {
    "computer vision", "image classification", "gans", "speech recognition", 
    "tts", "robotics", "ros", "object detection", "image segmentation", "yolo"
}

class CandidateScorer:
    """
    Evaluates and scores candidates based on skills, experience, career history,
    and behavioral signals. Detects honeypots and suspicious profiles.
    """
    
    def __init__(self, job_description: JobDescription):
        self.jd = job_description
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

    def _compute_skill_score(self, candidate_skills: Dict[str, Dict[str, Any]]) -> float:
        """
        Computes Skill Match Score (0-100).
        Required skills carry 85% of weight, preferred skills carry 15%.
        """
        if not self.required_skills:
            return 100.0
            
        def get_match_score(target_set: Set[str]) -> float:
            if not target_set:
                return 1.0
            score_sum = 0.0
            for skill in target_set:
                if skill in candidate_skills:
                    details = candidate_skills[skill]
                    months = details["duration_months"]
                    proficiency = details["proficiency"]
                    endorsements = details["endorsements"]
                    assess_score = details["assessment_score"]
                    
                    # 1. Duration factor: full credit at 24 months, scaled down for less
                    duration_factor = min(1.0, months / 24.0)
                    
                    # 2. Proficiency modifier
                    prof_modifier = 0.0
                    if proficiency == "expert":
                        prof_modifier = 0.2
                    elif proficiency == "advanced":
                        prof_modifier = 0.1
                    elif proficiency == "beginner":
                        prof_modifier = -0.2
                        
                    factor = max(0.2, duration_factor + prof_modifier)
                    
                    # 3. Assessment score integration
                    if assess_score >= 0.0:
                        factor = (factor * 0.7) + ((assess_score / 100.0) * 0.3)
                        
                    # 4. Endorsement bonus
                    endorse_bonus = min(1.0, endorsements / 20.0) * 0.1
                    
                    score_sum += min(1.0, factor + endorse_bonus)
                    
            return score_sum / len(target_set)

        req_match = get_match_score(self.required_skills)
        pref_match = get_match_score(self.preferred_skills) if self.preferred_skills else 1.0
        
        skill_score = (req_match * 85.0) + (pref_match * 15.0)
        
        # CV/Speech Penalty Check:
        # If candidate has CV/Speech/Robotics expertise but lacks NLP/Search skills, heavily penalize
        has_cv_speech = any(s in CV_SPEECH_SKILLS for s in candidate_skills)
        has_nlp_search = any(s in {"nlp", "llm", "retrieval", "embeddings", "vector", "ranking", "rag"} for s in candidate_skills)
        
        if has_cv_speech and not has_nlp_search:
            skill_score = max(20.0, skill_score - 40.0)
            
        return skill_score

    def _compute_experience_score(self, years_of_exp: float) -> float:
        """
        Computes Experience Match Score (0-100).
        Target is 5-9 years. Peak score for 6-8 years.
        """
        # Ideal range is 6 to 8 years
        if 6.0 <= years_of_exp <= 8.0:
            return 100.0
        elif 5.0 <= years_of_exp < 6.0 or 8.0 < years_of_exp <= 9.0:
            return 95.0
        elif years_of_exp < 5.0:
            # Penalty for underqualification
            shortfall = 5.0 - years_of_exp
            score = 100.0 - (shortfall * 15.0)
            return max(0.0, score)
        else:
            # Penalty for overqualification / title-chasing
            excess = years_of_exp - 9.0
            score = 95.0 - (excess * 6.0)
            return max(40.0, score)

    def _compute_career_relevance(self, experience_history: List[Dict[str, Any]]) -> float:
        """
        Computes Career Relevance Score (0-100) based on title match, company prestige,
        recency, and service-company penalties.
        """
        if not experience_history:
            return 30.0
            
        high_relevance_keywords = {"ai", "machine learning", "ml", "nlp", "search", "retrieval", "ranking", "recommendation"}
        med_relevance_keywords = {"data scientist", "research scientist", "algorithm", "scientist"}
        low_relevance_keywords = {"software", "developer", "engineer", "backend", "fullstack"}
        
        total_score_weight = 0.0
        weighted_duration_sum = 0.0
        
        service_companies_count = 0
        company_count = len(experience_history)
        
        # Check title chaser: average duration at companies
        durations = [role["duration_months"] for role in experience_history]
        avg_duration = sum(durations) / len(durations) if durations else 24
        is_title_chaser = len(durations) >= 3 and avg_duration <= 18
        
        # Check pure research: if current role is research scientist
        current_title = experience_history[0].get("title", "")
        is_pure_research = "research scientist" in current_title or "researcher" in current_title
        
        for idx, role in enumerate(experience_history):
            title = role.get("title", "")
            company = role.get("company", "")
            duration = float(role.get("duration_months", 24))
            
            # Count consulting/service firms
            if any(sc in company for sc in CONSULTING_COMPANIES):
                service_companies_count += 1
                
            # Recency multiplier: first role (index 0 is newest) gets highest multiplier
            recency_factor = 2.0 if idx == 0 else (1.5 if idx == 1 else 1.0)
            
            # Compute role relevance weight
            role_relevance = 0.0
            if any(kw in title for kw in high_relevance_keywords):
                role_relevance = 1.0
            elif any(kw in title for kw in med_relevance_keywords):
                role_relevance = 0.6
            elif any(kw in title for kw in low_relevance_keywords):
                role_relevance = 0.4
                
            # Title seniority boost
            if any(s in title for s in ["senior", "sr", "lead", "principal", "staff"]):
                role_relevance = min(1.0, role_relevance + 0.15)
                
            weighted_duration = duration * recency_factor
            weighted_duration_sum += weighted_duration
            total_score_weight += (role_relevance * weighted_duration)
            
        # Normalize history score
        history_score = (total_score_weight / weighted_duration_sum * 100.0) if weighted_duration_sum > 0 else 50.0
        
        # Apply penalties / bonuses
        penalties = 0.0
        
        # Service Firm Exclusion
        if service_companies_count == company_count:
            # Disqualification (all roles at consulting firms)
            penalties += 50.0
        elif any(sc in experience_history[0].get("company", "") for sc in CONSULTING_COMPANIES):
            # Current role is at a consulting firm, but has product history
            penalties += 15.0
            
        if is_title_chaser:
            penalties += 25.0
            
        if is_pure_research:
            penalties += 15.0
            
        # Direct Match Bonus for current/last title
        current_bonus = 0.0
        if any(kw in current_title for kw in high_relevance_keywords):
            current_bonus = 15.0
            if "senior" in current_title or "sr" in current_title:
                current_bonus += 5.0
                
        return max(0.0, min(100.0, history_score + current_bonus - penalties))

    def _compute_behavioral_score(self, behavioral: Dict[str, Any]) -> float:
        """
        Computes Behavioral Signals Score (0-100) using the specified metrics.
        """
        resp_rate = behavioral.get("recruiter_response_rate", 0.70)
        github_score = behavioral.get("github_activity_score", -1.0)
        completion_rate = behavioral.get("interview_completion_rate", 0.80)
        saves_30d = behavioral.get("saved_by_recruiters_30d", 2)
        searches_30d = behavioral.get("search_appearance_30d", 15)
        open_to_work = behavioral.get("open_to_work_flag", False)
        willing_relocate = behavioral.get("willing_to_relocate", False)
        notice_period = behavioral.get("notice_period_days", 60)
        last_active = behavioral.get("last_active_date", "")
        location = behavioral.get("location", "")
        country = behavioral.get("country", "")
        
        # 1. Normalization
        saves_normalized = min(10.0, float(saves_30d)) / 10.0
        searches_normalized = min(150.0, float(searches_30d)) / 150.0
        
        github_factor = 0.5
        if github_score >= 0.0:
            github_factor = github_score / 100.0
            
        # 2. Linear combination base score (80 points scale)
        base = (
            (resp_rate * 25.0) +
            (github_factor * 15.0) +
            (completion_rate * 25.0) +
            (saves_normalized * 10.0) +
            (searches_normalized * 10.0)
        )
        
        # 3. Bonuses & Penalties (20 points range)
        modifier = 0.0
        if open_to_work:
            modifier += 10.0
            
        # Notice period
        if notice_period <= 30:
            modifier += 15.0
        elif notice_period <= 60:
            modifier += 5.0
        elif notice_period > 90:
            modifier -= 20.0
            
        # Last active check (Days since active from evaluation baseline: 2026-06-21)
        if last_active:
            try:
                active_dt = parse_date(last_active)
                days_inactive = (datetime(2026, 6, 21) - active_dt).days
                if days_inactive > 90:
                    modifier -= 20.0
            except Exception:
                pass
                
        # Location Fit (Indian cities Pune, Noida, Hyderabad, Delhi NCR, Mumbai)
        is_india = "india" in country or "india" in location
        if any(city in location for city in ["noida", "pune"]):
            modifier += 15.0
        elif any(city in location for city in ["hyderabad", "mumbai", "delhi", "ncr"]):
            modifier += 8.0
        elif is_india:
            modifier += 3.0
        elif country and "india" not in country:
            modifier -= 10.0
            
        return max(0.0, min(100.0, base + modifier))

    def _detect_penalties(
        self,
        candidate: Dict[str, Any],
        skills: Dict[str, Dict[str, Any]],
        experience: List[Dict[str, Any]],
        behavioral: Dict[str, Any],
        years_of_exp: float
    ) -> Tuple[float, List[str]]:
        """
        Detects red flags, honeypots, and suspicious patterns.
        Returns total penalty points (100 per trigger) and list of flags.
        """
        penalty_total = 0.0
        flags = []
        
        # 1. Skill duration exceeds total experience (Honeypot)
        for skill_name, details in skills.items():
            duration_years = details["duration_months"] / 12.0
            if details["duration_months"] > 0 and duration_years > (years_of_exp + 0.5):
                penalty_total += 100.0
                flags.append(f"HONEYPOT_SKILL_EXP_DISCREPANCY_{skill_name.upper()}")
                
        # 2. Expert skills with 0 years used (Honeypot)
        for skill_name, details in skills.items():
            if details["proficiency"] == "expert" and details["duration_months"] == 0:
                penalty_total += 100.0
                flags.append(f"HONEYPOT_EXPERT_0_MONTHS_{skill_name.upper()}")

        # 3. Future tech duration anomaly (Honeypot)
        recent_techs = ["langchain", "llamaindex", "chatgpt", "gpt-4", "qdrant"]
        for skill_name, details in skills.items():
            if any(tech in skill_name for tech in recent_techs):
                if details["duration_months"] > 42:
                    penalty_total += 100.0
                    flags.append(f"HONEYPOT_FUTURE_TECH_DURATION_{skill_name.upper()}")

        # 4. Overlapping Job Timelines (Honeypot)
        overlap_detected = False
        if len(experience) > 1:
            raw_history = candidate.get("career_history", candidate.get("experience", []))
            parsed_intervals = []
            for r in raw_history:
                if isinstance(r, dict) and r.get("start_date"):
                    try:
                        start_dt = parse_date(str(r["start_date"]))
                        end_dt = parse_date(str(r["end_date"])) if r.get("end_date") else datetime(2026, 6, 21)
                        parsed_intervals.append((start_dt, end_dt))
                    except Exception:
                        pass
            
            parsed_intervals.sort(key=lambda x: x[0])
            overlap_months = 0.0
            for i in range(len(parsed_intervals) - 1):
                curr_end = parsed_intervals[i][1]
                next_start = parsed_intervals[i+1][0]
                if curr_end > next_start:
                    overlap_end = min(curr_end, parsed_intervals[i+1][1])
                    diff_days = (overlap_end - next_start).days
                    diff_months = diff_days / 30.4
                    if diff_months > 0:
                        overlap_months += diff_months
            
            if overlap_months > 4.0:
                penalty_total += 100.0
                flags.append("HONEYPOT_CHRONOLOGICAL_OVERLAP")

        # 5. Startup Job Duration Discrepancy (Honeypot)
        for role in experience:
            duration_years = role["duration_months"] / 12.0
            if duration_years > (years_of_exp + 0.5):
                penalty_total += 100.0
                flags.append("HONEYPOT_ROLE_DURATION_EXCEEDS_EXP")
                
        return penalty_total, flags
