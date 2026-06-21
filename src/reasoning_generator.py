import random
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class CandidateReasoningGenerator:
    """
    Generates human-like, professional, structured reasoning summaries
    explaining why a candidate was ranked and scored as they were, 
    without using hosted or local LLMs.
    """
    
    @staticmethod
    def generate_reasoning(eval_data: Dict[str, Any]) -> str:
        """
        Creates a natural language explanation for a scored candidate.
        """
        candidate_id = eval_data["candidate_id"]
        final_score = eval_data["final_score"]
        sub_scores = eval_data["sub_scores"]
        flags = eval_data["flags"]
        raw = eval_data["raw_profile"]
        
        profile = raw.get("profile", {})
        years_exp = profile.get("years_of_experience", 0)
        skills_dict = raw.get("skills", [])
        
        # 1. Structure the Skill text
        skills_matched = []
        for s in skills_dict:
            name = s.get("name") if isinstance(s, dict) else s
            months = s.get("experience_months") if isinstance(s, dict) else None
            if name:
                if months:
                    skills_matched.append(f"{name} ({round(months/12, 1)} yrs)")
                else:
                    skills_matched.append(name)
        
        skills_str = ", ".join(skills_matched[:5])
        if len(skills_matched) > 5:
            skills_str += f", and {len(skills_matched) - 5} other skills"
            
        # 2. Get past experience highlights
        exp_list = raw.get("experience", [])
        job_summary = ""
        if exp_list and isinstance(exp_list, list):
            recent_role = exp_list[0]
            if isinstance(recent_role, dict):
                title = recent_role.get("title", "Software Engineer")
                company = recent_role.get("company", "Tech Company")
                job_summary = f"Currently serving as {title} at {company}."
        
        # 3. Determine suitability tier
        if final_score >= 85:
            tier = "Exceptional"
            suitability = "is a premier fit for the Senior AI Engineer role, showcasing stellar match metrics."
        elif final_score >= 70:
            tier = "Strong"
            suitability = "presents a robust profile with strong technical competencies and suitable experience."
        elif final_score >= 50:
            tier = "Moderate"
            suitability = "is a viable candidate matching several key core competencies, though some gaps exist."
        else:
            tier = "Conditional"
            suitability = "meets basic requirements but displays gaps in experience or critical skills."

        # 4. Behavioral summary
        behavioral = raw.get("behavioral_signals", {})
        resp_rate = behavioral.get("recruiter_response_rate", 0.7)
        github = behavioral.get("github_activity_score", 0.5)
        
        behavioral_insights = []
        if resp_rate >= 0.85:
            behavioral_insights.append("highly responsive to recruitment outreach")
        if github >= 0.70:
            behavioral_insights.append("shows active open-source contribution and coding engagement")
        if behavioral.get("open_to_work_flag"):
            behavioral_insights.append("is actively open to new opportunities")
            
        behavioral_str = ""
        if behavioral_insights:
            behavioral_str = "Candidate is " + ", ".join(behavioral_insights) + "."
            
        # 5. Compile flags/warnings in a professional tone
        flag_notes = []
        for f in flags:
            if "SUSPICIOUS_TECH_DURATION" in f:
                flag_notes.append("Unrealistic duration claims in recent AI technologies require technical verification.")
            elif "EXPERIENCE_OVERLAP" in f:
                flag_notes.append("Chronological overlap detected in career timeline; check for double employment.")
            elif "LOW_ACTIVITY_SENIOR" in f:
                flag_notes.append("Low public activity relative to senior status claimed.")
            elif "KEYWORD_STUFFING" in f:
                flag_notes.append("Profile contains keyword-stuffing indicators in the skill list.")
            elif "CANDIDATE_UNAVAILABLE" in f:
                flag_notes.append("Explicitly marked as unavailable or not looking for roles.")
                
        warnings_str = ""
        if flag_notes:
            warnings_str = " Screening Note: " + " ".join(flag_notes)
            
        # Select variations to sound more natural
        variations = [
            f"[{tier} Fit] Candidate {candidate_id} {suitability} With {years_exp} years of industry experience, "
            f"their technical toolbox includes {skills_str}. {job_summary} {behavioral_str}{warnings_str}",
            
            f"[{tier} Match - Score {final_score}/100] Candidate {candidate_id} {suitability} Key strengths lie in "
            f"experience with {skills_str}. {job_summary} {behavioral_str}{warnings_str}",
            
            f"Candidate {candidate_id} is evaluated as a {tier.lower()} candidate scoring {final_score}/100. "
            f"Bringing {years_exp} years of background and proficiency in {skills_str}. {job_summary} "
            f"{behavioral_str}{warnings_str}"
        ]
        
        # Select deterministically using candidate_id to keep output stable per candidate
        idx = sum(ord(c) for c in candidate_id) % len(variations)
        return variations[idx]
