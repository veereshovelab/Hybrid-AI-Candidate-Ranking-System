import heapq
import logging
from typing import Generator, Dict, Any, List, Tuple
from src.scorer import CandidateScorer

logger = logging.getLogger(__name__)

class CandidateRanker:
    """
    Orchestrates candidate scoring and streaming ranking.
    Uses a min-heap to keep only the top K candidates in memory.
    """
    
    def __init__(self, scorer: CandidateScorer, top_k: int = 100):
        self.scorer = scorer
        self.top_k = top_k

    def rank_candidates(self, candidate_stream: Generator[Dict[str, Any], None, None]) -> List[Dict[str, Any]]:
        """
        Processes a stream of candidates and returns the top_k sorted in descending order.
        
        Args:
            candidate_stream: Generator yielding raw candidate dictionaries.
            
        Returns:
            List[Dict[str, Any]]: List of top-K candidates with scores, sub-scores, and flags.
        """
        evaluated_candidates = []
        processed_count = 0
        
        for candidate in candidate_stream:
            processed_count += 1
            
            # Score candidate
            final_score, sub_scores, flags = self.scorer.score_candidate(candidate)
            candidate_id = candidate["candidate_id"]
            
            # Pack evaluation details
            eval_data = {
                "candidate_id": candidate_id,
                "final_score": round(final_score, 2),
                "sub_scores": sub_scores,
                "flags": flags,
                "raw_profile": candidate
            }
            evaluated_candidates.append(eval_data)
            
            # Periodically log progress for huge files
            if processed_count % 10000 == 0:
                logger.info(f"Ranker processed {processed_count} candidates...")

        logger.info(f"Finished evaluation. Scored {processed_count} candidates in total.")
        
        # Sort: score descending, then candidate_id ascending (alphabetically)
        evaluated_candidates.sort(key=lambda x: (-x["final_score"], x["candidate_id"]))
        
        # Return only the top K
        return evaluated_candidates[:self.top_k]
