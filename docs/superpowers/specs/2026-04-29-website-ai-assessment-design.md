# Website AI Readiness Assessment — Design

**Date:** 2026-04-29
**Status:** Approved (user gave full autonomy on remaining details, "just do everything you recommend")

## 1. Goal

Add an embedded AI readiness assessment to the marketing homepage (`src/JMCWebsite.jsx`) that acts as both a value-delivery tool for prospects and a lead-capture/mailing-list mechanism for JMC.

It re-uses the existing 50-question portal assessment (`data/ai_readiness_questions.json`) but exposes it under platform-neutral wording so it works for prospects on Claude, ChatGPT, Copilot, or no platform at all.

## 2. Non-goals

- Generating a downloadable PDF report (out of scope; on-page expansion + thank-you email link only).
- Cross-device resume / magic-link auth flow (single-device localStorage only).
- Any change to the authenticated portal experience (`src/portal/AssessmentView.jsx` and `/api/portal/assessments/*` continue using the Microsoft-flavoured originals).
- A standalone `/assessment` route (assessment lives inline on the homepage; a deep-link is not required for v1).

## 3. User flow

```
[Homepage scroll → "How AI-Ready Is Your Business?" section]
            │
            ▼
   ┌──────────────────────────────────────────────┐
   │ Intro state                                  │
   │  • Section heading & value prop              │
   │  • Lite is the default starting point        │
   │  • Inline "Got 15 minutes? Take the full     │
   │    assessment instead →" link near the top   │
   └──────────────────────────────────────────────┘
            │ user clicks "Start" (lite) or "Take full"
            ▼
   ┌──────────────────────────────────────────────┐
   │ Quiz state                                   │
   │  • Lite: 10-question wizard (1 q per screen) │
   │  • Full: 5-section accordion (50 q total)    │
   │  • Auto-saves answers to localStorage        │
   └──────────────────────────────────────────────┘
            │ all answers complete
            ▼
   ┌──────────────────────────────────────────────┐
   │ Basic results state                          │
   │  • Overall readiness % (large headline)      │
   │  • 5 per-category bars with percentages      │
   │  • Email gate form (email + first name +     │
   │    company) below                            │
   │  • For lite completers: "Want deeper insight?│
   │    Take the full assessment →" CTA           │
   └──────────────────────────────────────────────┘
            │ form submitted, request succeeds
            ▼
   ┌──────────────────────────────────────────────┐
   │ Detailed results state                       │
   │  • Per-category breakdown with current level │
   │    description + what level 4-5 looks like   │
   │  • Suggested next steps per category         │
   │  • CTA: "Book a Discovery Call"              │
   │  • Server-side: lead saved to DB,            │
   │    pushed to Resend Audience, thank-you      │
   │    email sent, JMC team notified             │
   │  • localStorage cleared                      │
   └──────────────────────────────────────────────┘
```

## 4. Architecture

### 4.1 High-level

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React inside existing `JMCWebsite.jsx` | New `<AIAssessment />` component + sub-components |
| Question data | `data/ai_readiness_questions.json` | Augmented with optional `web_prompt`, `web_levels`, `web_category` overrides + a new `lite: true` boolean for the 10 lite questions |
| Public API | New route on the existing Express server (`server/routes/publicAssessments.js`) | Mounted at `/api/portal/public/assessments/*`, no auth |
| Persistence | `portal.db` SQLite (existing) | New `assessment_leads` table |
| Mailing list | Resend Audiences | New env var `RESEND_AUDIENCE_ID` |
| Outbound email | Resend (existing infra) | Two emails per submission: prospect thank-you + internal lead notification |
| Vercel rewrite | Already in place | `/api/portal/*` → Railway-hosted Express |

### 4.2 Why route through the portal server

- The DB lives in the portal Express server (`server/portal.db`).
- Resend SDK is already initialised in `server/lib/notifyClient.js`.
- One source of truth for lead data; future admin UI can list leads alongside existing portal clients.
- Vercel rewrite already proxies `/api/portal/*` → Railway, so no new infrastructure or env vars on the Vercel side.

### 4.3 New files

```
src/components/assessment/
  AIAssessment.jsx          ← top-level orchestrator (state machine)
  AssessmentIntro.jsx       ← intro state UI
  LiteWizard.jsx            ← 10-question wizard
  FullAccordion.jsx         ← 50-question accordion
  BasicResults.jsx          ← overall % + per-category bars
  EmailGate.jsx             ← email + name + company form
  DetailedResults.jsx       ← per-category breakdown + recommendations
  scoring.js                ← shared scoring helpers
  webApi.js                 ← fetch wrapper for the public endpoint

server/routes/publicAssessments.js   ← new public route
data/ai_readiness_questions.json     ← existing file, extended schema
```

### 4.4 Files modified

```
src/JMCWebsite.jsx        ← imports + renders <AIAssessment /> in a new section
server/index.js           ← mounts publicAssessments route + public CORS
server/db.js              ← adds assessment_leads table migration
data/ai_readiness_questions.json  ← adds web_* overrides + lite flags
```

## 5. Frontend

### 5.1 Section placement

Inserted in `src/JMCWebsite.jsx` between the existing `<section id="approach">` (Services & Approach) and the immediately-following Governance & Security strip. The new section uses a `bg-slate-50` background to provide visual separation from the white "approach" section above and the existing slate panel below — matching the alternating bg pattern already used on the page.

### 5.2 Section header (intro state)

Matches existing site patterns:
- Eyebrow: `text-sm font-bold text-blue-900 uppercase tracking-wider` — text: "AI Readiness Assessment"
- Title: `text-3xl lg:text-4xl font-bold text-slate-900` — text: "How AI-Ready Is Your Business?"
- Sub: `text-lg text-slate-600 max-w-3xl mx-auto` — text: "Get a free, immediate snapshot of where you sit across 5 readiness dimensions. Take the 5-minute lite check or go deeper with the full 15-minute assessment."
- Wrapped in the existing `<Reveal>` scroll-animation component.

A small line below the sub-headline:
> _"Just got 5 minutes? Start with the lite check below. **Got 15? Take the full assessment instead →**"_

The "Take the full assessment instead" link toggles the section state from lite-mode to full-mode.

### 5.3 State machine

```
intro
  ├─ start lite ───→ liteQuiz
  └─ start full ───→ fullQuiz

liteQuiz
  └─ answer all 10 ─→ basicResults (mode=lite)

fullQuiz
  └─ answer all 50 ─→ basicResults (mode=full)

basicResults
  └─ submit email ──→ detailedResults

detailedResults
  └─ "Take full assessment" (lite path only) ─→ fullQuiz
       (lite responses pre-fill the matching IDs;
        on completion, skip email gate, re-render detailedResults
        with full-scope scores)
  └─ "Restart" link ─→ intro
```

Restart from `detailedResults` clears the local state and re-shows intro. State held in a single `useReducer` inside `<AIAssessment />`.

### 5.4 Lite wizard (`<LiteWizard />`)

- Card with `bg-white rounded-xl border border-slate-200 shadow-sm` (matches existing service-module cards).
- Top row: progress bar (`bg-blue-100` track, `bg-blue-600` fill, animated width) + "Question N of 10" label.
- Body: question prompt as a `text-xl font-bold text-slate-900` heading. Below it, a 5-button stack of level descriptions — each button shows the level number badge (1–5) on the left and the level description on the right. Selected level gets blue ring + blue badge; unselected gets slate border with hover.
- Footer: "Back" (left, ghost) + "Next" (right, blue-900 primary). Next is disabled until a level is selected. Auto-advances on selection (with 250 ms delay) on touch devices for snappy feel; desktop requires Next click.
- After question 10, a "See my results" CTA replaces Next.

### 5.5 Full accordion (`<FullAccordion />`)

- Re-uses the visual pattern from `JMCWebsite.jsx` line 1747 onwards (the existing module accordion) for consistency with the rest of the site.
- One outer card per category (5 total). Each card header shows: category name, "X of Y answered" progress, and a chevron. Clicking expands.
- Inside each expanded card: question rows. Each row shows the prompt and a horizontal 5-button level selector (numbered 1–5 with hover descriptions). Hovering a level reveals its description in a tooltip / inline reveal panel.
- A persistent "Your progress" footer bar (sticky at bottom of the section) shows total answered and a "See my results" CTA that activates once all 50 are answered. Until then it shows a count.
- Categories that are 100% complete get a green check.

### 5.6 Basic results (`<BasicResults />`)

Shown after all questions are answered (lite or full).

- Headline: "Your AI Readiness Snapshot" + the overall percentage (e.g. "62%") rendered large, in `text-blue-900`.
- Below: 5 per-category rows. Each row shows the category name, a horizontal bar (full width = 100%, fill = category %), and the % value to the right. Bar fill colour is graded:
  - 0–39%: `bg-amber-500`
  - 40–69%: `bg-blue-600`
  - 70–100%: `bg-emerald-600`
- A short interpretive line under each category, e.g. "Strong foundations" (≥70%), "Building" (40–69%), "Early days" (<40%).
- Below the bars: the email gate form (next section).

### 5.7 Email gate (`<EmailGate />`)

- A bordered panel (`bg-white border-l-4 border-blue-900 shadow-sm`) directly below basic results.
- Heading: "Unlock your detailed analysis"
- Sub: "We'll send you a copy and our team will personally review your results to suggest specific next steps."
- Three fields stacked on mobile, 3-column grid on desktop:
  - First name (required, `text` input)
  - Company (required, `text` input)
  - Work email (required, `email` input, validated by HTML5 + simple regex)
- Honeypot hidden `website` field (bot-trap, must remain empty).
- Submit button: `bg-blue-900 text-white px-6 py-3 rounded-lg` — text: "See my detailed analysis"
- Inline `Loader2` spinner during submission; inline error banner on failure.
- Below the submit button, fine print: "By submitting you agree to receive your results and occasional follow-ups from JMC Solutions. You can unsubscribe at any time."

_(No upgrade CTA appears at this stage — keeping the email submit as the single primary action protects the conversion. The "Take the full assessment" upsell appears only after email submission, in the detailed-results state, see §5.8.)_

### 5.8 Detailed results (`<DetailedResults />`)

Replaces the basic-results + email-gate panel after a successful submit.

- Confirmation banner at top: "Detailed analysis below + a copy is on its way to {{email}}."
- For each of the 5 categories, an expandable detail card showing:
  - Category name + score (re-using the bar from basic results so the visual continuity is clear).
  - A **representative question** chosen per category (first lite question for that category — see §7.2 for the pairing) is used as the anchor for the level descriptions.
  - "Where you are now": the level description matching the rounded average score for the category, taken from the representative question's `web_levels`.
  - "What good looks like": the level-5 description from the same representative question — gives a concrete picture of mature state.
  - "Suggested next step": a hardcoded mapping per category (see §7.4).
- For lite completers only, a prominent upsell card appears above the per-category cards:
  > "You answered 10 questions across 5 areas. Want the full picture? **Take the full 50-question assessment →**"
  > Clicking transitions back to the full quiz; the 10 lite answers are pre-filled (they share IDs with the corresponding full questions) and can be changed. After full completion, the email gate is skipped (already captured) and detailed results re-render with the new scores.
- Bottom CTA: "Want personalised guidance? **Book a 30-minute Discovery Call →**" — links to existing `#contact` section on the homepage.
- A subtle "Restart assessment" link at the very bottom.

### 5.9 Animations & accessibility

- All `<Reveal>` wrappers consistent with existing site patterns.
- Wizard transitions use a 200 ms fade between questions.
- All interactive elements have visible focus states (`focus:ring-2 focus:ring-blue-500`).
- Level buttons in the wizard use `role="radiogroup"` with arrow-key navigation.
- Email form labels are visible (not just placeholders) for screen readers.
- All client-side state stored in localStorage under key `jmc-assessment-state-v1`.

## 6. Backend

### 6.1 New table

```sql
CREATE TABLE IF NOT EXISTS assessment_leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL,
  first_name    TEXT    NOT NULL,
  company       TEXT    NOT NULL,
  mode          TEXT    NOT NULL,    -- 'lite' or 'full'
  responses     TEXT    NOT NULL,    -- JSON: { questionId: score }
  scores        TEXT    NOT NULL,    -- JSON: { overall: { percent, answered }, categories: {...} }
  user_agent    TEXT    DEFAULT NULL,
  ip_hash       TEXT    DEFAULT NULL, -- sha256 of remote IP, for rate-limit & deduping
  resend_contact_id TEXT DEFAULT NULL, -- ID returned by Resend Audience push
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_assessment_leads_email ON assessment_leads(email);
CREATE INDEX IF NOT EXISTS idx_assessment_leads_created_at ON assessment_leads(created_at);
```

Returning emails are allowed — each submission creates a new row. The `email` column is non-unique; the `idx_assessment_leads_email` index lets us look up history by email for sales follow-up.

### 6.2 API endpoint

`POST /api/portal/public/assessments/submit`

Request:

```json
{
  "email": "sarah@acme.co",
  "firstName": "Sarah",
  "company": "Acme Co",
  "mode": "lite",                    // or "full"
  "responses": { "bs-01": 3, "bs-04": 2, ... },
  "website": ""                      // honeypot, must be empty
}
```

Server-side flow:

1. Validate inputs (email format, field presence, mode in {'lite','full'}, responses contains 1–5 ints).
2. Reject if honeypot `website` is non-empty (silent 200 with `{ ok: true }` to avoid telegraphing the trap).
3. Rate-limit by hashed IP: max 5 submissions per IP per hour (in-memory `Map`, sliding window). Returns 429 if exceeded.
4. Compute `scores` server-side (don't trust client). Re-uses existing `computeScores`-style logic adapted for response-map input.
5. Insert row into `assessment_leads`.
6. Push contact to Resend Audience via `resend.contacts.create({ email, firstName, audienceId })`. Store returned ID in row. Failure here is logged but non-fatal (don't fail the submit if Resend Audience fails).
7. Send thank-you email to prospect (template in §6.4).
8. Send internal lead notification to `contact@jmcsolutions.ai` (template in §6.5).
9. Return `200 { ok: true, leadId: <id>, scores: { ... } }` so the client can render the detailed results.

### 6.3 Public CORS

Add the public route to `server/index.js` _before_ the auth-gated routes; CORS config already allows `https://jmcsolutions.ai` and `https://www.jmcsolutions.ai` so no change there. The route is mounted as:

```js
app.use('/api/portal/public/assessments', publicAssessmentRoutes);
```

(no `requireAuth` middleware).

### 6.4 Prospect thank-you email

Subject: `Your AI Readiness results — JMC Solutions`

HTML body matches the styling pattern in `server/lib/notifyClient.js`:
- Logo header
- "Hi {{firstName}}," greeting
- "Thanks for taking the AI Readiness Assessment. Here's a quick summary:"
- Overall % + per-category bullet list
- "Want to discuss your results? **[Book a Discovery Call](https://jmcsolutions.ai/#contact)**"
- Footer: "JMC Solutions — AI Adoption & Delivery"

### 6.5 Internal lead notification

Subject: `New AI assessment lead — {{firstName}} from {{company}} ({{mode}})`

To: `contact@jmcsolutions.ai`
Reply-To: the prospect's email

Body:
- Lead contact info (name, company, email)
- Mode (lite / full)
- Overall % + per-category breakdown
- 3 lowest-scoring questions (with prompts) — these are the conversation hooks for sales
- Direct link to the lead row in the (future) admin UI: `https://jmcsolutions.ai/portal/admin/leads/{{id}}` — the link will 404 until that admin route is built; that's acceptable for now.

### 6.6 Resend Audience

- Add new env var: `RESEND_AUDIENCE_ID` (set on Railway). If not set, the audience push is skipped (logged warning).
- Resend SDK already in `package.json`.
- Push uses `resend.contacts.create({ email, firstName, lastName: '', unsubscribed: false, audienceId: process.env.RESEND_AUDIENCE_ID })`.

## 7. Question content

### 7.1 Schema additions

Each question in `data/ai_readiness_questions.json` may now optionally include:

- `web_prompt` (string) — overrides `prompt` when serving via the public web endpoint.
- `web_levels` (array of 5 strings) — overrides `levels` when serving via the public web endpoint.
- `web_category` (string) — overrides `category` when serving via the public web endpoint.
- `lite` (boolean) — `true` for the 10 lite questions, absent or `false` otherwise.

The portal continues to use `prompt` / `levels` / `category` as today; the portal `db.js` migration (`Sync questions from JSON on every startup`) is unaffected because it only reads those original fields.

### 7.2 Lite question selection (10)

Two per category, picked for **foundational signal value** (each question on its own gives a strong indicator of where the org sits):

| Category | Lite Q1 | Lite Q2 |
|----------|---------|---------|
| Business Strategy & Goals | `bs-01` AI in business strategy | `bs-04` Use cases identified |
| People & Culture | `oc-01` Cultural support for AI | `oc-06` Training availability |
| Data & Content Foundations | `df-01` Data organisation | `df-04` Access management |
| Governance & Risk | `gs-01` AI governance framework | `gs-05` Human review of AI outputs |
| Technology Readiness | `ti-02` Cloud infrastructure | `ti-05` System integrations |

Each of these gets `"lite": true` in the JSON. The 10-question lite quiz orders them by category (so the user sees breadth), 2 per category in sequence.

### 7.3 Microsoft / Copilot wording overrides

Eleven questions need web overrides. Category override applies to every question in `Technology & Microsoft 365 Readiness`.

| ID | `web_*` fields |
|----|----------------|
| All `ti-*` and `rp-*` | `web_category: "Technology Readiness"` |
| `bs-06` | `web_prompt: "How will you measure success from your AI investment?"` (drops "and Copilot") |
| `as-02` | `web_prompt: "To what extent do you currently use AI assistants (e.g. Copilot, Claude, ChatGPT) in daily work?"` |
| `as-03` | `web_levels` rewrites the level-3 string to "...using tools like Power Automate, Zapier, or similar." |
| `ti-01` | Full prompt + levels rewrite — _"Do your software licences and subscriptions include AI features (e.g. Copilot, ChatGPT Enterprise, Claude for Work)?"_ with levels reframed around "AI-enabled licences" generically. |
| `ti-04` | `web_prompt: "How well-integrated is your identity and access management across your business systems?"` (drops Entra/Azure AD parenthetical) |
| `ti-07` | `web_prompt: "How prepared is your meeting and collaboration platform (e.g. Teams, Zoom, Google Meet) to support AI features like meeting recaps and chat summaries?"` + level rewrites that drop "Teams" specifics. |
| `ti-08` | `web_prompt: "How well-adopted are your core productivity apps (documents, spreadsheets, presentations, email) across your organisation?"` + level rewrites that drop "Microsoft 365" specifics. |
| `rp-01` | `web_prompt: "Have you identified which teams or roles will be the first to adopt AI tools?"` + level rewrites that drop "Copilot" specifics. |
| `rp-02` | `web_prompt: "Do you have a plan for how you will train and support users during and after the AI rollout?"` + level rewrites. |
| `rp-03` | `web_prompt: "How will you track whether your AI tools are actually being used and adding value after launch?"` + level rewrites. |

(Exact level strings are written during implementation; following the existing voice: SME-friendly, level-1 = ad hoc / no plan, level-5 = mature & continuously optimised.)

### 7.4 Detailed results — per-category next steps (hardcoded copy)

Five short paragraphs, written once and rendered based on category. The wording is high-level and applicable regardless of score; the score-specific framing comes from §5.8 ("Where you are now" / "What level 4–5 looks like").

| Category | Next-step copy (1 sentence) |
|----------|---|
| Business Strategy & Goals | "Define 1–3 high-impact use cases tied to measurable business outcomes — that's the single highest-leverage move at any maturity level." |
| People & Culture | "Identify 3–5 internal AI champions across departments and equip them with structured training first; bottom-up adoption follows." |
| Data & Content Foundations | "Run a content lifecycle audit before any AI rollout — your AI assistant is only as good as the data it can reach and trust." |
| Governance & Risk | "Stand up a lightweight AI usage policy covering acceptable use, data handling, and human-review thresholds — even one page is enough to start." |
| Technology Readiness | "Pilot a single AI-enabled workflow with a small team before scaling — you'll surface integration and licensing gaps cheaply." |

## 8. Edge cases & non-functional

| Case | Handling |
|------|---------|
| User refreshes mid-quiz | localStorage restores answers + position |
| User completes lite, then takes full | Lite responses preserved (overlap with full); full quiz pre-fills the 10 lite answers; can still change them |
| Same email submits twice | New row created; both retained for sales context |
| Resend Audience push fails | Logged, lead still saved, both emails still sent. Audience contact ID column remains NULL. |
| Resend email send fails | Logged, lead still saved, response is still 200 (don't punish user). Internal monitoring needed; out of scope here. |
| Honeypot field non-empty | Silent 200, no DB write, no emails |
| Rate limit exceeded (5/IP/hr) | 429 with `{ error: "Too many submissions, please try again later." }` rendered inline |
| User on slow / spotty connection | Single submission; client retries once on network error then surfaces the error inline |
| Returning visitor (localStorage has prior detailed results) | Show intro state again — they can retake. We don't persist results client-side past one session. |
| Mobile (small screens) | Wizard cards are full-width; accordion sections stack; per-question level buttons collapse from horizontal row to vertical stack below 640 px. |
| Long category names | Truncate with `truncate` class on bars; full name tooltipped on hover. |
| Accessibility | All interactive controls keyboard-reachable; level selector uses radiogroup semantics; bars use ARIA `progressbar`. |

## 9. Build/deploy notes

- No new npm packages required. (`resend`, `react-router-dom`, `lucide-react` already installed; Audience contact API ships in the existing `resend@^3.0.0`.)
- Environment variable to add on Railway: `RESEND_AUDIENCE_ID`. The implementation gracefully degrades (logs warning + skips audience push) if missing.
- No Vercel changes required — existing `/api/portal/*` rewrite covers the new public route.
- `RESEND_API_KEY` already configured.

## 10. Out of scope / future work

- A `/portal/admin/leads` admin UI inside the existing portal so JMC sales can view, filter, and export captured leads. (Stub link only in v1.)
- PDF report generation.
- Cross-device resume via emailed magic link.
- A/B-testing different lite question selections.
- Per-industry tailored detailed-results copy.
