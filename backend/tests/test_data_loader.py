import json
import tempfile
import unittest
from pathlib import Path

from src.data_loader import CandidateLoader


class CandidateLoaderTests(unittest.TestCase):
    def test_rejects_existing_directory_as_candidate_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(FileNotFoundError, "Candidate file not found"):
                list(CandidateLoader().load_candidates(Path(temp_dir)))

    def test_loads_valid_json_candidates(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            candidate_file = Path(temp_dir) / "candidates.json"
            candidate_file.write_text(
                json.dumps([{"candidate_id": "candidate-1"}]),
                encoding="utf-8",
            )

            candidates = list(CandidateLoader().load_candidates(candidate_file))

        self.assertEqual(candidates[0]["candidate_id"], "candidate-1")
        self.assertEqual(candidates[0]["profile"], {})


if __name__ == "__main__":
    unittest.main()