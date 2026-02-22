import { useState, useCallback } from "react";

const MODEL = "claude-sonnet-4-20250514";

const RESUMES = [
  { id: 1, name: "Priya Sharma", text: `PRIYA SHARMA | priya.sharma@email.com | Bangalore
SUMMARY: Software Engineer with 5 years experience. Expert in React, Node.js, AWS. Led teams of 4-6.
EXPERIENCE:
Senior Software Engineer — Infosys, Bangalore (2021–Present)
- Led migration to microservices, reducing latency by 40%
- Mentored 4 junior developers; weekly code reviews
- Built real-time dashboard using React + WebSockets for 10,000+ users
Software Engineer — Wipro, Hyderabad (2019–2021)
- Developed REST APIs in Node.js serving 500K daily requests
- Integrated Razorpay, Stripe payment gateways
EDUCATION: B.Tech Computer Science — NIT Trichy (2019) | CGPA: 8.7/10
SKILLS: React, TypeScript, Node.js, Express, AWS (EC2, S3, Lambda), Docker, PostgreSQL, MongoDB, Redis
CERTIFICATIONS: AWS Certified Developer – Associate (2022)` },

  { id: 2, name: "Arjun Mehta", text: `Arjun Mehta | arjun.mehta@gmail.com | Mumbai
Education: B.E. Computer Engineering — University of Mumbai (2024) | CGPA: 7.2/10
Experience: Intern — TCS, Mumbai (June–Aug 2023)
- Internal HR portal using Angular and Java Spring Boot; fixed 15 bugs; unit tests
Projects: E-commerce website React + Firebase + Stripe
Skills: HTML, CSS, JavaScript, React (basic), Java, MySQL, Git` },

  { id: 3, name: "Sunita Rao", text: `SUNITA RAO | sunita.rao@techmail.com | Pune
PROFILE: Full-Stack Developer 8 years enterprise SaaS. React, Node.js, AWS. Managed teams of 10+.
EXPERIENCE:
Engineering Manager / Lead Developer — Persistent Systems (2020–Present)
- B2B SaaS platform 200+ enterprise clients; team grew 3 to 12; reduced infra costs 35%; 99.9% uptime
Senior Developer — Zensar Technologies (2016–2020)
- Cloud-native ERP React + GraphQL + Node; CI/CD; multi-tenant PostgreSQL
EDUCATION: M.Tech Software Engineering COEP (2016) Distinction; B.E. CS Pune University (2014)
SKILLS: React, Next.js, TypeScript, GraphQL, Node.js, NestJS, AWS, Docker, Kubernetes, Terraform
CERTIFICATIONS: AWS Solutions Architect Professional | Google Cloud Associate` },

  { id: 4, name: "Rahul Gupta", text: `Rahul Gupta | rahul.g@outlook.com | Delhi
Work: Startup QuickBit 2 years developer — React apps, Python backend. Company shut down.
Education: Diploma in IT polytechnic Delhi (2019)
Skills: React, Python, basic SQL, MS Office` },

  { id: 5, name: "Neha Kulkarni", text: `NEHA KULKARNI | neha.kulkarni@dev.io | Hyderabad
ABOUT: Frontend Developer 3 years, React + UI/UX specialist. Expanding to backend/cloud.
EXPERIENCE:
Frontend Developer — Mphasis (2022–Present): Accessible React components 5 product lines; 95+ Lighthouse; design-to-code cycle -30%
Junior Frontend Developer — Byju's (2021–2022): Quiz and video components React
EDUCATION: B.Sc. Computer Science Osmania University (2021) 78%
SKILLS: React, TypeScript, HTML5, CSS3, Tailwind, Redux, Jest, Storybook, Node.js (learning), Figma, WCAG 2.1
ACHIEVEMENTS: Won Mphasis hackathon 2023 Best UI/UX; React meetup speaker Hyderabad 2023` },

  { id: 6, name: "Vikram Singh", text: `VIKRAM SINGH | vikram.singh@email.com | Noida | Age: 28, Married
EDUCATION: B.Tech CSE Amity University Noida (2018) 68%
EXPERIENCE:
Software Developer — Cognizant (2018–2023): Java Spring Boot microservices banking; React admin tools; AWS S3/SQS/RDS; 15-member agile team
Associate Developer — Accenture (2023–Present): Node.js migration; unit tests; offshore collaboration
SKILLS: Java, Spring Boot, React, Node.js, AWS, SQL, Docker, Git
HOBBIES: Reading, Trekking, Photography` },

  { id: 7, name: "Anjali Desai", text: `ANJALI DESAI M.S. | anjali.desai@protonmail.com | San Francisco (open to relocation)
SUMMARY: Full-Stack Engineer 6 years incl. 2 at Meta. React, Node.js, distributed systems. Leading 5-engineer team Series B startup.
EXPERIENCE:
Staff Engineer — Zeta Suite (2022–Present): Lead architect real-time collaboration 50K+ DAU; 60+ accessible React components; 55% bundle reduction; hired/mentored 5 engineers
Software Engineer — Meta (2020–2022): Internal React tooling 70,000 employees; 1M+ events/day dashboard; React DevTools open source
Software Engineer — Flipkart (2018–2020): Checkout Rs.10Cr+ daily GMV; A/B testing +12% conversion
EDUCATION: M.S. CS Stanford (2018); B.Tech CS IIT Bombay (2016) 9.1/10
SKILLS: React, TypeScript, Node.js, GraphQL, Python, Go, AWS, GCP, Kubernetes, Terraform
OPEN SOURCE: 2.1K GitHub stars react-perf-hooks; ReactConf 2023 speaker` },

  { id: 8, name: "Rohan Joshi", text: `Rohan Joshi | rohan.j99@gmail.com
Education: 12th pass (2017)
Experience: Freelance 5 years — WordPress and HTML/CSS for local businesses. Tried React once, found it difficult.
Skills: WordPress, HTML, CSS, Photoshop` }
];

const SAMPLE_JD = `Job Title: Senior Full-Stack Software Engineer
Department: Engineering | Seniority: Senior (5+ years) | Location: Bangalore / Hybrid

Key Responsibilities:
- Design and develop high-performance full-stack apps using React and Node.js
- Architect scalable backend services and REST/GraphQL APIs
- Deploy and manage cloud infrastructure on AWS
- Lead and mentor junior engineers; conduct code reviews

Required Skills:
- 5+ years professional software development experience
- Expert-level React and TypeScript
- Strong Node.js (Express/NestJS) backend skills
- Hands-on AWS (EC2, S3, Lambda, RDS)
- PostgreSQL, MongoDB experience
- Docker and CI/CD pipelines
- Leadership and communication skills
- B.Tech/B.E./M.Tech Computer Science or equivalent

Nice to Have: Kubernetes, Terraform, GraphQL, open source contributions`;

const W_DEF = { experience: 35, skills: 35, education: 15, leadership: 15 };
const DIM_CLR = { experience: "#4fa8ff", skills: "#00c896", education: "#f5a623", leadership: "#c084fc" };
const BADGE_CLR = { "Strongly Recommend": "#00c896", "Recommend": "#4fa8ff", "Consider": "#f5a623", "Not Recommended": "#ff5c5c" };
const scoreClr = s => s >= 75 ? "#00c896" : s >= 55 ? "#4fa8ff" : s >= 35 ? "#f5a623" : "#ff5c5c";

async function scoreCandidate(resume, jd, weights) {
  try {
    // No API key sent from frontend — key is in Vercel env var on the server
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: "You are an expert technical recruiter AI. Respond ONLY with valid JSON. No markdown. No text outside the JSON object.",
        messages: [{
          role: "user",
          content: `Score this resume against the job description.

JOB DESCRIPTION:
${jd}

RESUME:
${resume.text}

SCORING WEIGHTS: Experience ${weights.experience}%, Skills ${weights.skills}%, Education ${weights.education}%, Leadership ${weights.leadership}%

Return ONLY this JSON structure, nothing else:
{
  "overall_score": <integer 0-100>,
  "dimension_scores": {"experience": <0-100>, "skills": <0-100>, "education": <0-100>, "leadership": <0-100>},
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "summary": "Two sentence explanation of why this candidate ranked here.",
  "recommendation": "Strongly Recommend",
  "bias_flags": []
}`
        }]
      })
    });

    const raw = await res.text();
    if (!res.ok) {
      let msg = raw;
      try { msg = JSON.parse(raw).error || raw; } catch (_) {}
      throw new Error(String(msg).slice(0, 200));
    }

    const data = JSON.parse(raw);
    const txt = data.content[0].text.replace(/```json|```/g, "").trim();
    return { ...JSON.parse(txt), id: resume.id, name: resume.name, error: null };
  } catch (e) {
    return {
      id: resume.id, name: resume.name,
      overall_score: 0,
      dimension_scores: { experience: 0, skills: 0, education: 0, leadership: 0 },
      strengths: [], gaps: [],
      summary: "Scoring failed: " + e.message,
      recommendation: "Consider",
      bias_flags: [],
      error: e.message
    };
  }
}

export default function App() {
  const [jd, setJd] = useState(SAMPLE_JD);
  const [weights, setWeights] = useState(W_DEF);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scoringName, setScoringName] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("setup");
  const [globalError, setGlobalError] = useState("");

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);

  const run = useCallback(async () => {
    if (totalW !== 100) { setGlobalError("Weights must sum to 100%"); return; }
    setGlobalError(""); setLoading(true); setProgress(0); setResults([]); setTab("results");
    const scored = [];
    for (let i = 0; i < RESUMES.length; i++) {
      setScoringName(RESUMES[i].name);
      const r = await scoreCandidate(RESUMES[i], jd, weights);
      scored.push(r);
      setProgress(Math.round((i + 1) / RESUMES.length * 100));
      setResults([...scored].sort((a, b) => b.overall_score - a.overall_score));
    }
    setScoringName(""); setLoading(false);
  }, [jd, weights, totalW]);

  const tabs = ["setup", "results", ...(selected ? ["detail"] : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c12", color: "#e2e4f0", fontFamily: "'IBM Plex Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e2235}
        input,textarea{outline:none;font-family:inherit}
        input[type=range]{accent-color:#4fa8ff;width:100%;cursor:pointer}
        .card{background:#0f1120;border:1px solid #1a1e30;border-radius:10px;padding:20px;margin-bottom:10px;cursor:pointer;transition:border-color .2s,transform .1s}
        .card:hover{border-color:#2a3060;transform:translateY(-1px)}
        .pbtn{background:#4fa8ff;color:#0a0c12;border:none;padding:13px;font-family:inherit;font-size:11px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer;font-weight:500;width:100%;transition:background .2s}
        .pbtn:hover:not(:disabled){background:#7bc0ff}
        .pbtn:disabled{background:#1a1e30;color:#2a2e45;cursor:not-allowed}
        .gbtn{background:none;border:1px solid #2a3060;color:#4fa8ff;padding:8px 16px;font-family:inherit;font-size:10px;letter-spacing:2px;text-transform:uppercase;border-radius:6px;cursor:pointer}
        .gbtn:hover{background:#4fa8ff11}
        .badge{padding:3px 10px;border-radius:20px;font-size:10px;letter-spacing:1px;font-weight:500;display:inline-block}
        @keyframes bar{from{width:0}}.dbar{border-radius:3px;animation:bar .7s ease forwards}
        @keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}.fi{animation:fi .3s ease forwards}
        .tab{background:none;border:none;border-bottom:2px solid transparent;padding:10px 18px;font-family:inherit;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;color:#3a3e55;transition:all .2s}
        .tab.on{color:#4fa8ff;border-bottom-color:#4fa8ff}
        .lbl{font-size:9px;color:#3a3e55;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.pulse{animation:pulse 1.4s infinite}
        .panel{background:#0f1120;border:1px solid #1a1e30;border-radius:10px;padding:18px}
      `}</style>

      {/* NAV */}
      <div style={{ borderBottom:"1px solid #1a1e30", padding:"16px 36px", display:"flex", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, letterSpacing:4, color:"#4fa8ff" }}>
            TALENT<span style={{ color:"#00c896" }}>.</span>AI
          </div>
          <div style={{ fontSize:9, color:"#3a3e55", letterSpacing:3 }}>CANDIDATE SCREENING SYSTEM</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex" }}>
          {tabs.map(t => (
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={() => setTab(t)}>
              {t==="detail" ? selected?.name?.split(" ")[0] : t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"32px 36px" }}>

        {/* SETUP */}
        {tab==="setup" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:24 }} className="fi">
            <div>
              <div className="lbl">Job Description</div>
              <textarea value={jd} onChange={e=>setJd(e.target.value)}
                style={{ width:"100%", minHeight:480, background:"#0f1120", border:"1px solid #1a1e30", borderRadius:10, padding:18, color:"#c0c3d6", fontSize:12, lineHeight:1.8, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* WEIGHTS */}
              <div className="panel">
                <div className="lbl">Scoring Weights</div>
                {Object.entries(weights).map(([k,v])=>(
                  <div key={k} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, color:DIM_CLR[k] }}>{k}</span>
                      <span style={{ fontSize:13, color:DIM_CLR[k] }}>{v}%</span>
                    </div>
                    <input type="range" min={0} max={60} value={v} onChange={e=>setWeights(w=>({...w,[k]:+e.target.value}))} />
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #1a1e30", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, color:"#3a3e55" }}>TOTAL</span>
                  <span style={{ fontSize:22, fontFamily:"'Syne',sans-serif", fontWeight:800, color:totalW===100?"#00c896":"#ff5c5c" }}>{totalW}%</span>
                </div>
                {totalW!==100 && <div style={{ fontSize:10, color:"#ff5c5c", marginTop:4 }}>Must equal 100%</div>}
              </div>

              {globalError && (
                <div style={{ background:"#ff5c5c11", border:"1px solid #ff5c5c33", borderRadius:8, padding:"10px 14px", fontSize:11, color:"#ff5c5c" }}>
                  {globalError}
                </div>
              )}

              <button className="pbtn" onClick={run} disabled={loading||totalW!==100}>
                {loading ? `Scoring ${progress}%...` : "▶  Run AI Screening"}
              </button>

              <div className="panel" style={{ fontSize:9, color:"#3a3e55", lineHeight:2.2 }}>
                <div className="lbl">Candidates Loaded</div>
                {RESUMES.map(r=><div key={r.id} style={{ color:"#444" }}>· {r.name}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {tab==="results" && (
          <div className="fi">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:2 }}>RANKED SHORTLIST</div>
                <div style={{ fontSize:10, color:"#3a3e55", marginTop:4 }}>
                  {loading
                    ? <span className="pulse">Scoring {scoringName}... ({results.length}/{RESUMES.length})</span>
                    : `${results.length} candidates ranked · click for detail`}
                </div>
              </div>
              <button className="gbtn" onClick={()=>setTab("setup")}>← Adjust</button>
            </div>

            {loading && (
              <div style={{ background:"#1a1e30", borderRadius:3, height:3, marginBottom:20 }}>
                <div style={{ height:3, borderRadius:3, width:`${progress}%`, background:"linear-gradient(90deg,#4fa8ff,#00c896)", transition:"width .5s" }} />
              </div>
            )}

            {results.map((c,i)=>(
              <div key={c.id} className="card fi" onClick={()=>{ setSelected(c); setTab("detail"); }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, fontFamily:"'Syne',sans-serif", background:i===0?"#f5a623":i===1?"#aaa":i===2?"#c97941":"#1a1e30", color:i<3?"#0a0c12":"#555" }}>{i+1}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:6 }}>
                      <span style={{ fontSize:15, fontWeight:500 }}>{c.name}</span>
                      <span className="badge" style={{ background:(BADGE_CLR[c.recommendation]||"#888")+"20", color:BADGE_CLR[c.recommendation]||"#888", border:`1px solid ${BADGE_CLR[c.recommendation]||"#888"}40` }}>{c.recommendation}</span>
                      {c.bias_flags?.length>0 && <span className="badge" style={{ background:"#ff5c5c15", color:"#ff5c5c", border:"1px solid #ff5c5c30" }}>⚠ Bias</span>}
                      {c.error && <span className="badge" style={{ background:"#ff5c5c15", color:"#ff9980", border:"1px solid #ff5c5c30", fontSize:9 }} title={c.error}>Error</span>}
                    </div>
                    <div style={{ fontSize:11, color:"#555", marginBottom:12, lineHeight:1.6 }}>{c.summary}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                      {Object.entries(c.dimension_scores||{}).map(([dim,score])=>(
                        <div key={dim}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:9 }}>
                            <span style={{ color:"#3a3e55", textTransform:"uppercase", letterSpacing:1 }}>{dim}</span>
                            <span style={{ color:DIM_CLR[dim] }}>{score}</span>
                          </div>
                          <div style={{ background:"#1a1e30", borderRadius:3, height:4 }}>
                            <div className="dbar" style={{ width:`${score}%`, height:4, background:DIM_CLR[dim] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:"center", flexShrink:0 }}>
                    <div style={{ width:58, height:58, borderRadius:"50%", border:`2px solid ${scoreClr(c.overall_score)}`, display:"flex", alignItems:"center", justifyContent:"center", background:scoreClr(c.overall_score)+"18" }}>
                      <span style={{ fontSize:18, color:scoreClr(c.overall_score), fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{c.overall_score}</span>
                    </div>
                    <div style={{ fontSize:9, color:"#3a3e55", marginTop:4 }}>/100</div>
                  </div>
                </div>
              </div>
            ))}
            {results.length===0&&!loading&&(
              <div style={{ textAlign:"center", padding:"80px 0", color:"#3a3e55" }}>
                <div style={{ fontSize:36, marginBottom:12 }}>○</div>
                <div style={{ fontSize:11, letterSpacing:2 }}>GO TO SETUP AND RUN SCREENING</div>
              </div>
            )}
          </div>
        )}

        {/* DETAIL */}
        {tab==="detail"&&selected&&(
          <div className="fi">
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
              <button className="gbtn" onClick={()=>setTab("results")}>← Shortlist</button>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800 }}>{selected.name}</div>
                <div style={{ fontSize:9, color:"#3a3e55", letterSpacing:2, marginTop:3 }}>CANDIDATE DETAIL REPORT</div>
              </div>
              <span className="badge" style={{ marginLeft:"auto", fontSize:12, padding:"6px 16px", background:(BADGE_CLR[selected.recommendation]||"#888")+"20", color:BADGE_CLR[selected.recommendation]||"#888", border:`1px solid ${BADGE_CLR[selected.recommendation]||"#888"}40` }}>{selected.recommendation}</span>
            </div>
            {selected.error && (
              <div style={{ background:"#ff5c5c11", border:"1px solid #ff5c5c44", borderRadius:10, padding:20, marginBottom:16 }}>
                <div className="lbl" style={{ color:"#ff5c5caa" }}>Scoring Error</div>
                <div style={{ fontSize:12, color:"#ffaa88" }}>{selected.error}</div>
              </div>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div className="panel">
                <div className="lbl">Dimension Scores</div>
                {Object.entries(selected.dimension_scores||{}).map(([dim,score])=>(
                  <div key={dim} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:1, color:DIM_CLR[dim] }}>{dim}</span>
                      <span style={{ color:DIM_CLR[dim] }}>{score}/100</span>
                    </div>
                    <div style={{ background:"#1a1e30", borderRadius:4, height:8 }}>
                      <div className="dbar" style={{ width:`${score}%`, height:8, background:DIM_CLR[dim], borderRadius:4 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #1a1e30", paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"#3a3e55" }}>OVERALL</span>
                  <span style={{ fontSize:28, color:scoreClr(selected.overall_score), fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{selected.overall_score}</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="panel" style={{ flex:1 }}>
                  <div className="lbl" style={{ color:"#00c896aa" }}>✓ Strengths</div>
                  {(selected.strengths||[]).map((s,i)=>(
                    <div key={i} style={{ fontSize:12, color:"#c0c3d6", marginBottom:8, paddingLeft:12, borderLeft:"2px solid #00c89640", lineHeight:1.6 }}>{s}</div>
                  ))}
                </div>
                <div className="panel" style={{ flex:1 }}>
                  <div className="lbl" style={{ color:"#f5a623aa" }}>△ Gaps</div>
                  {(selected.gaps||[]).map((g,i)=>(
                    <div key={i} style={{ fontSize:12, color:"#c0c3d6", marginBottom:8, paddingLeft:12, borderLeft:"2px solid #f5a62340", lineHeight:1.6 }}>{g}</div>
                  ))}
                </div>
              </div>
            </div>
            {selected.bias_flags?.length>0&&(
              <div style={{ background:"#ff5c5c08", border:"1px solid #ff5c5c25", borderRadius:10, padding:20, marginBottom:16 }}>
                <div className="lbl" style={{ color:"#ff5c5caa" }}>⚠ Bias Audit</div>
                <div style={{ fontSize:11, color:"#666", marginBottom:10 }}>Non-job-relevant attributes — should not influence decisions:</div>
                {selected.bias_flags.map((f,i)=>(
                  <div key={i} style={{ fontSize:12, color:"#ffaa88", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #ff5c5c40" }}>{f}</div>
                ))}
              </div>
            )}
            <div className="panel">
              <div className="lbl">AI Summary</div>
              <div style={{ fontSize:13, color:"#c0c3d6", lineHeight:1.9 }}>{selected.summary}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:"1px solid #1a1e30", padding:"14px 36px", display:"flex", justifyContent:"space-between" }}>
        <div style={{ fontSize:9, color:"#2a2e45", letterSpacing:2 }}>TALENT.AI — APM SCREENING ASSIGNMENT — OPTION C</div>
        <div style={{ fontSize:9, color:"#2a2e45" }}>Powered by Claude claude-sonnet-4-20250514</div>
      </div>
    </div>
  );
}
