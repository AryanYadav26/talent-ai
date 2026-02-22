import { useState, useCallback } from "react";

const MODEL = "claude-sonnet-4-20250514";

const RESUMES = [
  {
    id: 1, name: "Priya Sharma",
    text: `PRIYA SHARMA | priya.sharma@email.com | Bangalore
SUMMARY: Results-driven Software Engineer with 5 years of experience in full-stack development. Expertise in React, Node.js, and AWS. Led teams of 4-6 engineers.
EXPERIENCE:
Senior Software Engineer — Infosys, Bangalore (2021–Present)
- Led migration of monolithic app to microservices, reducing latency by 40%
- Mentored 4 junior developers; conducted weekly code reviews
- Built real-time dashboard using React + WebSockets, used by 10,000+ users
Software Engineer — Wipro, Hyderabad (2019–2021)
- Developed REST APIs in Node.js serving 500K daily requests
- Integrated third-party payment gateways (Razorpay, Stripe)
EDUCATION: B.Tech Computer Science — NIT Trichy (2019) | CGPA: 8.7/10
SKILLS: React, TypeScript, Node.js, Express, AWS (EC2, S3, Lambda), Docker, PostgreSQL, MongoDB, Redis
CERTIFICATIONS: AWS Certified Developer – Associate (2022)`
  },
  {
    id: 2, name: "Arjun Mehta",
    text: `Arjun Mehta | arjun.mehta@gmail.com | Mumbai
Education: B.E. Computer Engineering — University of Mumbai (2024) | CGPA: 7.2/10
Experience:
Intern — TCS, Mumbai (June–Aug 2023)
- Worked on internal HR portal using Angular and Java Spring Boot
- Fixed 15 bugs; wrote unit tests
Projects: E-commerce website using React and Firebase. Integrated Stripe.
Skills: HTML, CSS, JavaScript, React (basic), Java, MySQL, Git
Interests: Cricket, gaming`
  },
  {
    id: 3, name: "Sunita Rao",
    text: `SUNITA RAO | sunita.rao@techmail.com | Pune
PROFILE: Full-Stack Developer with 8 years of experience in enterprise SaaS. Deep expertise in React, Node.js, AWS. Managed cross-functional teams of 10+.
EXPERIENCE:
Engineering Manager / Lead Developer — Persistent Systems (2020–Present)
- Architected B2B SaaS platform serving 200+ enterprise clients
- Grew engineering team from 3 to 12; introduced OKR-based performance reviews
- Reduced infrastructure costs by 35% through AWS optimization; 99.9% uptime SLA
Senior Developer — Zensar Technologies (2016–2020)
- Core contributor to cloud-native ERP with React + GraphQL + Node
- Implemented CI/CD pipelines; designed multi-tenant PostgreSQL schema
EDUCATION: M.Tech Software Engineering — COEP (2016) | Distinction; B.E. CS — Pune University (2014)
SKILLS: React, Next.js, TypeScript, GraphQL, Node.js, NestJS, AWS (certified), Azure, Docker, Kubernetes, Terraform, PostgreSQL, MongoDB
CERTIFICATIONS: AWS Solutions Architect Professional | Google Cloud Associate`
  },
  {
    id: 4, name: "Rahul Gupta",
    text: `Rahul Gupta | rahul.g@outlook.com | Delhi
Work Experience:
- Worked at startup QuickBit for 2 years as developer. Made React apps and helped with backend in Python. Left because company shut down.
Education: Diploma in IT from polytechnic in Delhi (2019)
Skills: React, Python, basic SQL, MS Office
Looking for good opportunity in software development.`
  },
  {
    id: 5, name: "Neha Kulkarni",
    text: `NEHA KULKARNI | neha.kulkarni@dev.io | Hyderabad
ABOUT: Frontend Developer with 3 years experience specializing in React and UI/UX. Expanding into backend and cloud.
EXPERIENCE:
Frontend Developer — Mphasis, Hyderabad (2022–Present)
- Developed accessible React components across 5 product lines
- Achieved 95+ Lighthouse score; reduced design-to-code cycle by 30%
Junior Frontend Developer — Byju's, Bangalore (2021–2022)
- Built interactive quiz and video components in React
EDUCATION: B.Sc. Computer Science — Osmania University (2021) | 78%
SKILLS: React, TypeScript, HTML5, CSS3, Tailwind, Redux, Jest, Storybook, Node.js (learning), AWS basics, Figma, WCAG 2.1
ACHIEVEMENTS: Won Mphasis internal hackathon 2023 (Best UI/UX); Speaker at React meetup Hyderabad 2023`
  },
  {
    id: 6, name: "Vikram Singh",
    text: `VIKRAM SINGH | vikram.singh@email.com | Noida | Age: 28, Married
OBJECTIVE: Seeking challenging position in software development.
EDUCATION: B.Tech CSE — Amity University Noida (2018) | 68%
WORK EXPERIENCE:
Software Developer — Cognizant, Noida (2018–2023)
- Java Spring Boot microservices for banking client
- React frontend for internal admin tools; integrated AWS (S3, SQS, RDS)
- Part of 15-member agile team
Associate Developer — Accenture (2023–Present)
- Node.js migration project; writing unit tests; collaborating with offshore/onshore teams
SKILLS: Java, Spring Boot, React, Node.js, AWS, SQL, Docker, Git
HOBBIES: Reading, Trekking, Photography`
  },
  {
    id: 7, name: "Anjali Desai",
    text: `ANJALI DESAI, M.S. | anjali.desai@protonmail.com | San Francisco (open to relocation)
SUMMARY: Full-Stack Engineer, 6 years experience including 2 years at Meta. Expert in React, Node.js, distributed systems. Leading team of 5 engineers at Series B startup.
EXPERIENCE:
Staff Engineer — Zeta Suite, San Francisco (2022–Present)
- Lead architect for real-time collaboration features, 50K+ DAU
- Built internal design system with 60+ accessible React components
- Reduced bundle size 55% via code splitting; hired and mentored 5 engineers
Software Engineer — Meta, Menlo Park (2020–2022)
- React-based internal tooling for 70,000 employees
- Performance monitoring dashboard processing 1M+ events/day
- Open source contributor to React DevTools
Software Engineer — Flipkart, Bangalore (2018–2020)
- Product listing and checkout flows handling Rs.10Cr+ daily GMV
- A/B testing framework improving conversion by 12%
EDUCATION: M.S. Computer Science — Stanford University (2018); B.Tech CS — IIT Bombay (2016) | 9.1/10
SKILLS: React, TypeScript, Node.js, GraphQL, System Design, Python, Go, AWS, GCP, Kubernetes, Terraform
OPEN SOURCE: 2.1K GitHub stars on react-perf-hooks; Speaker at ReactConf 2023`
  },
  {
    id: 8, name: "Rohan Joshi",
    text: `Rohan Joshi | rohan.j99@gmail.com
Education: 12th pass (2017)
Experience: Freelance web work for 5 years. Make websites for local businesses using WordPress and basic HTML/CSS. Used React once but it was difficult. Hard working and quick learner.
Skills: WordPress, HTML, CSS, Photoshop
References available on request.`
  }
];

const SAMPLE_JD = `Job Title: Senior Full-Stack Software Engineer
Department: Engineering | Seniority: Senior (5+ years) | Location: Bangalore / Hybrid

About the Role:
We are looking for a Senior Full-Stack Software Engineer to join our product engineering team. You will design, build, and maintain scalable web applications, collaborate with product and design, and help grow engineering culture.

Key Responsibilities:
- Design and develop high-performance full-stack apps using React and Node.js
- Architect scalable backend services and REST/GraphQL APIs
- Deploy and manage cloud infrastructure on AWS
- Lead and mentor junior engineers; conduct code reviews
- Collaborate cross-functionally in an agile environment

Required Skills:
- 5+ years professional software development experience
- Expert-level React and TypeScript
- Strong Node.js (Express/NestJS) backend skills
- Hands-on AWS experience (EC2, S3, Lambda, RDS)
- SQL and NoSQL proficiency (PostgreSQL, MongoDB)
- Docker and CI/CD pipeline experience
- Strong communication and leadership skills
- B.Tech/B.E./M.Tech in Computer Science or equivalent

Nice to Have:
- Kubernetes or Terraform experience
- Open source contributions
- GraphQL expertise`;

const W_DEFAULT = { experience: 35, skills: 35, education: 15, leadership: 15 };
const DIM_COLORS = { experience: "#4fa8ff", skills: "#00c896", education: "#f5a623", leadership: "#c084fc" };
const BADGE_COLOR = {
  "Strongly Recommend": "#00c896",
  "Recommend": "#4fa8ff",
  "Consider": "#f5a623",
  "Not Recommended": "#ff5c5c"
};
const scoreColor = s => s >= 75 ? "#00c896" : s >= 55 ? "#4fa8ff" : s >= 35 ? "#f5a623" : "#ff5c5c";

async function scoreCandidate(resume, jd, weights, apiKey) {
  try {
    // Call our own Vercel serverless proxy at /api/score
    // This avoids browser CORS restrictions when calling Anthropic directly
    const res = await fetch("/api/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: `You are an expert technical recruiter AI. Score candidates against job descriptions. Respond ONLY with valid JSON, no markdown, no explanation outside JSON.`,
        messages: [{
          role: "user",
          content: `Score this candidate against the JD using the given weights.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME:
${resume.text}

WEIGHTS: Experience: ${weights.experience}%, Skills: ${weights.skills}%, Education: ${weights.education}%, Leadership: ${weights.leadership}%

Respond with this exact JSON structure:
{
  "overall_score": <integer 0-100>,
  "dimension_scores": {
    "experience": <integer 0-100>,
    "skills": <integer 0-100>,
    "education": <integer 0-100>,
    "leadership": <integer 0-100>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "summary": "2 sentence explanation of ranking",
  "recommendation": "Strongly Recommend or Recommend or Consider or Not Recommended",
  "bias_flags": ["list any non-job-relevant info found like age/marital status/hobbies, or empty array"]
}`
        }]
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    return { ...JSON.parse(text), id: resume.id, name: resume.name, error: null };
  } catch (e) {
    return {
      id: resume.id, name: resume.name,
      overall_score: 0,
      dimension_scores: { experience: 0, skills: 0, education: 0, leadership: 0 },
      strengths: [], gaps: [`Scoring failed: ${e.message}`],
      summary: `Could not score: ${e.message}`,
      recommendation: "Consider",
      bias_flags: [],
      error: e.message
    };
  }
}

export default function App() {
  const [jd, setJd] = useState(SAMPLE_JD);
  const [weights, setWeights] = useState(W_DEFAULT);
  const [apiKey, setApiKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("setup");
  const [error, setError] = useState("");

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);
  const keyValid = apiKey.startsWith("sk-ant-");

  const runScreening = useCallback(async () => {
    if (totalW !== 100) { setError("Weights must sum to 100%"); return; }
    if (!keyValid) { setError("Please enter a valid Anthropic API key (starts with sk-ant-)"); return; }
    setError("");
    setLoading(true);
    setProgress(0);
    setResults([]);
    setTab("results");

    const scored = [];
    for (let i = 0; i < RESUMES.length; i++) {
      setCurrentName(RESUMES[i].name);
      const r = await scoreCandidate(RESUMES[i], jd, weights, apiKey);
      scored.push(r);
      setProgress(Math.round(((i + 1) / RESUMES.length) * 100));
      setResults([...scored].sort((a, b) => b.overall_score - a.overall_score));
    }
    setCurrentName("");
    setLoading(false);
  }, [jd, weights, totalW, apiKey, keyValid]);

  const tabs = ["setup", "results", ...(selected ? ["detail"] : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c12", color: "#e2e4f0", fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e2235}
        input[type=range]{accent-color:#4fa8ff;width:100%;cursor:pointer}
        textarea,input{outline:none}
        .card{background:#0f1120;border:1px solid #1a1e30;border-radius:10px;padding:20px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s,transform 0.1s}
        .card:hover{border-color:#2a3060;transform:translateY(-1px)}
        .btn{background:#4fa8ff;color:#0a0c12;border:none;padding:13px 28px;font-family:inherit;font-size:11px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer;font-weight:500;transition:all 0.2s;width:100%}
        .btn:hover:not(:disabled){background:#7bc0ff}
        .btn:disabled{background:#1a1e30;color:#333;cursor:not-allowed}
        .btn-ghost{background:none;border:1px solid #2a3060;color:#4fa8ff;padding:8px 18px;font-family:inherit;font-size:10px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer}
        .btn-ghost:hover{background:#4fa8ff11}
        .badge{padding:3px 10px;border-radius:20px;font-size:10px;letter-spacing:1px;font-weight:500}
        @keyframes bar{from{width:0}}.dim-bar{border-radius:3px;animation:bar 0.7s ease forwards}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fade 0.3s ease forwards}
        .tab-btn{background:none;border:none;border-bottom:2px solid transparent;padding:10px 18px;font-family:inherit;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;color:#444;transition:all 0.2s}
        .tab-btn.active{color:#4fa8ff;border-bottom-color:#4fa8ff}
        .tab-btn:hover:not(.active){color:#888}
        .lbl{font-size:10px;color:#3a3e55;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}.pulse{animation:pulse 1.4s ease-in-out infinite}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1a1e30", padding: "18px 36px", display: "flex", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: 4, color: "#4fa8ff" }}>
            TALENT<span style={{ color: "#00c896" }}>.</span>AI
          </div>
          <div style={{ fontSize: 9, color: "#3a3e55", letterSpacing: 3, marginTop: 1 }}>CANDIDATE SCREENING SYSTEM</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex" }}>
          {tabs.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "detail" ? selected?.name?.split(" ")[0] : t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 36px" }}>

        {/* ── SETUP ── */}
        {tab === "setup" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 24 }} className="fade-in">
            <div>
              <div className="lbl">Job Description</div>
              <textarea value={jd} onChange={e => setJd(e.target.value)}
                style={{ width: "100%", minHeight: 480, background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 18, color: "#c0c3d6", fontSize: 12, lineHeight: 1.8, fontFamily: "inherit", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* API Key */}
              <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 18 }}>
                <div className="lbl">Anthropic API Key</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type={keyVisible ? "text" : "password"} placeholder="sk-ant-api03-..."
                    value={apiKey} onChange={e => { setApiKey(e.target.value); setError(""); }}
                    style={{ flex: 1, background: "#0a0c12", border: `1px solid ${keyValid ? "#00c896" : "#2a2e45"}`, borderRadius: 6, padding: "9px 12px", color: "#e2e4f0", fontSize: 11, fontFamily: "inherit" }} />
                  <button onClick={() => setKeyVisible(v => !v)}
                    style={{ background: "#1a1e30", border: "none", borderRadius: 6, padding: "0 12px", color: "#888", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>
                    {keyVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {apiKey && !keyValid
                  ? <div style={{ fontSize: 10, color: "#ff5c5c" }}>Key must start with sk-ant-</div>
                  : keyValid
                    ? <div style={{ fontSize: 10, color: "#00c896" }}>✓ Key looks valid</div>
                    : null
                }
                <div style={{ fontSize: 9, color: "#3a3e55", marginTop: 6, lineHeight: 1.7 }}>
                  Get key at console.anthropic.com → API Keys<br />
                  Never stored — only used for this session
                </div>
              </div>

              {/* Weights */}
              <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 18 }}>
                <div className="lbl">Scoring Weights</div>
                {Object.entries(weights).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: DIM_COLORS[k] }}>{k}</span>
                      <span style={{ fontSize: 13, color: DIM_COLORS[k] }}>{v}%</span>
                    </div>
                    <input type="range" min={0} max={60} value={v}
                      onChange={e => setWeights(w => ({ ...w, [k]: +e.target.value }))} />
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #1a1e30", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#3a3e55" }}>TOTAL</span>
                  <span style={{ fontSize: 22, fontFamily: "'Syne',sans-serif", fontWeight: 800, color: totalW === 100 ? "#00c896" : "#ff5c5c" }}>{totalW}%</span>
                </div>
                {totalW !== 100 && <div style={{ fontSize: 10, color: "#ff5c5c", marginTop: 4 }}>Adjust sliders to reach 100%</div>}
              </div>

              {error && (
                <div style={{ background: "#ff5c5c11", border: "1px solid #ff5c5c33", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#ff5c5c" }}>{error}</div>
              )}

              <button className="btn" onClick={runScreening} disabled={loading || totalW !== 100 || !keyValid}>
                {loading ? `Analyzing ${progress}%...` : "Run AI Screening →"}
              </button>

              <div style={{ fontSize: 10, color: "#3a3e55", lineHeight: 2 }}>
                {RESUMES.length} CANDIDATES LOADED
                {RESUMES.map(r => <div key={r.id} style={{ color: "#555" }}>· {r.name}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {tab === "results" && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: 2 }}>RANKED SHORTLIST</div>
                <div style={{ fontSize: 10, color: "#3a3e55", marginTop: 4 }}>
                  {loading
                    ? <span className="pulse">Scoring {currentName}... ({results.length}/{RESUMES.length} done)</span>
                    : `${results.length} candidates ranked · click any card for details`}
                </div>
              </div>
              <button className="btn-ghost" onClick={() => setTab("setup")}>← Adjust</button>
            </div>

            {loading && (
              <div style={{ background: "#1a1e30", borderRadius: 3, height: 3, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ height: 3, borderRadius: 3, width: `${progress}%`, background: "linear-gradient(90deg,#4fa8ff,#00c896)", transition: "width 0.5s ease" }} />
              </div>
            )}

            {results.map((c, idx) => (
              <div key={c.id} className="card fade-in" onClick={() => { setSelected(c); setTab("detail"); }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, fontFamily: "'Syne',sans-serif",
                    background: idx === 0 ? "#f5a623" : idx === 1 ? "#aaa" : idx === 2 ? "#c97941" : "#1a1e30",
                    color: idx < 3 ? "#0a0c12" : "#555"
                  }}>{idx + 1}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</span>
                      <span className="badge" style={{ background: (BADGE_COLOR[c.recommendation] || "#888") + "20", color: BADGE_COLOR[c.recommendation] || "#888", border: `1px solid ${BADGE_COLOR[c.recommendation] || "#888"}40` }}>
                        {c.recommendation}
                      </span>
                      {c.bias_flags?.length > 0 && (
                        <span className="badge" style={{ background: "#ff5c5c15", color: "#ff5c5c", border: "1px solid #ff5c5c30" }}>⚠ Bias Flag</span>
                      )}
                      {c.error && (
                        <span className="badge" style={{ background: "#ff5c5c15", color: "#ff5c5c", border: "1px solid #ff5c5c30" }} title={c.error}>API Error</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 12, lineHeight: 1.6 }}>{c.summary}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                      {Object.entries(c.dimension_scores || {}).map(([dim, score]) => (
                        <div key={dim}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 9 }}>
                            <span style={{ color: "#3a3e55", textTransform: "uppercase", letterSpacing: 1 }}>{dim}</span>
                            <span style={{ color: DIM_COLORS[dim] }}>{score}</span>
                          </div>
                          <div style={{ background: "#1a1e30", borderRadius: 3, height: 4 }}>
                            <div className="dim-bar" style={{ width: `${score}%`, height: 4, background: DIM_COLORS[dim] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ width: 58, height: 58, borderRadius: "50%", border: `2px solid ${scoreColor(c.overall_score)}`, display: "flex", alignItems: "center", justifyContent: "center", background: scoreColor(c.overall_score) + "15" }}>
                      <span style={{ fontSize: 18, color: scoreColor(c.overall_score), fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{c.overall_score}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#3a3e55", marginTop: 4 }}>/100</div>
                  </div>
                </div>
              </div>
            ))}

            {results.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#3a3e55" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>○</div>
                <div style={{ fontSize: 11, letterSpacing: 2 }}>GO TO SETUP AND RUN SCREENING</div>
              </div>
            )}
          </div>
        )}

        {/* ── DETAIL ── */}
        {tab === "detail" && selected && (
          <div className="fade-in">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <button className="btn-ghost" onClick={() => setTab("results")}>← Shortlist</button>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>{selected.name}</div>
                <div style={{ fontSize: 9, color: "#3a3e55", letterSpacing: 2, marginTop: 3 }}>CANDIDATE DETAIL REPORT</div>
              </div>
              <span className="badge" style={{ marginLeft: "auto", fontSize: 12, padding: "6px 16px", background: (BADGE_COLOR[selected.recommendation] || "#888") + "20", color: BADGE_COLOR[selected.recommendation] || "#888", border: `1px solid ${BADGE_COLOR[selected.recommendation] || "#888"}40` }}>
                {selected.recommendation}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 20 }}>
                <div className="lbl">Dimension Scores</div>
                {Object.entries(selected.dimension_scores || {}).map(([dim, score]) => (
                  <div key={dim} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: DIM_COLORS[dim] }}>{dim}</span>
                      <span style={{ color: DIM_COLORS[dim] }}>{score}/100</span>
                    </div>
                    <div style={{ background: "#1a1e30", borderRadius: 4, height: 8 }}>
                      <div className="dim-bar" style={{ width: `${score}%`, height: 8, background: DIM_COLORS[dim], borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #1a1e30", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#3a3e55" }}>OVERALL</span>
                  <span style={{ fontSize: 28, color: scoreColor(selected.overall_score), fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>{selected.overall_score}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 20, flex: 1 }}>
                  <div className="lbl" style={{ color: "#00c896aa" }}>✓ Strengths</div>
                  {(selected.strengths || []).map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#c0c3d6", marginBottom: 8, paddingLeft: 12, borderLeft: "2px solid #00c89640", lineHeight: 1.6 }}>{s}</div>
                  ))}
                </div>
                <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 20, flex: 1 }}>
                  <div className="lbl" style={{ color: "#f5a623aa" }}>△ Gaps</div>
                  {(selected.gaps || []).map((g, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#c0c3d6", marginBottom: 8, paddingLeft: 12, borderLeft: "2px solid #f5a62340", lineHeight: 1.6 }}>{g}</div>
                  ))}
                </div>
              </div>
            </div>

            {selected.bias_flags?.length > 0 && (
              <div style={{ background: "#ff5c5c08", border: "1px solid #ff5c5c25", borderRadius: 10, padding: 20, marginBottom: 16 }}>
                <div className="lbl" style={{ color: "#ff5c5caa" }}>⚠ Bias Audit — Non-Job-Relevant Attributes Detected</div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>These should not influence hiring decisions.</div>
                {selected.bias_flags.map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#ffaa88", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid #ff5c5c40" }}>{f}</div>
                ))}
              </div>
            )}

            <div style={{ background: "#0f1120", border: "1px solid #1a1e30", borderRadius: 10, padding: 20 }}>
              <div className="lbl">AI Summary</div>
              <div style={{ fontSize: 13, color: "#c0c3d6", lineHeight: 1.9 }}>{selected.summary}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #1a1e30", padding: "14px 36px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 9, color: "#2a2e45", letterSpacing: 2 }}>TALENT.AI — APM SCREENING ASSIGNMENT — OPTION C</div>
        <div style={{ fontSize: 9, color: "#2a2e45" }}>Powered by Claude claude-sonnet-4-20250514</div>
      </div>
    </div>
  );
}
