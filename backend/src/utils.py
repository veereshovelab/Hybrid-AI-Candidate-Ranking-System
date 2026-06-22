import os
import re
import time
import logging
import tracemalloc
from datetime import datetime
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# Try to import psutil for accurate RAM measurement, but fall back gracefully
try:
    import psutil
except ImportError:
    psutil = None


def normalize_text(text: Optional[str]) -> str:
    """
    Cleans and normalizes text for exact and fuzzy matching.
    Lowercases, removes special characters (except basic hyphens/spaces), and strips.
    """
    if not text:
        return ""
    # Convert to string and lowercase
    text = str(text).lower()
    # Replace common separators with spaces (except for letters/numbers and hyphens/dots)
    text = re.sub(r"[^a-z0-9\s\-\.\+#]", " ", text)
    # Replace multiple spaces with a single space
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_date(date_str: str) -> datetime:
    """
    Attempts to parse date strings of various common formats.
    Returns datetime object or current date if 'Present' / 'Current'.
    """
    if not date_str or str(date_str).strip().lower() in ["present", "current", "now", "today", "active"]:
        return datetime.now()
        
    date_str = str(date_str).strip()
    
    # Common date formats
    formats = [
        "%Y-%m-%d",  # 2021-06-01
        "%Y-%m",     # 2021-06
        "%B %Y",     # June 2021
        "%b %Y",     # Jun 2021
        "%Y",        # 2021
        "%d/%m/%Y",  # 01/06/2021
        "%m/%Y",     # 06/2021
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
            
    # Try custom regex matching for dates if standard formats fail
    # E.g., matching year only "2021"
    match = re.search(r"\b(19\d{2}|20\d{2})\b", date_str)
    if match:
        try:
            return datetime(year=int(match.group(1)), month=1, day=1)
        except ValueError:
            pass
            
    # Default fallback
    logger.debug(f"Could not parse date string: '{date_str}'. Falling back to current date.")
    return datetime.now()


def calculate_months_between(start_date_str: str, end_date_str: Optional[str]) -> int:
    """
    Calculates the number of months between two date strings.
    """
    try:
        start_dt = parse_date(start_date_str)
        end_dt = parse_date(end_date_str) if end_date_str else datetime.now()
        
        # Calculate difference in months
        diff_months = (end_dt.year - start_dt.year) * 12 + (end_dt.month - start_dt.month)
        return max(0, diff_months)
    except Exception as e:
        logger.debug(f"Error calculating duration between {start_date_str} and {end_date_str}: {e}")
        return 0


class TimerMemoryTracker:
    """
    A context manager to track execution time and peak memory consumption.
    """
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = 0.0
        self.end_time = 0.0
        self.process = None

    def __enter__(self):
        self.start_time = time.perf_counter()
        tracemalloc.start()
        if psutil:
            self.process = psutil.Process(os.getpid())
            self.start_mem = self.process.memory_info().rss
        else:
            self.start_mem = 0
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        elapsed_time = self.end_time - self.start_time
        
        _, peak_tracemalloc = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        if self.process:
            end_mem = self.process.memory_info().rss
            mem_diff = end_mem - self.start_mem
            peak_rss = end_mem
        else:
            mem_diff = peak_tracemalloc
            peak_rss = peak_tracemalloc
            
        peak_mb = peak_rss / (1024 * 1024)
        diff_mb = mem_diff / (1024 * 1024)
        
        logger.info(
            f"[{self.operation_name}] Completed in {elapsed_time:.4f}s | "
            f"Peak RAM: {peak_mb:.2f} MB (Delta: {diff_mb:+.2f} MB)"
        )

    def get_stats(self) -> Tuple[float, float]:
        """Returns (elapsed_seconds, peak_memory_mb)"""
        elapsed = time.perf_counter() - self.start_time
        if self.process:
            peak = self.process.memory_info().rss / (1024 * 1024)
        else:
            _, peak_tracemalloc = tracemalloc.get_traced_memory()
            peak = peak_tracemalloc / (1024 * 1024)
        return elapsed, peak
