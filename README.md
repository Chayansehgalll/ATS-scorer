# ATScore – ATS Resume Scorer

An AI-powered tool that scores your resume against a job description, identifies missing keywords, and rewrites weak bullets using Claude AI.

## Features

- Upload PDF or DOCX resume
- Paste any job description
- Instant ATS score (0–100) with breakdown
- Missing keyword analysis with importance levels
- AI-powered bullet point rewrites with explanations
- Quick wins and red flags

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Anthropic Claude API |
| File Parsing | pdf-parse (PDF), mammoth (DOCX) |

## Project Structure

```
ats-scorer/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx   # File upload + JD input
│   │   │   └── ResultsPage.jsx  # Score + analysis display
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/
│   ├── index.js           
│   ├── .env.example
│   └── package.json
└── package.json            # Root scripts
```

## Getting Started

### 1. Prerequisites

- Node.js 18+

### 2. Install dependencies

```bash
# From project root
npm run install:all
```

### 3. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
```

### 4. Run in development

```bash
# From project root — starts both server (5000) and client (5173)
npm run dev
```

Open http://localhost:5173

## API Reference

### POST `/api/analyze`

**Body** (multipart/form-data):
- `resume` — PDF or DOCX file (max 5MB)
- `jobDescription` — string (min 50 chars)

**Response:**
```json
{
  "success": true,
  "analysis": {
    "ats_score": 67,
    "score_breakdown": {
      "keyword_match": 70,
      "experience_relevance": 65,
      "skills_alignment": 72,
      "formatting_ats_friendliness": 80
    },
    "verdict": "Good Match",
    "summary": "...",
    "matched_keywords": ["React", "Node.js", ...],
    "missing_critical_keywords": [
      { "keyword": "TypeScript", "importance": "High", "context": "..." }
    ],
    "bullet_rewrites": [
      { "original": "...", "rewritten": "...", "reason": "..." }
    ],
    "quick_wins": ["...", "...", "..."],
    "red_flags": ["..."]
  }
}
```
- [ ] Cover letter generator
- [ ] Multiple JD comparison
- [ ] Chrome extension to auto-grab JD from job boards
- [ ] Export results as PDF report
