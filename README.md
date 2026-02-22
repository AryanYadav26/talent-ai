# Talent.AI — AI Candidate Screening Tool
**APM Screening Assignment — Option C**

## What It Does
Talent.AI automates the first stage of candidate screening. Paste a job description, set scoring weights across 4 dimensions, and get an AI-ranked shortlist with explainable reasoning — powered by Claude claude-sonnet-4-20250514.

## Live Demo
> **[Insert your Vercel URL here after deployment]**

## How to Use
1. **Setup tab** — Review or edit the preloaded Job Description (Senior Full-Stack Engineer)
2. **Adjust weights** — Set importance of Experience, Skills, Education, Leadership (must total 100%)
3. **Run AI Screening** — Watch candidates score in real-time
4. **Results tab** — View ranked shortlist with scores, recommendation badges, and bias flags
5. **Click any candidate** — See full detail: strengths, gaps, AI summary, bias audit

## Sample Data
- **8 diverse candidate resumes** preloaded (from 12th-pass fresher to Staff Engineer at Meta)
- **Preloaded JD**: Senior Full-Stack Software Engineer (editable)
- No login required. Works in any browser.

## Tech Stack
- **Frontend**: React 18, Vite
- **AI**: Anthropic Claude claude-sonnet-4-20250514 via API
- **Hosting**: Vercel

## Local Development
```bash
npm install
npm run dev
```

## Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## Built With AI Assistance
- Claude (Anthropic) — used for code generation and AI scoring logic
- All product decisions, architecture, and scoping are original
