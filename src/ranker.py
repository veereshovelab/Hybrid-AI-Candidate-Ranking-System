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
        # Min-heap elements will be tuples: (final_score, candidate_id, candidate_evaluated_dict)
        # We use candidate_id as the tie-breaker to prevent Python from comparing dicts.
        heap: List[Tuple[float, str, Dict[str, Any]]] = []
        
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
            
            # Heap logic
            if len(heap) < self.top_k:
                heapq.heappush(heap, (final_score, candidate_id, eval_data))
            else:
                # Compare with current minimum in the top K
                min_score = heap[0][0]
                if final_score > min_score:
                    # Pop the lowest candidate, push the new higher candidate
                    heapq.heappushpop(heap, (final_score, candidate_id, eval_data))
            
            # Periodically log progress for huge files
            if processed_count % 10000 == 0:
                logger.info(f"Ranker processed {processed_count} candidates...")

        logger.info(f"Finished evaluation. Scored {processed_count} candidates in total.")
        
        # Extract candidates from the heap and sort them descending
        ranked_list = []
        while heap:
            _, _, eval_data = heapq.heappop(heap)
            ranked_list.append(eval_data)
            
        # Since heappop yields in ascending order, we reverse the list
        ranked_list.reverse()
        
        return ranked_list
