import json
import logging
from abc import ABC, abstractmethod
from typing import Generator, Dict, Any, Union
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class BaseCandidateLoader(ABC):
    """
    Abstract base class for loading candidate data.
    Ensures conformance to SOLID principles for extension to different data formats.
    """
    
    @abstractmethod
    def load_candidates(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """
        Yields candidates one by one from the specified file.
        
        Args:
            file_path: Path to the data file.
            
        Yields:
            A dictionary containing candidate details.
        """
        pass


class CandidateLoader(BaseCandidateLoader):
    """
    Concrete implementation of candidate loader.
    Handles both JSON arrays and line-delimited JSONL files.
    """
    
    def load_candidates(self, file_path: Union[str, Path]) -> Generator[Dict[str, Any], None, None]:
        """
        Loads candidate profiles from a JSON or JSONL file.
        Automatically detects format based on file extension and streams results.
        
        Args:
            file_path: The file path to the candidates data.
            
        Yields:
            Dict[str, Any]: A candidate profile dictionary.
        """
        path = Path(file_path)
        if not path.exists():
            logger.error(f"Candidate file not found: {file_path}")
            raise FileNotFoundError(f"File not found: {file_path}")
            
        # Determine loader type based on extension
        if path.suffix.lower() == ".jsonl":
            yield from self._load_jsonl(path)
        elif path.suffix.lower() == ".json":
            yield from self._load_json(path)
        else:
            logger.warning(f"Unknown extension '{path.suffix}'. Attempting to load as JSONL stream.")
            yield from self._load_jsonl(path)

    def _load_jsonl(self, file_path: Path) -> Generator[Dict[str, Any], None, None]:
        """Streams candidate data from a JSONL file line-by-line."""
        with open(file_path, "r", encoding="utf-8") as f:
            for line_idx, line in enumerate(f, start=1):
                clean_line = line.strip()
                if not clean_line:
                    continue
                try:
                    candidate = json.loads(clean_line)
                    if self._validate_candidate(candidate, line_idx):
                        yield candidate
                except json.JSONDecodeError as e:
                    logger.warning(f"Skipping malformed JSON line {line_idx} in {file_path}: {e}")
                except Exception as e:
                    logger.error(f"Unexpected error parsing line {line_idx} in {file_path}: {e}")

    def _load_json(self, file_path: Path) -> Generator[Dict[str, Any], None, None]:
        """
        Reads candidate data from a JSON file (standard JSON array).
        For compatibility with standard JSON formats. Note: This loads the array into
        memory, so it is recommended to use JSONL for massive datasets like 100k+.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            if not isinstance(data, list):
                logger.error(f"JSON file {file_path} must contain a top-level list of candidates.")
                return

            for idx, candidate in enumerate(data, start=1):
                if self._validate_candidate(candidate, idx):
                    yield candidate
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON file {file_path}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error loading JSON file {file_path}: {e}")
            raise

    def _validate_candidate(self, candidate: Dict[str, Any], index: int) -> bool:
        """
        Performs basic structure validation on the candidate object.
        
        Args:
            candidate: Parsed candidate dictionary.
            index: Line number or array index for logging purposes.
            
        Returns:
            bool: True if candidate is valid, False otherwise.
        """
        if not isinstance(candidate, dict):
            logger.warning(f"Candidate entry at index {index} is not a JSON object. Skipping.")
            return False
            
        if "candidate_id" not in candidate:
            logger.warning(f"Candidate entry at index {index} is missing 'candidate_id'. Skipping.")
            return False
            
        # Ensure profile dictionary exists
        if "profile" not in candidate or not isinstance(candidate["profile"], dict):
            candidate["profile"] = {}
            
        # Ensure skills list exists
        if "skills" not in candidate or not isinstance(candidate["skills"], list):
            candidate["skills"] = []
            
        return True
