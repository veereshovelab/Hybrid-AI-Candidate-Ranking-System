# Hybrid AI Candidate Ranking System
 
A premium end-to-end candidate ranking and discovery system. It features a Python backend data processing pipeline for evaluating candidate qualifications against job descriptions and a Next.js frontend application for visualizing, filtering, and managing ranked candidates.

---

## 🌟 Key Platform Capabilities

- **Executive KPI Dashboard (`/dashboard`)**: Macro metrics, match score distribution histograms, top candidate shortlists, and custom dataset (`.json`/`.jsonl`) ingestion.
- **Interactive Talent Discovery Table (`/rankings`)**: Multi-dimensional filtering by required skills, experience thresholds, candidate availability, relocation flags, multi-candidate selection, and sorting controls.
- **Candidate Comparison Matrix (`/compare`)**: Side-by-side head-to-head evaluation of up to 3 candidates across 4-pillar scores, skill depth, notice period velocity, compensation ROI, and integrity flags with one-click comparative brief export.
- **Candidate Detail Dossier (`/candidates/[id]`)**: Deep-dive candidate dossiers with AI reasoning summaries, career history timelines, skill proficiency matrices, and behavioral engagement signals.
- **Explainability & Audit Engine (`/explainability`)**: Mathematical formula score composition breakdown and automated anti-cheat / honeypot detection logs.
- **Macro Talent Analytics (`/analytics`)**: Screening drop-off funnel visualizations, tenure histograms, and behavioral metric averages.
- **HR Profile & Recruiter Command Center (`/profile`)**: Recruiter identity credentials, active job requisitions oversight, candidate interview pipeline stage tracking, customizable scoring weights, and one-click CSV shortlist export.

---

## Directory Structure

The repository is organized as follows:

```
├── backend/                  # Python candidate scoring and ranking pipeline
│   ├── data/                 # Datasets (schema, samples, large raw JSON/JSONL datasets)
│   │   ├── candidate_schema.json # JSON Schema for candidate objects
│   │   ├── sample_candidates.json # Sample candidate dataset (300 KB)
│   │   └── sample_candidates_small.json # Tiny sample candidate dataset (5 candidates)
│   ├── docs/                 # Specifications and reference documentation
│   │   ├── job_description.docx  # Sample job description document
│   │   ├── redrob_signals_doc.docx # Redrob platform signals description
│   │   └── submission_spec.docx  # Submission criteria and file specifications
│   ├── outputs/              # Generated submission CSV reports (git-ignored)
│   ├── src/                  # Core modules and pipeline entrypoint
│   │   └── main.py           # Pipeline entrypoint CLI script
│   ├── venv/                 # Python virtual environment (git-ignored)
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js web application (dashboard & search UI)
│   ├── src/                  # Frontend source code (app, components, hooks, lib, utils)
│   ├── package.json          # Node dependencies and scripts
│   └── next.config.ts        # Next.js configuration
└── package.json              # Root package.json redirection scripts
```

---

## Getting Started

### 1. Running the Frontend Dashboard

To start the Next.js frontend application, make sure you have [Node.js](https://nodejs.org) installed, then run:

```bash
# Install dependencies (if not already installed)
npm install --prefix frontend

# Start the Next.js development server
npm run dev
```

This will run the dashboard on [http://localhost:3000](http://localhost:3000).

### 2. Running the Backend Ranking Pipeline

To evaluate candidates and output a rank-ordered CSV:

#### Set Up a Virtual Environment:
```bash
# Create a virtual environment inside the backend directory
python -m venv backend/venv

# Activate the virtual environment
# On Windows:
backend\venv\Scripts\activate
# On macOS/Linux:
source backend/venv/bin/activate

# Install required Python dependencies
pip install -r backend/requirements.txt
```

#### Execute the Pipeline:
With the environment activated, you can run the pipeline from the project root:

```bash
# Run with default settings (evaluates backend/data/sample_candidates_small.json)
python backend/src/main.py

# Run on the full dataset (backend/data/candidates.jsonl)
python backend/src/main.py --candidates backend/data/candidates.jsonl --output backend/outputs/submission.csv
```

#### CLI Options:
- `--candidates`: Path to candidate data file (JSON/JSONL format, default: `backend/data/sample_candidates_small.json`)
- `--jd`: Path to custom job description text file (optional)
- `--output`: Path to write the output CSV (default: `backend/outputs/submission.csv`)
- `--top-k`: Number of top candidates to export (default: `100`)
