import { useState } from "react";

export default function App() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Smart AI-like scoring logic (no external API)
  function scoreCandidate(resume, jd) {
    const resumeText = resume.toLowerCase();
    const jdText = jd.toLowerCase();

    let skills = 0;
    let experience = 0;
    let projects = 15; // default mock
    let education = 15; // default mock

    // Skill matching
    if (resumeText.includes("react")) skills += 15;
    if (resumeText.includes("node")) skills += 15;
    if (resumeText.includes("aws")) skills += 10;
    if (resumeText.includes("mern")) skills += 10;
    if (resumeText.includes("python")) skills += 10;

    // Experience simulation
    if (resumeText.includes("3 years")) experience += 25;
    else if (resumeText.includes("2 years")) experience += 20;
    else experience += 15;

    const total = skills + experience + projects + education;

    let summary = "";

    if (total >= 80) summary = "Excellent match for the role.";
    else if (total >= 65) summary = "Strong candidate with good alignment.";
    else if (total >= 50) summary = "Moderate fit. Some skill gaps.";
    else summary = "Limited match for this position.";

    return {
      skills,
      experience,
      projects,
      education,
      total,
      summary,
    };
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

    const scoredResults = [];

    for (let i = 0; i < candidates.length; i++) {
      const result = scoreCandidate(candidates[i].resume, jd);

      scoredResults.push({
        name: candidates[i].name,
        ...result,
      });

      setProgress(((i + 1) / candidates.length) * 100);

      // Small delay for smooth progress animation
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setResults(scoredResults);
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
            <p><strong>Skills:</strong> {r.skills}</p>
            <p><strong>Experience:</strong> {r.experience}</p>
            <p><strong>Projects:</strong> {r.projects}</p>
            <p><strong>Education:</strong> {r.education}</p>
            <p><strong>AI Summary:</strong> {r.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}