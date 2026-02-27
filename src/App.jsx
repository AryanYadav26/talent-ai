import { useState, useCallback, useRef } from "react";

const W_DEF = { experience: 35, skills: 35, education: 15, leadership: 15 };
const DIM_CLR = { experience: "#4fa8ff", skills: "#00c896", education: "#f5a623", leadership: "#c084fc" };
const BADGE_CLR = { "Strongly Recommend": "#00c896", "Recommend": "#4fa8ff", "Consider": "#f5a623", "Not Recommended": "#ff5c5c" };
const scoreClr = s => s >= 75 ? "#00c896" : s >= 55 ? "#4fa8ff" : s >= 35 ? "#f5a623" : "#ff5c5c";

const DEFAULT_JD = `Job Title: Senior Full-Stack Software Engineer
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

async function scoreCandidate(resume, jd, weights) {
  try {
    const system = "You are an expert technical recruiter AI. Respond ONLY with valid JSON. No markdown. No text outside the JSON object.";
    const content = `Score this resume against the job description.

JOB DESCRIPTION:
${jd}

RESUME:
${resume.text}

SCORING WEIGHTS: Experience ${weights.experience}%, Skills ${weights.skills}%, Education ${weights.education}%, Leadership ${weights.leadership}%

Return ONLY this JSON, nothing else:
{"overall_score":75,"dimension_scores":{"experience":80,"skills":70,"education":65,"leadership":60},"strengths":["strength 1","strength 2","strength 3"],"gaps":["gap 1","gap 2"],"summary":"First sentence about candidate. Second sentence about fit.","recommendation":"Recommend","bias_flags":[]}

recommendation must be exactly one of: Strongly Recommend, Recommend, Consider, Not Recommended
bias_flags: list any non-job-relevant info found (age, marital status, religion, hobbies) or empty array`;

    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, messages: [{ role: "user", content }] })
    });

    const raw = await res.text();
    if (!res.ok) {
      let msg = raw;
      try { msg = JSON.parse(raw).error || raw; } catch (_) {}
      throw new Error(String(msg).slice(0, 200));
    }

    const data = JSON.parse(raw);
    let text = data.content?.[0]?.text || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON in response: " + text.slice(0, 100));
    const parsed = JSON.parse(text.slice(start, end + 1));

    return {
      id: resume.id, name: resume.name,
      overall_score:     Number(parsed.overall_score) || 0,
      dimension_scores: {
        experience: Number(parsed.dimension_scores?.experience) || 0,
        skills:     Number(parsed.dimension_scores?.skills)     || 0,
        education:  Number(parsed.dimension_scores?.education)  || 0,
        leadership: Number(parsed.dimension_scores?.leadership) || 0,
      },
      strengths:      Array.isArray(parsed.strengths)   ? parsed.strengths   : [],
      gaps:           Array.isArray(parsed.gaps)         ? parsed.gaps        : [],
      summary:        parsed.summary        || "",
      recommendation: parsed.recommendation || "Consider",
      bias_flags:     Array.isArray(parsed.bias_flags)  ? parsed.bias_flags  : [],
      error: null
    };
  } catch (e) {
    return {
      id: resume.id, name: resume.name,
      overall_score: 0,
      dimension_scores: { experience: 0, skills: 0, education: 0, leadership: 0 },
      strengths: [], gaps: [],
      summary: "Scoring failed: " + (e?.message || String(e)),
      recommendation: "Consider", bias_flags: [],
      error: e?.message || String(e)
    };
  }
}

// Read file as text
function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function App() {
  const [jd, setJd] = useState(DEFAULT_JD);
  const [weights, setWeights] = useState(W_DEF);
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scoringName, setScoringName] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("setup");
  const [globalError, setGlobalError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleFiles = useCallback(async (files) => {
    const valid = Array.from(files).filter(f =>
      f.type === "text/plain" || f.name.endsWith(".txt") || f.name.endsWith(".md")
    );
    if (valid.length === 0) {
      setGlobalError("Please upload .txt or .md files only");
      return;
    }
    const remaining = 10 - resumes.length;
    const toAdd = valid.slice(0, remaining);
    if (valid.length > remaining) {
      setGlobalError(`Maximum 10 resumes. Added first ${remaining} files.`);
    } else {
      setGlobalError("");
    }
    const parsed = await Promise.all(toAdd.map(async (f, i) => ({
      id: Date.now() + i,
      name: f.name.replace(/\.(txt|md)$/i, "").replace(/[-_]/g, " "),
      fileName: f.name,
      text: await readFileText(f)
    })));
    setResumes(prev => [...prev, ...parsed].slice(0, 10));
  }, [resumes.length]);

  const removeResume = (id) => setResumes(prev => prev.filter(r => r.id !== id));

  const run = useCallback(async () => {
    if (totalW !== 100) { setGlobalError("Weights must sum to 100%"); return; }
    if (resumes.length === 0) { setGlobalError("Please upload at least one resume"); return; }
    setGlobalError(""); setLoading(true); setProgress(0); setResults([]); setTab("results");
    const scored = [];
    for (let i = 0; i < resumes.length; i++) {
      setScoringName(resumes[i].name);
      const r = await scoreCandidate(resumes[i], jd, weights);
      scored.push(r);
      setProgress(Math.round((i + 1) / resumes.length * 100));
      setResults([...scored].sort((a, b) => b.overall_score - a.overall_score));
    }
    setScoringName(""); setLoading(false);
  }, [jd, weights, totalW, resumes]);

  const tabs = ["setup", "results", ...(selected ? ["detail"] : [])];

  return (
    <div style={{ minHeight:"100vh", background:"#0a0c12", color:"#e2e4f0", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
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
        .dropzone{border:2px dashed #2a3060;border-radius:10px;padding:36px 20px;text-align:center;cursor:pointer;transition:all .2s}
        .dropzone:hover,.dropzone.over{border-color:#4fa8ff;background:#4fa8ff08}
        .resume-tag{display:flex;align-items:center;gap:8px;background:#0f1120;border:1px solid #1a1e30;border-radius:6px;padding:8px 12px;margin-bottom:6px}
        .rm-btn{background:none;border:none;color:#3a3e55;cursor:pointer;font-size:14px;line-height:1;padding:0 2px}
        .rm-btn:hover{color:#ff5c5c}
        input[type=file]{display:none}
      `}</style>

      {/* NAV */}
      <div style={{ borderBottom:"1px solid #1a1e30", padding:"16px 36px", display:"flex", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, letterSpacing:4, color:"#4fa8ff" }}>TALENT<span style={{ color:"#00c896" }}>.</span>AI</div>
          <div style={{ fontSize:9, color:"#3a3e55", letterSpacing:3 }}>CANDIDATE SCREENING SYSTEM</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex" }}>
          {tabs.map(t => <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="detail"?selected?.name?.split(" ")[0]:t}</button>)}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 36px" }}>

        {/* ── SETUP TAB ── */}
        {tab==="setup" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24 }} className="fi">

            {/* LEFT — JD */}
            <div>
              <div className="lbl">Job Description</div>
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the full job description here..."
                style={{ width:"100%", minHeight:480, background:"#0f1120", border:"1px solid #1a1e30", borderRadius:10, padding:18, color:"#c0c3d6", fontSize:12, lineHeight:1.8, resize:"vertical" }}
              />
              <div style={{ fontSize:9, color:"#3a3e55", marginTop:8 }}>{jd.length} chars · Be as detailed as possible for accurate scoring</div>
            </div>

            {/* RIGHT — Controls */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Resume Upload */}
              <div className="panel">
                <div className="lbl">Upload Resumes <span style={{ color:"#4fa8ff" }}>({resumes.length}/10)</span></div>

                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".txt,.md"
                  onChange={e => handleFiles(e.target.files)}
                />

                <div
                  className={`dropzone ${dragOver ? "over" : ""}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                >
                  <div style={{ fontSize:24, marginBottom:8 }}>📄</div>
                  <div style={{ fontSize:11, color:"#4fa8ff", marginBottom:4 }}>Click or drag & drop resumes</div>
                  <div style={{ fontSize:9, color:"#3a3e55" }}>Supports .txt and .md files · Max 10 resumes</div>
                </div>

                {resumes.length > 0 && (
                  <div style={{ marginTop:12 }}>
                    {resumes.map(r => (
                      <div key={r.id} className="resume-tag">
                        <span style={{ fontSize:9, color:"#3a3e55" }}>📄</span>
                        <span style={{ fontSize:11, flex:1, color:"#c0c3d6", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                        <span style={{ fontSize:9, color:"#3a3e55" }}>{(r.text.length/1000).toFixed(1)}k</span>
                        <button className="rm-btn" onClick={() => removeResume(r.id)}>✕</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setResumes([])}
                      style={{ fontSize:9, color:"#3a3e55", background:"none", border:"none", cursor:"pointer", marginTop:4, textDecoration:"underline" }}
                    >Clear all</button>
                  </div>
                )}

                {resumes.length === 0 && (
                  <div style={{ marginTop:10, fontSize:9, color:"#2a2e45", lineHeight:2 }}>
                    No resumes uploaded yet.<br/>
                    Tip: Save each resume as a .txt file
                  </div>
                )}
              </div>

              {/* Weights */}
              <div className="panel">
                <div className="lbl">Scoring Weights</div>
                {Object.entries(weights).map(([k,v])=>(
                  <div key={k} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, color:DIM_CLR[k] }}>{k}</span>
                      <span style={{ fontSize:13, color:DIM_CLR[k] }}>{v}%</span>
                    </div>
                    <input type="range" min={0} max={60} value={v}
                      onChange={e => setWeights(w => ({...w, [k]: +e.target.value}))} />
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

              <button className="pbtn" onClick={run} disabled={loading||totalW!==100||resumes.length===0}>
                {loading ? `Scoring ${progress}%...` : `▶  Screen ${resumes.length || 0} Candidate${resumes.length !== 1 ? "s" : ""}`}
              </button>

              {resumes.length === 0 && (
                <div style={{ fontSize:9, color:"#2a2e45", textAlign:"center" }}>Upload resumes above to begin</div>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS TAB ── */}
        {tab==="results" && (
          <div className="fi">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:2 }}>RANKED SHORTLIST</div>
                <div style={{ fontSize:10, color:"#3a3e55", marginTop:4 }}>
                  {loading
                    ? <span className="pulse">Scoring {scoringName}... ({results.length}/{resumes.length})</span>
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
                      {c.error && <span className="badge" style={{ background:"#ff5c5c15", color:"#ff9980", border:"1px solid #ff5c5c30", fontSize:9 }}>Error</span>}
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

        {/* ── DETAIL TAB ── */}
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
                <div style={{ fontSize:12, color:"#ffaa88", wordBreak:"break-all" }}>{selected.error}</div>
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
                  {(selected.strengths||[]).map((s,i)=><div key={i} style={{ fontSize:12, color:"#c0c3d6", marginBottom:8, paddingLeft:12, borderLeft:"2px solid #00c89640", lineHeight:1.6 }}>{s}</div>)}
                </div>
                <div className="panel" style={{ flex:1 }}>
                  <div className="lbl" style={{ color:"#f5a623aa" }}>△ Gaps</div>
                  {(selected.gaps||[]).map((g,i)=><div key={i} style={{ fontSize:12, color:"#c0c3d6", marginBottom:8, paddingLeft:12, borderLeft:"2px solid #f5a62340", lineHeight:1.6 }}>{g}</div>)}
                </div>
              </div>
            </div>

            {selected.bias_flags?.length>0&&(
              <div style={{ background:"#ff5c5c08", border:"1px solid #ff5c5c25", borderRadius:10, padding:20, marginBottom:16 }}>
                <div className="lbl" style={{ color:"#ff5c5caa" }}>⚠ Bias Audit</div>
                <div style={{ fontSize:11, color:"#666", marginBottom:10 }}>Non-job-relevant attributes — should not influence decisions:</div>
                {selected.bias_flags.map((f,i)=><div key={i} style={{ fontSize:12, color:"#ffaa88", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #ff5c5c40" }}>{f}</div>)}
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
        <div style={{ fontSize:9, color:"#2a2e45" }}>Powered by Google Gemini 1.5 Flash</div>
      </div>
    </div>
  );
}
