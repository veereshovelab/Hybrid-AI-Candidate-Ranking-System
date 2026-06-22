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
        years_exp = float(profile.get("years_of_experience", 0))
        
        # 1. Gather skills list
        raw_skills = raw.get("skills", [])
        skills_matched = []
        for s in raw_skills:
            if isinstance(s, dict) and s.get("name"):
                skills_matched.append(s["name"])
            elif isinstance(s, str):
                skills_matched.append(s)
                
        # Limit to 3 key technical skills for conciseness
        target_skills = [s for s in skills_matched if s.lower() in {
            "python", "pytorch", "tensorflow", "llm", "embeddings", "retrieval", 
            "ranking", "faiss", "qdrant", "pinecone", "milvus", "weaviate", "rag", 
            "langchain", "llamaindex", "transformers", "nlp"
        }]
        if not target_skills:
            target_skills = skills_matched
        skills_str = ", ".join(target_skills[:3])
        
        # 2. Get past experience highlights
        history = raw.get("career_history", raw.get("experience", []))
        recent_company = "product companies"
        recent_title = "AI Specialist"
        if history and isinstance(history, list) and isinstance(history[0], dict):
            recent_company = history[0].get("company", "product companies")
            recent_title = history[0].get("title", "AI Specialist")
            
        # 3. Signals like notice period and location
        signals = raw.get("redrob_signals", {})
        notice_period = signals.get("notice_period_days", 60)
        location = profile.get("location", "India")
        
        # 4. Heuristics for the three tiers
        if final_score >= 80:
            # High Fit
            sentences = [
                f"Senior AI Engineer with {years_exp} years experience building applied ML/NLP systems at companies like {recent_company}; strong alignment with RAG and search database skills ({skills_str}).",
                f"{years_exp} years of applied ML experience with hands-on search and retrieval systems; matches the 'product-focused' profile in the JD with strong {skills_str} competence.",
                f"Exceptional fit with {years_exp} years experience; previously shipped {skills_str} at scale; strong behavioral signals and Pune/Noida location alignment."
            ]
        elif final_score >= 50:
            # Medium Fit - highlight strengths but note concerns (notice period, consulting background)
            is_service = any(c in recent_company.lower() for c in ["tcs", "infosys", "wipro", "accenture", "cognizant", "capgemini"])
            concern = ""
            if is_service:
                concern = "concern over service-firm background"
            elif notice_period > 90:
                concern = f"concern on long notice period ({notice_period} days)"
            else:
                concern = "minor skills gap or overqualification"
                
            sentences = [
                f"Applied ML profile with {years_exp} years experience in {skills_str}. Shows core engineering capabilities, though {concern} limits overall suitability.",
                f"Strong technical baseline in {skills_str} but {concern} prevents high-tier ranking for this founding role.",
                f"Viable candidate with {years_exp} years of background; possesses relevant skills like {skills_str} but has {concern}."
            ]
        else:
            # Low Fit
            if flags:
                flag_text = ", ".join([f.replace("HONEYPOT_", "").lower() for f in flags[:2]])
                sentences = [
                    f"Profile flagged for suspicious data patterns ({flag_text}); classified as a honeypot and excluded from ranking consideration.",
                    f"Flagged for data integrity anomalies ({flag_text}); likely a honeypot profile."
                ]
            else:
                sentences = [
                    f"Adjacent skills only ({skills_str}) — likely below requirements but included as a filler rank.",
                    f"Insufficient alignment with core NLP/retrieval requirements; years of experience ({years_exp}) or background mismatch."
                ]
                
        # Deterministically choose sentence based on candidate ID to keep it consistent
        idx = sum(ord(c) for c in candidate_id) % len(sentences)
        return sentences[idx]
