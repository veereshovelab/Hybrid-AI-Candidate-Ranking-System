import os
import csv
import argparse
import logging
import sys
from pathlib import Path

# Add backend folder to sys.path to allow execution from any CWD
sys.path.append(str(Path(__file__).resolve().parent))

from src.utils import TimerMemoryTracker
from src.data_loader import CandidateLoader
from src.feature_engineering import JobDescriptionParser
from src.scorer import CandidateScorer
from src.ranker import CandidateRanker
from src.reasoning_generator import CandidateReasoningGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

DEFAULT_JD = """
Role: Senior AI Engineer
Target Experience: 5+ years of experience in artificial intelligence and machine learning fields.

Required Core Skills:
- High proficiency in Python and Machine Learning concepts.
- Practical experience with Large Language Models (LLM) and generative AI applications.
- Experience building search pipelines using Vector databases (such as FAISS, Qdrant, Pinecone, or Milvus) and Embeddings.
- Retrieval-Augmented Generation (RAG) implementation and similarity search.

Preferred / Plus Skills:
- Experience with agentic frameworks like LangChain or LlamaIndex.
- Deep Learning frameworks (PyTorch, TensorFlow) and transformers (HuggingFace).
- Containerization and APIs (Docker, FastAPI, Kubernetes).
"""

def main():
    parser = argparse.ArgumentParser(description="Redrob Candidate Discovery & Ranking Pipeline")
    parser.add_argument(
        "--candidates",
        type=str,
        default="data/sample_candidates_small.json",
        help="Path to candidate data file (JSON or JSONL format)"
    )
    parser.add_argument(
        "--jd",
        type=str,
        default=None,
        help="Path to job description text file (optional)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="outputs/submission.csv",
        help="Path to write the output CSV"
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=100,
        help="Number of top candidates to export (default: 100)"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Starting Redrob Candidate Discovery & Ranking Pipeline")
    logger.info("=" * 60)
    
    # 1. Load and parse Job Description
    if args.jd and os.path.exists(args.jd):
        logger.info(f"Loading Job Description from file: {args.jd}")
        with open(args.jd, "r", encoding="utf-8") as f:
            jd_content = f.read()
    else:
        logger.info("Using default Senior AI Engineer Job Description")
        jd_content = DEFAULT_JD
        
    jd = JobDescriptionParser.parse(jd_content)
    logger.info(f"Parsed Job Description: {jd}")
    
    # Ensure outputs directory exists
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Initialize Pipeline Components
    loader = CandidateLoader()
    scorer = CandidateScorer(jd)
    ranker = CandidateRanker(scorer, top_k=args.top_k)
    
    # 2. Execute Ranking with execution logging
    logger.info(f"Streaming and ranking candidates from: {args.candidates}")
    
    with TimerMemoryTracker("Candidate Evaluation & Ranking Pipeline") as tracker:
        try:
            # Stream candidates
            candidate_stream = loader.load_candidates(args.candidates)
            
            # Rank candidates (min-heap capped at top-K)
            top_candidates = ranker.rank_candidates(candidate_stream)
        except Exception as e:
            logger.error(f"Pipeline execution failed: {e}", exc_info=True)
            return
 
    elapsed_time, peak_ram = tracker.get_stats()
    
    # 3. Generate Natural Language Reasoning for top candidates
    logger.info(f"Generating reasoning summaries for the top {len(top_candidates)} candidates...")
    for candidate_eval in top_candidates:
        reasoning = CandidateReasoningGenerator.generate_reasoning(candidate_eval)
        candidate_eval["reasoning"] = reasoning

    # 4. Export to CSV in the required format
    logger.info(f"Exporting submission results to: {output_path}")
    
    csv_headers = [
        "candidate_id",
        "rank",
        "score",
        "reasoning"
    ]
    
    try:
        with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(csv_headers)
            
            for rank_idx, eval_data in enumerate(top_candidates, start=1):
                writer.writerow([
                    eval_data["candidate_id"],
                    rank_idx,
                    eval_data["final_score"],
                    eval_data["reasoning"]
                ])
                
        logger.info(f"Successfully exported {len(top_candidates)} candidates to {output_path}")
        
    except Exception as e:
        logger.error(f"Failed to write output CSV: {e}")
        return

    # 5. Performance Report
    logger.info("=" * 60)
    logger.info("Pipeline Performance Report:")
    logger.info(f"  - Elapsed Time: {elapsed_time:.2f} seconds")
    logger.info(f"  - Peak Memory:  {peak_ram:.2f} MB")
    if elapsed_time > 0:
        logger.info(f"  - Processing Speed: {round(100000 / elapsed_time, 2)} candidates/sec (extrapolated)")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()
