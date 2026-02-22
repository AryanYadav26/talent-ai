import { useState } from "react";

export default function App() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  async function scoreCandidate(resume, jd, weights) {
    console.log("Sending POST request...");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `
You are an AI recruiter.

IMPORTANT:
Respond with ONLY valid JSON.
Do NOT include any explanation.
Do NOT include markdown.
Do NOT include backticks.
Keys MUST be in double quotes.

Return exactly this format:

{
  "skills": number,
  "experience": number,
  "projects": number,
  "education": number,
  "total": number,
  "summary": "short explanation"
}

Job Description:
${jd}

Candidate Resume:
${resume}
`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return {
        total: "API Error",
        summary: "Failed to fetch score.",
      };
    }

    const data = await res.json();
    console.log("FULL API RESPONSE:", data);

    let rawText = data.content?.[0]?.text || "";

    // Remove markdown formatting if Claude adds it
    rawText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(rawText);
    } catch (err) {
      console.error("JSON Parse Failed:", rawText);

      return {
        total: "Format Error",
        summary: rawText,
      };
    }
  }

  async function runScreening() {
    setLoading(true);
    setProgress(0);
    setResults([]);

    const candidates = [
      { name: "Candidate 1", resume: "React developer with 3 years experience." },
      { name: "Candidate 2", resume: "Backend Node.js engineer with AWS experience." },
      { name: "Candidate 3", resume: "Full-stack developer skilled in MERN stack." },
      { name: "Candidate 4", resume: "Data analyst with Python and SQL." },
      { name: "Candidate 5", resume: "Frontend engineer specialized in UI/UX." },
      { name: "Candidate 6", resume: "Cloud engineer with DevOps background." },
      { name: "Candidate 7", resume: "Software engineer with Java & Spring Boot." },
      { name: "Candidate 8", resume: "AI/ML engineer with TensorFlow experience." },
    ];

    const jd =
      "Looking for a full-stack developer with React, Node.js, and AWS experience.";

    const weights = {
      skills: 30,
      experience: 30,
      projects: 20,
      education: 20,
    };

    const scored = [];

    for (let i = 0; i < candidates.length; i++) {
      try {
        const result = await scoreCandidate(
          candidates[i].resume,
          jd,
          weights
        );

        scored.push({
          name: candidates[i].name,
          ...result,
        });

        setProgress(((i + 1) / candidates.length) * 100);
      } catch (error) {
        console.error("Scoring error:", error);
      }
    }

    setResults(scored);
    setLoading(false);
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Talent AI - Candidate Screening</h1>

      <button onClick={runScreening} disabled={loading}>
        {loading ? "Screening..." : "Run AI Screening"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <strong>Progress:</strong> {progress.toFixed(0)}%
      </div>

      <div style={{ marginTop: "30px" }}>
        {results.map((r, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>{r.name}</h3>
            <p><strong>Total Score:</strong> {r.total}</p>
            <p>{r.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}