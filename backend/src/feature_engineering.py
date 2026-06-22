import re
import logging
from typing import Dict, Any, List, Set, Optional
from src.utils import normalize_text, calculate_months_between

logger = logging.getLogger(__name__)

# Standard technical skill vocabulary for AI/ML and engineering roles
SKILL_VOCABULARY = {
    # Languages
    "python", "c++", "java", "scala", "go", "rust", "sql", "r", "julia",
    # Frameworks & Libraries
    "pytorch", "tensorflow", "keras", "scikit-learn", "numpy", "pandas", "scipy", "jax",
    # GenAI & NLP
    "llm", "embeddings", "retrieval", "ranking", "faiss", "qdrant", "pinecone", "chroma", "weaviate",
    "milvus", "vector", "rag", "langchain", "llamaindex", "huggingface", "transformers", "bert", "gpt",
    "fine-tuning", "prompt engineering", "agentic", "semantic search", "nlp", "natural language processing",
    # Machine Learning Core
    "machine learning", "deep learning", "computer vision", "reinforcement learning", "neural networks",
    "supervised learning", "unsupervised learning", "gradient boosting", "xgboost", "lightgbm",
    # Engineering & Cloud
    "docker", "kubernetes", "aws", "gcp", "azure", "mlflow", "kubeflow", "dvc", "git", "ci/cd",
    "fastapi", "flask", "django", "spark", "hadoop", "databricks", "kafka"
}

# Mapping of alternative representations to standardized names
SKILL_ALIASES = {
    "tensor flow": "tensorflow",
    "tensor-flow": "tensorflow",
    "py torch": "pytorch",
    "py-torch": "pytorch",
    "scikit learn": "scikit-learn",
    "scikitlearn": "scikit-learn",
    "machine-learning": "machine learning",
    "deep-learning": "deep learning",
    "vector search": "vector",
    "vector databases": "vector",
    "vector database": "vector",
    "natural language processing": "nlp",
    "computer-vision": "computer vision",
    "generative ai": "llm",
    "genai": "llm",
    "large language models": "llm",
    "large language model": "llm",
    "fine tuning": "fine-tuning",
    "finetuning": "fine-tuning",
}


class JobDescription:
    """Represents a structured Job Description."""
    
    def __init__(self, title: str, min_years_experience: int, required_skills: Set[str], preferred_skills: Set[str]):
        self.title = title
        self.min_years_experience = min_years_experience
        self.required_skills = required_skills
        self.preferred_skills = preferred_skills

    def __repr__(self) -> str:
        return (f"JobDescription(title='{self.title}', min_exp={self.min_years_experience}, "
                f"req_skills={list(self.required_skills)}, pref_skills={list(self.preferred_skills)})")


class JobDescriptionParser:
    """Parses raw text of Job Descriptions to extract requirements."""
    
    @staticmethod
    def parse(jd_text: str, default_title: str = "Senior AI Engineer") -> JobDescription:
        """
        Extracts key metrics from Job Description text.
        """
        normalized_jd = normalize_text(jd_text)
        
        # 1. Parse Years of Experience
        # Match pattern like "5+ years", "5-7 years", "at least 5 years"
        min_years = 5  # Default for Senior AI Engineer
        exp_matches = re.findall(r"(\d+)\+?\s*(?:to\s*\d+\s*)?(?:years|yrs)\b", normalized_jd)
        if exp_matches:
            try:
                # Take the highest of the first couple matches as the minimum, capped reasonably
                years = [int(y) for y in exp_matches if int(y) < 25]
                if years:
                    min_years = min(years)
            except Exception as e:
                logger.debug(f"Failed parsing experience from matches {exp_matches}: {e}")
                
        # 2. Extract Skills from Vocabulary
        found_skills = set()
        
        # Check standard vocabulary
        for skill in SKILL_VOCABULARY:
            # Word boundary matching to prevent partial matches like 'go' in 'good'
            pattern = r"\b" + re.escape(skill) + r"\b"
            # Special check for skills with symbols like C++ or C#
            if "++" in skill or "#" in skill:
                pattern = re.escape(skill)
            if re.search(pattern, normalized_jd):
                found_skills.add(skill)
                
        # Check aliases
        for alias, std_name in SKILL_ALIASES.items():
            if alias in normalized_jd:
                found_skills.add(std_name)
                
        # Split skills into required and preferred based on context
        required_skills = set()
        preferred_skills = set()
        
        # Simple heuristic: split text by sentences and look for requirement words
        sentences = re.split(r"[.!?\n]", jd_text)
        for sentence in sentences:
            norm_sent = normalize_text(sentence)
            sent_skills = set()
            for skill in found_skills:
                pattern = r"\b" + re.escape(skill) + r"\b"
                if "++" in skill or "#" in skill:
                    pattern = re.escape(skill)
                if re.search(pattern, norm_sent):
                    sent_skills.add(skill)
                    
            if not sent_skills:
                continue
                
            # If sentence contains words like 'nice to have', 'preferred', 'plus', 'bonus'
            if any(w in norm_sent for w in ["nice to", "preferred", "plus", "bonus", "desired", "optional", "strongly preferred"]):
                preferred_skills.update(sent_skills)
            else:
                required_skills.update(sent_skills)
                
        # Handle overlap (if a skill is in both, make it required)
        preferred_skills = preferred_skills - required_skills
        
        # Fallbacks for Senior AI Engineer if no skills were found
        if not required_skills and "senior ai engineer" in normalized_jd:
            required_skills = {"python", "llm", "embeddings", "retrieval", "machine learning"}
            
        return JobDescription(
            title=default_title,
            min_years_experience=min_years,
            required_skills=required_skills,
            preferred_skills=preferred_skills
        )


class CandidateFeatureExtractor:
    """Extracts, standardizes and structures candidate attributes for scoring."""
    
    @staticmethod
    def extract_skills(candidate: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Standardizes candidate skills into a dictionary mapping skill names (normalized)
        to a details dict containing duration_months, proficiency, endorsements, and assessment_score.
        """
        raw_skills = candidate.get("skills", [])
        signals = candidate.get("redrob_signals", {})
        assessment_scores = signals.get("skill_assessment_scores", {})
        
        standardized_skills = {}
        
        # Total experience in years to use for scaling defaults
        total_exp_years = candidate.get("profile", {}).get("years_of_experience", 1.0)
        default_months = int(max(1.0, total_exp_years) * 3)  # Assume a fraction of total exp for unstated skills
        default_months = max(12, min(default_months, 36))    # Bound between 12 and 36 months
        
        for s in raw_skills:
            if isinstance(s, dict):
                name = s.get("name", "")
                months = s.get("duration_months", s.get("experience_months", s.get("experience_years", 0) * 12))
                if not months:
                    months = default_months
                proficiency = str(s.get("proficiency", "intermediate")).lower()
                endorsements = int(s.get("endorsements", 0))
            elif isinstance(s, str):
                name = s
                months = default_months
                proficiency = "intermediate"
                endorsements = 0
            else:
                continue
                
            norm_name = normalize_text(name)
            if not norm_name:
                continue
                
            # Apply alias conversion
            norm_name = SKILL_ALIASES.get(norm_name, norm_name)
            
            # Look up Redrob assessment score if available
            assessment_score = -1.0
            for assess_name, score in assessment_scores.items():
                if normalize_text(assess_name) == norm_name:
                    assessment_score = float(score)
                    break
            
            # Keep the maximum duration if skill listed multiple times
            if norm_name not in standardized_skills or int(months) > standardized_skills[norm_name]["duration_months"]:
                standardized_skills[norm_name] = {
                    "duration_months": int(months),
                    "proficiency": proficiency,
                    "endorsements": endorsements,
                    "assessment_score": assessment_score
                }
            
        return standardized_skills

    @staticmethod
    def extract_experience_history(candidate: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts career history and calculates duration in months for each role.
        """
        raw_history = candidate.get("career_history", candidate.get("experience", []))
        if not isinstance(raw_history, list):
            return []
            
        processed_history = []
        for role in raw_history:
            if not isinstance(role, dict):
                continue
                
            title = normalize_text(role.get("title", ""))
            company = normalize_text(role.get("company", ""))
            
            # Extract duration in months
            start_date = role.get("start_date", "")
            end_date = role.get("end_date", None)
            
            # Read pre-computed duration if available, otherwise calculate it
            duration = role.get("duration_months", None)
            if duration is None:
                if start_date:
                    duration = calculate_months_between(str(start_date), str(end_date) if end_date else None)
                else:
                    # Heuristic: default to 2 years (24 months) if duration is missing
                    duration = 24
            else:
                duration = int(duration)
                
            processed_history.append({
                "title": title,
                "company": company,
                "duration_months": duration,
                "description": normalize_text(role.get("description", "")),
                "is_current": bool(role.get("is_current", False)),
                "company_size": str(role.get("company_size", "11-50"))
            })
            
        return processed_history

    @staticmethod
    def extract_behavioral_signals(candidate: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts and normalizes behavioral metrics from the candidate profile and redrob_signals.
        Fills missing values with neutral defaults.
        """
        profile = candidate.get("profile", {})
        signals = candidate.get("redrob_signals", {})
        
        # Stated notice period and salary expectations
        notice_period = int(signals.get("notice_period_days", 60))
        expected_salary = signals.get("expected_salary_range_inr_lpa", {})
        salary_min = float(expected_salary.get("min", 15.0) if isinstance(expected_salary, dict) else 15.0)
        salary_max = float(expected_salary.get("max", 25.0) if isinstance(expected_salary, dict) else 25.0)
        
        # Work mode & reloc
        preferred_work_mode = str(signals.get("preferred_work_mode", "hybrid")).lower()
        willing_to_relocate = bool(signals.get("willing_to_relocate", False))
        
        # Availability & activity timestamps
        open_to_work = bool(signals.get("open_to_work_flag", False))
        last_active = str(signals.get("last_active_date", ""))
        
        # Behavioral stats
        recruiter_response_rate = float(signals.get("recruiter_response_rate", 0.70))
        github_activity_score = float(signals.get("github_activity_score", -1.0)) # -1 if not linked
        interview_completion_rate = float(signals.get("interview_completion_rate", 0.80))
        saved_by_recruiters_30d = int(signals.get("saved_by_recruiters_30d", 2))
        search_appearance_30d = int(signals.get("search_appearance_30d", 15))
        profile_completeness_score = float(signals.get("profile_completeness_score", 80.0))
        
        # Location and country from profile
        location = normalize_text(profile.get("location", ""))
        country = normalize_text(profile.get("country", ""))
        
        return {
            "notice_period_days": notice_period,
            "salary_min_lpa": salary_min,
            "salary_max_lpa": salary_max,
            "preferred_work_mode": preferred_work_mode,
            "willing_to_relocate": willing_to_relocate,
            "open_to_work_flag": open_to_work,
            "last_active_date": last_active,
            "recruiter_response_rate": recruiter_response_rate,
            "github_activity_score": github_activity_score,
            "interview_completion_rate": interview_completion_rate,
            "saved_by_recruiters_30d": saved_by_recruiters_30d,
            "search_appearance_30d": search_appearance_30d,
            "profile_completeness_score": profile_completeness_score,
            "location": location,
            "country": country
        }
