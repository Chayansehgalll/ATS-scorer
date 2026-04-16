require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
// 1. Swapped Anthropic for Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF and DOCX files are allowed"));
  },
});

// 2. Initialize Gemini Client
// Change your initialization to this:
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel(
  {
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" },
  },
  { apiVersion: "v1beta" }, // <--- ADD THIS LINE
);

async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  const result = await mammoth.extractRawText({ buffer: file.buffer });
  return result.value;
}

function buildPrompt(resumeText, jobDescription) {
  return `You are an expert ATS analyst. Analyze the resume against the job description.
  
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a JSON object in this shape:
{
  "ats_score": number,
  "score_breakdown": { "keyword_match": number, "experience_relevance": number, "skills_alignment": number, "formatting_ats_friendliness": number },
  "verdict": "Strong Match | Good Match | Partial Match | Weak Match",
  "summary": "string",
  "matched_keywords": ["string"],
  "missing_critical_keywords": [{ "keyword": "string", "importance": "Critical|High|Medium", "context": "string" }],
  "bullet_rewrites": [{ "original": "string", "rewritten": "string", "reason": "string" }],
  "quick_wins": ["string"],
  "red_flags": ["string"]
}`;
}

app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file || !jobDescription || jobDescription.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "File and valid Job Description required." });
    }

    const resumeText = await extractText(req.file);

    // 3. Swapped Claude message creation for Gemini content generation
    const result = await model.generateContent(
      buildPrompt(resumeText, jobDescription),
    );
    const response = await result.response;
    const rawText = response.text();

    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    res
      .status(500)
      .json({ error: "Something went wrong with the free AI service." });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () =>
  console.log(`✅ ATS Scorer server running on http://localhost:${PORT}`),
);
