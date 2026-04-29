# Website AI Readiness Assessment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embedded homepage AI Readiness Assessment (lite + full) that captures leads (email + first name + company) into the existing portal SQLite DB and a Resend Audience.

**Architecture:** New React component tree (`src/components/assessment/*`) embedded inline in `src/JMCWebsite.jsx` between the Services & Approach section and the Governance & Security strip. New unauthenticated POST route on the existing portal Express server (`/api/portal/public/assessments/submit`) handles validation, scoring, DB persistence, Resend Audience push, and dual email notifications (prospect thank-you + JMC internal lead alert). Question content is platform-neutral on the web via optional `web_prompt` / `web_levels` / `web_category` overrides + a `lite: true` flag in `data/ai_readiness_questions.json`; portal continues using the originals.

**Tech Stack:** React 18, Vite, Tailwind, lucide-react, Express, sql.js (SQLite), Resend (emails + Audiences). No new npm packages needed.

**Spec:** `docs/superpowers/specs/2026-04-29-website-ai-assessment-design.md`

**Codebase note:** No automated test framework is in place (no jest/vitest, no test scripts in `package.json`). Plan uses targeted manual smoke tests + a simple Node sanity script for scoring instead of unit tests, matching the existing conventions in `scripts/validate-scoring.js`.

---

## Task 1: Extend questions JSON with `lite` flag + `web_*` overrides

**Files:**
- Modify: `data/ai_readiness_questions.json`

- [ ] **Step 1: Add `"lite": true` to the 10 lite questions**

For each of these question objects, add a `"lite": true` field (any position; conventional spot is right after `"order"`):

| ID | Category |
|---|---|
| `bs-01` | Business Strategy & Goals |
| `bs-04` | Business Strategy & Goals |
| `oc-01` | People & Culture |
| `oc-06` | People & Culture |
| `df-01` | Data & Content Foundations |
| `df-04` | Data & Content Foundations |
| `gs-01` | Governance & Risk |
| `gs-05` | Governance & Risk |
| `ti-02` | Technology & Microsoft 365 Readiness |
| `ti-05` | Technology & Microsoft 365 Readiness |

Example after edit (bs-01):
```json
{
  "id": "bs-01", "category": "Business Strategy & Goals", "order": 1, "lite": true,
  "prompt": "How clearly has your organisation defined AI as part of its overall business strategy?",
  "levels": [
    "AI hasn't been formally considered as part of business planning. There's limited awareness of how it could benefit the organisation.",
    ...
  ]
}
```

- [ ] **Step 2: Add `web_category: "Technology Readiness"` to all `ti-*` and `rp-*` questions**

That's questions `ti-01` through `ti-08` and `rp-01` through `rp-03` (11 questions). Add `"web_category": "Technology Readiness"` next to `"category"`.

- [ ] **Step 3: Add `web_prompt` overrides (no level changes) to these 5 questions**

| ID | Add `web_prompt` |
|----|-----|
| `bs-06` | `"How will you measure success from your AI investment?"` |
| `as-02` | `"To what extent do you currently use AI assistants (e.g. Copilot, Claude, ChatGPT) in daily work?"` |
| `ti-04` | `"How well-integrated is your identity and access management across your business systems?"` |
| `rp-02` | `"Do you have a plan for how you will train and support users during and after the AI rollout?"` |
| `rp-03` | `"How will you track whether your AI tools are actually being used and adding value after launch?"` |

- [ ] **Step 4: Add `web_prompt` + `web_levels` to `as-03` (level-3 wording adjustment)**

```json
"web_prompt": "How mature is your use of workflow automation?",
"web_levels": [
  "Little to no workflow automation is in place. Most processes are manual.",
  "Some basic automation exists (e.g. email rules, simple templates), but it's limited in scope.",
  "Structured workflow automation is in place for key processes, using tools like Power Automate, Zapier, or similar.",
  "Automation is widespread and well-managed, with a clear approach to identifying and automating repetitive tasks.",
  "Automation is a core capability. The organisation continuously identifies and implements automation opportunities, with strong governance."
]
```

- [ ] **Step 5: Add full `web_prompt` + `web_levels` rewrites to `ti-01`**

```json
"web_prompt": "Do your software licences and subscriptions include AI features (e.g. Copilot, ChatGPT Enterprise, Claude for Work)?",
"web_levels": [
  "No AI-enabled subscriptions are in place. There's no plan to evaluate them.",
  "There's awareness of what AI-enabled subscriptions are available, but current spend doesn't include them.",
  "The organisation has begun adopting AI-enabled subscriptions for key teams and use cases.",
  "AI-enabled subscriptions are deployed across the relevant parts of the organisation, with a plan to expand.",
  "Subscriptions are fully aligned with AI needs. The organisation regularly reviews and optimises its licence portfolio to support evolving AI initiatives."
]
```

- [ ] **Step 6: Add full `web_prompt` + `web_levels` rewrites to `ti-07`**

```json
"web_prompt": "How prepared is your meeting and collaboration platform (e.g. Teams, Zoom, Google Meet) to support AI features like meeting recaps and chat summaries?",
"web_levels": [
  "Meeting tools are not widely used, or meetings are not recorded. There's no foundation for AI meeting features.",
  "Meeting tools are used but recordings, transcriptions, and structured channels are inconsistent.",
  "Meeting tools are reasonably well-adopted. Meetings are often recorded and key channels are structured, providing a foundation for AI features.",
  "Meeting tools are well-adopted with consistent recording, transcription, and channel governance. The environment is ready for AI features.",
  "Meeting tools are deeply embedded in daily work with strong governance, structured channels, and consistent recording. AI features will deliver value immediately."
]
```

- [ ] **Step 7: Add full `web_prompt` + `web_levels` rewrites to `ti-08`**

```json
"web_prompt": "How well-adopted are your core productivity apps (documents, spreadsheets, presentations, email) across your organisation?",
"web_levels": [
  "Core productivity apps are not widely used. Staff primarily use other tools or work offline.",
  "Some teams use the apps, but adoption is inconsistent and many staff underuse them.",
  "Productivity apps are the standard for most work. Most staff use them regularly, though some features go unused.",
  "Productivity apps are well-adopted across the organisation, with staff comfortable using core features.",
  "The productivity stack is deeply embedded. Staff are proficient across the suite and actively use advanced features."
]
```

- [ ] **Step 8: Add full `web_prompt` + `web_levels` rewrites to `rp-01`**

```json
"web_prompt": "Have you identified which teams or roles will be the first to adopt AI tools?",
"web_levels": [
  "No thought has been given to who should adopt AI tools first.",
  "There's a general sense of who might benefit, but no formal prioritisation or plan.",
  "Priority teams or roles have been identified based on likely impact and readiness.",
  "A clear phased rollout plan exists, with first-wave teams selected, prepared, and supported.",
  "Rollout phases are well-defined, with success criteria for each wave and a plan to expand based on results."
]
```

- [ ] **Step 9: Run JSON syntax check**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/ai_readiness_questions.json','utf8')); console.log('OK', JSON.parse(require(\"fs\").readFileSync('data/ai_readiness_questions.json','utf8')).questions.length)"`
Expected: `OK 50`

- [ ] **Step 10: Commit**

```bash
git add data/ai_readiness_questions.json
git commit -m "feat(assessment): add lite flag + web overrides to questions JSON"
```

---

## Task 2: Add `assessment_leads` table migration

**Files:**
- Modify: `server/db.js` (add CREATE TABLE block; add to existing migrations section ~line 145, before the `client_users` table)

- [ ] **Step 1: Add the table creation SQL inside `initDb()` before the existing `client_users` block**

Insert this block between the `mfa_trusted_devices` table block and the `client_users` block in `server/db.js`:

```js
  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_leads (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL,
      first_name    TEXT    NOT NULL,
      company       TEXT    NOT NULL,
      mode          TEXT    NOT NULL,
      responses     TEXT    NOT NULL,
      scores        TEXT    NOT NULL,
      user_agent    TEXT    DEFAULT NULL,
      ip_hash       TEXT    DEFAULT NULL,
      resend_contact_id TEXT DEFAULT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_assessment_leads_email ON assessment_leads(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_assessment_leads_created_at ON assessment_leads(created_at)');
```

- [ ] **Step 2: Verify migration runs without error**

Run: `node -e "import('./server/db.js').then(async m => { await m.initDb(); console.log('OK'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })"`
Expected: prints `OK` (alongside other init logs).

- [ ] **Step 3: Verify the table exists**

Run: `node -e "import('./server/db.js').then(async m => { await m.initDb(); const r = m.queryAll(\"SELECT name FROM sqlite_master WHERE type='table' AND name='assessment_leads'\"); console.log(r); process.exit(0); })"`
Expected: `[ { name: 'assessment_leads' } ]`

- [ ] **Step 4: Commit**

```bash
git add server/db.js
git commit -m "feat(db): add assessment_leads table for website lead capture"
```

---

## Task 3: Create the public assessment route

**Files:**
- Create: `server/routes/publicAssessments.js`
- Modify: `server/index.js` (mount the route)

- [ ] **Step 1: Create `server/routes/publicAssessments.js`**

```js
/**
 * Public assessment route — receives submissions from the website's
 * AI Readiness Assessment (lite + full).
 * No auth required. Rate-limited per IP.
 */
import { Router } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { execute, queryAll } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// ── Load questions JSON once at module load ─────────────────────────────────
const QUESTIONS_PATH = path.join(__dirname, '..', '..', 'data', 'ai_readiness_questions.json');
const QUESTIONS = JSON.parse(fs.readFileSync(QUESTIONS_PATH, 'utf-8')).questions;
const QUESTIONS_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

// Web view of a question — uses overrides where present.
function webView(q) {
  return {
    id: q.id,
    category: q.web_category || q.category,
    order: q.order,
    lite: !!q.lite,
    prompt: q.web_prompt || q.prompt,
    levels: q.web_levels || q.levels,
  };
}

// ── Rate limit: 5 submissions per IP per hour (in-memory sliding window) ────
const rateLimitMap = new Map(); // ipHash -> array of timestamps (ms)
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ipHash) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const arr = (rateLimitMap.get(ipHash) || []).filter((t) => t > cutoff);
  if (arr.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ipHash, arr);
    return true;
  }
  arr.push(now);
  rateLimitMap.set(ipHash, arr);
  return false;
}

function hashIp(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

// ── Scoring (server-authoritative) ──────────────────────────────────────────
function computeScoresFromResponses(responses) {
  const byCategory = {};
  let totalScore = 0;
  let totalAnswered = 0;

  for (const [qid, score] of Object.entries(responses)) {
    const q = QUESTIONS_BY_ID[qid];
    if (!q) continue;
    const s = parseInt(score, 10);
    if (!Number.isInteger(s) || s < 1 || s > 5) continue;
    const cat = q.web_category || q.category;
    if (!byCategory[cat]) byCategory[cat] = { sum: 0, count: 0 };
    byCategory[cat].sum += s;
    byCategory[cat].count += 1;
    totalScore += s;
    totalAnswered += 1;
  }

  const categories = {};
  for (const [cat, d] of Object.entries(byCategory)) {
    categories[cat] = {
      percent: Math.round((d.sum / (d.count * 5)) * 100),
      answered: d.count,
      sum: d.sum,
    };
  }

  return {
    overall: totalAnswered > 0
      ? { percent: Math.round((totalScore / (totalAnswered * 5)) * 100), answered: totalAnswered }
      : null,
    categories,
  };
}

// ── GET /questions — public, returns web-view questions ─────────────────────
router.get('/questions', (_req, res) => {
  return res.json({ questions: QUESTIONS.map(webView) });
});

// ── POST /submit — capture a lead ──────────────────────────────────────────
router.post('/submit', async (req, res) => {
  const ipHash = hashIp(req);

  if (isRateLimited(ipHash)) {
    return res.status(429).json({ error: 'Too many submissions, please try again later.' });
  }

  const { email, firstName, company, mode, responses, website } = req.body || {};

  // Honeypot — silently accept and discard
  if (typeof website === 'string' && website.trim().length > 0) {
    return res.status(200).json({ ok: true, scores: { overall: null, categories: {} } });
  }

  // Validate
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required.' });
  }
  if (typeof firstName !== 'string' || firstName.trim().length === 0) {
    return res.status(400).json({ error: 'First name is required.' });
  }
  if (typeof company !== 'string' || company.trim().length === 0) {
    return res.status(400).json({ error: 'Company is required.' });
  }
  if (mode !== 'lite' && mode !== 'full') {
    return res.status(400).json({ error: 'Invalid mode.' });
  }
  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
    return res.status(400).json({ error: 'Responses are required.' });
  }
  // Each response must be {qid: score 1-5}
  for (const [qid, score] of Object.entries(responses)) {
    if (!QUESTIONS_BY_ID[qid]) return res.status(400).json({ error: `Unknown question: ${qid}` });
    const s = parseInt(score, 10);
    if (!Number.isInteger(s) || s < 1 || s > 5) {
      return res.status(400).json({ error: `Invalid score for ${qid}` });
    }
  }

  // Score authoritatively
  const scores = computeScoresFromResponses(responses);

  // Insert
  const cleanEmail = email.trim().toLowerCase();
  const cleanFirst = firstName.trim().slice(0, 100);
  const cleanCompany = company.trim().slice(0, 200);
  const userAgent = (req.headers['user-agent'] || '').slice(0, 300);

  const { lastInsertRowid: leadId } = execute(
    `INSERT INTO assessment_leads (email, first_name, company, mode, responses, scores, user_agent, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [cleanEmail, cleanFirst, cleanCompany, mode, JSON.stringify(responses), JSON.stringify(scores), userAgent, ipHash]
  );

  // Resend Audience push (best-effort; non-fatal)
  if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.contacts.create({
        email: cleanEmail,
        firstName: cleanFirst,
        unsubscribed: false,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      });
      const contactId = result?.data?.id || null;
      if (contactId) {
        execute('UPDATE assessment_leads SET resend_contact_id = ? WHERE id = ?', [contactId, leadId]);
      }
    } catch (e) {
      console.error('[public-assessments] Resend Audience push failed:', e?.message || e);
    }
  } else {
    console.log('[public-assessments] Resend Audience push skipped (RESEND_AUDIENCE_ID or RESEND_API_KEY missing)');
  }

  // Send the two emails (best-effort; non-fatal)
  await sendThankYouEmail({ email: cleanEmail, firstName: cleanFirst, scores }).catch((e) =>
    console.error('[public-assessments] Thank-you email failed:', e?.message || e)
  );
  await sendInternalLeadEmail({
    leadId,
    email: cleanEmail,
    firstName: cleanFirst,
    company: cleanCompany,
    mode,
    responses,
    scores,
  }).catch((e) =>
    console.error('[public-assessments] Internal lead email failed:', e?.message || e)
  );

  return res.status(200).json({ ok: true, leadId, scores });
});

// ── Email templates ─────────────────────────────────────────────────────────

const FROM_ADDRESS = process.env.PORTAL_FROM_EMAIL || 'contact@jmcsolutions.ai';
const INTERNAL_TO = process.env.ASSESSMENT_INTERNAL_TO || 'contact@jmcsolutions.ai';

function categoryRowsHtml(scores) {
  return Object.entries(scores.categories || {})
    .map(
      ([cat, d]) => `
        <tr>
          <td style="padding:8px 12px;color:#334155;font-size:14px;">${cat}</td>
          <td style="padding:8px 12px;color:#1e293b;font-weight:bold;font-size:14px;text-align:right;">${d.percent}%</td>
        </tr>`
    )
    .join('');
}

async function sendThankYouEmail({ email, firstName, scores }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[public-assessments] Would send thank-you email to ${email}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const overall = scores.overall?.percent ?? 0;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#334155;">
      <img src="https://jmcsolutions.ai/logo.png" alt="JMC Solutions" style="height:40px;margin-bottom:16px;" />
      <h2 style="color:#1e293b;margin-bottom:4px;">Your AI Readiness Snapshot</h2>
      <p style="color:#64748b;font-size:14px;margin-bottom:16px;">
        Hi ${firstName}, thanks for taking the AI Readiness Assessment. Here's your summary:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <div style="font-size:32px;font-weight:bold;color:#1e3a8a;margin-bottom:12px;">${overall}%</div>
        <table style="width:100%;border-collapse:collapse;">${categoryRowsHtml(scores)}</table>
      </div>
      <p style="color:#334155;font-size:14px;">
        Want to discuss how to move the needle on these scores? <a href="https://jmcsolutions.ai/#contact" style="color:#2563eb;text-decoration:none;font-weight:bold;">Book a Discovery Call →</a>
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 12px;" />
      <p style="color:#94a3b8;font-size:11px;">JMC Solutions — AI Adoption & Delivery</p>
    </div>
  `.trim();

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Your AI Readiness results — JMC Solutions',
    html,
  });
}

async function sendInternalLeadEmail({ leadId, email, firstName, company, mode, responses, scores }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[public-assessments] Would send internal lead email for ${email}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Pull 3 lowest-scoring questions for context
  const sorted = Object.entries(responses)
    .map(([qid, score]) => ({ qid, score: parseInt(score, 10), q: QUESTIONS_BY_ID[qid] }))
    .filter((r) => r.q)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const lowestHtml = sorted
    .map(
      (r) => `
        <li style="margin-bottom:8px;">
          <span style="display:inline-block;background:#fee2e2;color:#991b1b;font-weight:bold;border-radius:4px;padding:2px 6px;font-size:12px;margin-right:6px;">${r.score}/5</span>
          <span style="color:#1e293b;font-size:14px;">${r.q.web_prompt || r.q.prompt}</span>
        </li>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#334155;">
      <h2 style="color:#1e293b;margin:0 0 4px;">New AI assessment lead</h2>
      <p style="color:#64748b;font-size:13px;margin:0 0 16px;">Lead #${leadId} — ${mode} assessment</p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 4px;"><strong>Name:</strong> ${firstName}</p>
        <p style="margin:0 0 4px;"><strong>Company:</strong> ${company}</p>
        <p style="margin:0 0 4px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      </div>

      <h3 style="color:#1e293b;margin:0 0 8px;font-size:16px;">Scores</h3>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;"><strong>Overall: ${scores.overall?.percent ?? 0}%</strong> (${scores.overall?.answered ?? 0} questions)</p>
        <table style="width:100%;border-collapse:collapse;">${categoryRowsHtml(scores)}</table>
      </div>

      <h3 style="color:#1e293b;margin:0 0 8px;font-size:16px;">Conversation hooks (3 lowest-scored questions)</h3>
      <ul style="padding-left:20px;margin:0 0 16px;">${lowestHtml}</ul>

      <p style="color:#94a3b8;font-size:11px;margin-top:24px;">
        Reply directly to this email to reach the prospect.
      </p>
    </div>
  `.trim();

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: INTERNAL_TO,
    replyTo: email,
    subject: `New AI assessment lead — ${firstName} from ${company} (${mode})`,
    html,
  });
}

export default router;
```

- [ ] **Step 2: Mount the route in `server/index.js`**

Edit `server/index.js`. Add the import next to the other route imports:

```js
import publicAssessmentRoutes from './routes/publicAssessments.js';
```

Then mount the route — add this line in the routes section, _before_ the auth-gated routes (i.e., before `app.use('/api/portal/assessments', requireAuth, ...)`):

```js
app.use('/api/portal/public/assessments', publicAssessmentRoutes);
```

- [ ] **Step 3: Start the server and verify it boots**

Run: `node server/index.js &` (in a separate terminal, or run in background)
Wait 1 second, then: `curl -sS http://localhost:3001/api/portal/public/assessments/questions | head -c 500`
Expected: JSON starting with `{"questions":[{"id":"bs-01","category":"Business Strategy & Goals"...`
After verifying, kill the background server: `pkill -f 'node server/index.js'`

- [ ] **Step 4: Smoke-test a successful submission**

Start the server again in background, then run:

```bash
curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"smoke-test@example.com",
    "firstName":"Smoke",
    "company":"Test Co",
    "mode":"lite",
    "responses":{"bs-01":3,"bs-04":2,"oc-01":4,"oc-06":3,"df-01":3,"df-04":2,"gs-01":1,"gs-05":4,"ti-02":3,"ti-05":4}
  }'
```

Expected output: `{"ok":true,"leadId":1,"scores":{"overall":{"percent":58,...},"categories":{...}}}`

Then verify the row was inserted:

```bash
node -e "import('./server/db.js').then(async m => { await m.initDb(); const rows = m.queryAll('SELECT id, email, mode, scores FROM assessment_leads ORDER BY id DESC LIMIT 1'); console.log(JSON.stringify(rows[0], null, 2)); process.exit(0); })"
```

Expected: shows `email: smoke-test@example.com`, `mode: lite`, JSON-encoded scores.

Kill the server.

- [ ] **Step 5: Smoke-test rejection paths**

Start the server again. Test each:

```bash
# Bad email
curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
  -H 'Content-Type: application/json' \
  -d '{"email":"not-an-email","firstName":"X","company":"Y","mode":"lite","responses":{"bs-01":3}}'
# Expected: {"error":"Valid email is required."}

# Honeypot
curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
  -H 'Content-Type: application/json' \
  -d '{"email":"bot@x.com","firstName":"Bot","company":"X","mode":"lite","responses":{"bs-01":3},"website":"http://spam"}'
# Expected: {"ok":true,"scores":{"overall":null,"categories":{}}}

# Bad mode
curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
  -H 'Content-Type: application/json' \
  -d '{"email":"x@y.co","firstName":"X","company":"Y","mode":"weird","responses":{"bs-01":3}}'
# Expected: {"error":"Invalid mode."}

# Out-of-range score
curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
  -H 'Content-Type: application/json' \
  -d '{"email":"x@y.co","firstName":"X","company":"Y","mode":"lite","responses":{"bs-01":9}}'
# Expected: {"error":"Invalid score for bs-01"}
```

Kill the server.

- [ ] **Step 6: Commit**

```bash
git add server/routes/publicAssessments.js server/index.js
git commit -m "feat(api): add public assessment submission route"
```

---

## Task 4: Frontend scoring + API helpers

**Files:**
- Create: `src/components/assessment/scoring.js`
- Create: `src/components/assessment/webApi.js`
- Create: `src/components/assessment/storage.js`

- [ ] **Step 1: Create `src/components/assessment/scoring.js`**

```js
/**
 * Client-side scoring for the website AI assessment.
 * Mirrors the server logic in server/routes/publicAssessments.js.
 */

export function computeScores(responses, questions) {
  const byCategory = {};
  let totalScore = 0;
  let totalAnswered = 0;

  for (const q of questions) {
    const score = responses[q.id];
    if (score == null) continue;
    const s = parseInt(score, 10);
    if (!Number.isInteger(s) || s < 1 || s > 5) continue;
    const cat = q.category;
    if (!byCategory[cat]) byCategory[cat] = { sum: 0, count: 0 };
    byCategory[cat].sum += s;
    byCategory[cat].count += 1;
    totalScore += s;
    totalAnswered += 1;
  }

  const categories = {};
  for (const [cat, d] of Object.entries(byCategory)) {
    categories[cat] = {
      percent: Math.round((d.sum / (d.count * 5)) * 100),
      answered: d.count,
    };
  }

  return {
    overall: totalAnswered > 0
      ? { percent: Math.round((totalScore / (totalAnswered * 5)) * 100), answered: totalAnswered }
      : null,
    categories,
  };
}

export function categoryColorClass(percent) {
  if (percent >= 70) return 'bg-emerald-600';
  if (percent >= 40) return 'bg-blue-600';
  return 'bg-amber-500';
}

export function categoryLabel(percent) {
  if (percent >= 70) return 'Strong foundations';
  if (percent >= 40) return 'Building';
  return 'Early days';
}
```

- [ ] **Step 2: Create `src/components/assessment/webApi.js`**

```js
/**
 * Fetch wrappers for the public assessment endpoints.
 * Routes through the existing /api/portal/* Vercel rewrite to the Railway server.
 */

const BASE = '/api/portal/public/assessments';

export async function fetchQuestions() {
  const res = await fetch(`${BASE}/questions`);
  if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);
  const data = await res.json();
  return data.questions;
}

export async function submitAssessment({ email, firstName, company, mode, responses, website }) {
  const res = await fetch(`${BASE}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, firstName, company, mode, responses, website: website || '' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Submission failed (${res.status})`);
  }
  return data;
}
```

- [ ] **Step 3: Create `src/components/assessment/storage.js`**

```js
/**
 * localStorage wrapper for in-progress assessment state.
 * Stores { mode, responses, currentIndex } under a versioned key.
 * Cleared after successful submission.
 */

const KEY = 'jmc-assessment-state-v1';

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/assessment/scoring.js src/components/assessment/webApi.js src/components/assessment/storage.js
git commit -m "feat(assessment): add client-side scoring, API, and storage helpers"
```

---

## Task 5: Build the LiteWizard component

**Files:**
- Create: `src/components/assessment/LiteWizard.jsx`

- [ ] **Step 1: Create the component**

```jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function LiteWizard({ liteQuestions, responses, onChange, onComplete, onBack }) {
  const ordered = useMemo(() => {
    // Group by category, then take 2 per category preserving JSON order
    const byCat = {};
    for (const q of liteQuestions) {
      if (!byCat[q.category]) byCat[q.category] = [];
      byCat[q.category].push(q);
    }
    const flat = [];
    for (const cat of Object.keys(byCat)) {
      flat.push(...byCat[cat]);
    }
    return flat;
  }, [liteQuestions]);

  const [index, setIndex] = useState(() => {
    // Resume to first unanswered, or 0
    const firstUnansweredIdx = ordered.findIndex((q) => responses[q.id] == null);
    return firstUnansweredIdx === -1 ? Math.max(0, ordered.length - 1) : firstUnansweredIdx;
  });

  const current = ordered[index];
  const total = ordered.length;
  const answeredCount = ordered.filter((q) => responses[q.id] != null).length;
  const progressPercent = Math.round((answeredCount / total) * 100);

  const select = (score) => {
    onChange(current.id, score);
    if (index < total - 1) {
      setTimeout(() => setIndex((i) => i + 1), 220);
    }
  };

  const allAnswered = ordered.every((q) => responses[q.id] != null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Question {index + 1} of {total}
          </span>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            ← Cancel
          </button>
        </div>
        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category eyebrow */}
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        {current.category}
      </div>

      {/* Prompt */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 leading-snug">
        {current.prompt}
      </h3>

      {/* Level selector */}
      <div role="radiogroup" aria-label="Select level" className="space-y-3 mb-6">
        {current.levels.map((levelText, i) => {
          const value = i + 1;
          const isSelected = responses[current.id] === value;
          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              onClick={() => select(value)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {value}
              </div>
              <span className={`text-sm leading-relaxed ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                {levelText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {index < total - 1 ? (
          <button
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={responses[current.id] == null}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-5 py-2 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            See my results →
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/assessment/LiteWizard.jsx
git commit -m "feat(assessment): add lite wizard component"
```

---

## Task 6: Build the FullAccordion component

**Files:**
- Create: `src/components/assessment/FullAccordion.jsx`

- [ ] **Step 1: Create the component**

```jsx
import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export default function FullAccordion({ questions, responses, onChange, onComplete, onBack }) {
  const categories = [];
  const seen = new Set();
  for (const q of questions) {
    if (!seen.has(q.category)) {
      seen.add(q.category);
      categories.push(q.category);
    }
  }
  const byCategory = Object.fromEntries(categories.map((c) => [c, questions.filter((q) => q.category === c)]));

  const [expanded, setExpanded] = useState(() => new Set([categories[0]]));
  const [hoverLevel, setHoverLevel] = useState({});

  const toggle = (cat) => {
    const next = new Set(expanded);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpanded(next);
  };

  const totalAnswered = questions.filter((q) => responses[q.id] != null).length;
  const total = questions.length;
  const allAnswered = totalAnswered === total;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Cancel
        </button>
        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
          Full Assessment — {totalAnswered} of {total} answered
        </div>
      </div>

      {categories.map((cat) => {
        const qs = byCategory[cat];
        const catAnswered = qs.filter((q) => responses[q.id] != null).length;
        const isComplete = catAnswered === qs.length;
        const isExpanded = expanded.has(cat);
        return (
          <div
            key={cat}
            className={`mb-3 rounded-xl border bg-white shadow-sm transition-all ${
              isComplete ? 'border-emerald-300' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => toggle(cat)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
                <h4 className="text-lg font-bold text-slate-900">{cat}</h4>
                <span className="text-xs font-semibold text-slate-500">
                  {catAnswered} / {qs.length}
                </span>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">
                {qs.map((q) => {
                  const selected = responses[q.id];
                  const hovered = hoverLevel[q.id];
                  const showLevelText = hovered != null ? hovered : selected;
                  return (
                    <div key={q.id} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900 mb-3">{q.prompt}</p>
                      <div role="radiogroup" aria-label={q.prompt} className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((v) => {
                          const isSel = selected === v;
                          return (
                            <button
                              key={v}
                              role="radio"
                              aria-checked={isSel}
                              onClick={() => onChange(q.id, v)}
                              onMouseEnter={() => setHoverLevel((s) => ({ ...s, [q.id]: v }))}
                              onMouseLeave={() => setHoverLevel((s) => ({ ...s, [q.id]: null }))}
                              className={`flex-1 sm:flex-none sm:w-12 h-12 rounded-lg font-bold text-sm border-2 transition-all ${
                                isSel
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                              }`}
                            >
                              {v}
                            </button>
                          );
                        })}
                      </div>
                      {showLevelText && (
                        <p className="text-xs text-slate-500 leading-relaxed mt-2 italic">
                          {q.levels[showLevelText - 1]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Sticky footer CTA */}
      <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
        <div className="max-w-4xl mx-auto bg-blue-900 text-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold opacity-80 uppercase tracking-wider">Progress</div>
            <div className="text-base font-bold">
              {totalAnswered} of {total} questions answered
            </div>
          </div>
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-5 py-2 rounded-lg bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            See my results →
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/assessment/FullAccordion.jsx
git commit -m "feat(assessment): add full accordion component"
```

---

## Task 7: Build BasicResults + EmailGate components

**Files:**
- Create: `src/components/assessment/BasicResults.jsx`
- Create: `src/components/assessment/EmailGate.jsx`

- [ ] **Step 1: Create `BasicResults.jsx`**

```jsx
import React from 'react';
import { categoryColorClass, categoryLabel } from './scoring';

export default function BasicResults({ scores, mode }) {
  const overall = scores.overall?.percent ?? 0;
  const categories = scores.categories || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
          {mode === 'lite' ? 'Lite Snapshot' : 'Full Assessment'}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Your AI Readiness Snapshot</h3>
        <div className="text-6xl font-bold text-blue-900 leading-none">{overall}%</div>
        <p className="text-sm text-slate-500 mt-2">Overall readiness across {scores.overall?.answered ?? 0} questions</p>
      </div>

      <div className="space-y-4">
        {Object.entries(categories).map(([cat, d]) => (
          <div key={cat}>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-sm font-bold text-slate-900 truncate pr-3">{cat}</div>
              <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{d.percent}%</div>
            </div>
            <div
              className="h-3 bg-slate-100 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={d.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${cat} readiness`}
            >
              <div
                className={`h-full ${categoryColorClass(d.percent)} transition-all duration-700`}
                style={{ width: `${d.percent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">{categoryLabel(d.percent)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `EmailGate.jsx`**

```jsx
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function EmailGate({ onSubmit, submitting, errorMessage }) {
  const [firstName, setFirstName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = firstName.trim() && company.trim() && isValidEmail && !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ firstName: firstName.trim(), company: company.trim(), email: email.trim(), website });
  };

  return (
    <div className="bg-white rounded-xl border-l-4 border-blue-900 border-r border-t border-b border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto mt-6">
      <h4 className="text-xl font-bold text-slate-900 mb-2">Unlock your detailed analysis</h4>
      <p className="text-sm text-slate-600 mb-5">
        We'll send you a copy and our team will personally review your results to suggest specific next steps.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="ag-fn" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              First name
            </label>
            <input
              id="ag-fn"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ag-co" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              id="ag-co"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label htmlFor="ag-em" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Work email
            </label>
            <input
              id="ag-em"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Honeypot — hidden from real users */}
        <div style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="ag-hp">Website</label>
          <input
            id="ag-hp"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {errorMessage && (
          <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? 'Submitting…' : 'See my detailed analysis'}
        </button>

        <p className="text-xs text-slate-400 mt-3">
          By submitting you agree to receive your results and occasional follow-ups from JMC Solutions. You can unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/assessment/BasicResults.jsx src/components/assessment/EmailGate.jsx
git commit -m "feat(assessment): add basic results and email gate components"
```

---

## Task 8: Build DetailedResults + AssessmentIntro components

**Files:**
- Create: `src/components/assessment/AssessmentIntro.jsx`
- Create: `src/components/assessment/DetailedResults.jsx`

- [ ] **Step 1: Create `AssessmentIntro.jsx`**

```jsx
import React from 'react';
import { Sparkles, Clock, BarChart3 } from 'lucide-react';

export default function AssessmentIntro({ onStartLite, onStartFull }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-900 mb-4">
            <Sparkles size={26} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            5 minutes. 5 dimensions. Real insight.
          </h3>
          <p className="text-base text-slate-600">
            Take the lite check below and get an instant readiness snapshot. Want a deeper picture?{' '}
            <button
              onClick={onStartFull}
              className="text-blue-700 hover:text-blue-900 font-bold underline-offset-4 hover:underline"
            >
              Got 15 minutes? Take the full assessment instead →
            </button>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-7">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <Clock size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">5 min</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <BarChart3 size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">10 questions</div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 mb-1">
              <Sparkles size={18} />
            </div>
            <div className="text-xs font-bold text-slate-700">Free results</div>
          </div>
        </div>

        <button
          onClick={onStartLite}
          className="w-full sm:w-auto sm:mx-auto sm:flex px-8 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors mx-auto items-center justify-center"
        >
          Start the lite check →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `DetailedResults.jsx`**

```jsx
import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { categoryColorClass } from './scoring';

// First lite question per category — used as the "representative" question for the level descriptions.
const REPRESENTATIVE_QUESTION_ID = {
  'Business Strategy & Goals': 'bs-01',
  'People & Culture': 'oc-01',
  'Data & Content Foundations': 'df-01',
  'Governance & Risk': 'gs-01',
  'Technology Readiness': 'ti-02',
  'Technology & Microsoft 365 Readiness': 'ti-02', // fallback if portal-style category present
};

const NEXT_STEPS = {
  'Business Strategy & Goals':
    "Define 1–3 high-impact use cases tied to measurable business outcomes — that's the single highest-leverage move at any maturity level.",
  'People & Culture':
    'Identify 3–5 internal AI champions across departments and equip them with structured training first; bottom-up adoption follows.',
  'Data & Content Foundations':
    'Run a content lifecycle audit before any AI rollout — your AI assistant is only as good as the data it can reach and trust.',
  'Governance & Risk':
    'Stand up a lightweight AI usage policy covering acceptable use, data handling, and human-review thresholds — even one page is enough to start.',
  'Technology Readiness':
    "Pilot a single AI-enabled workflow with a small team before scaling — you'll surface integration and licensing gaps cheaply.",
  'Technology & Microsoft 365 Readiness':
    "Pilot a single AI-enabled workflow with a small team before scaling — you'll surface integration and licensing gaps cheaply.",
};

export default function DetailedResults({ scores, questions, mode, email, onTakeFull, onRestart, onBookCall }) {
  const [expanded, setExpanded] = useState(() => new Set(Object.keys(scores.categories || {})));
  const toggle = (cat) => {
    const next = new Set(expanded);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpanded(next);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
        <strong>Detailed analysis below</strong> — a copy is on its way to <span className="font-mono">{email}</span>.
      </div>

      {mode === 'lite' && (
        <div className="bg-blue-900 text-white rounded-xl p-6 sm:p-8">
          <h4 className="text-xl font-bold mb-2">Want the full picture?</h4>
          <p className="text-sm text-blue-100 mb-4">
            You answered 10 questions across 5 areas. Take the full 50-question assessment for a deeper, more accurate snapshot.
          </p>
          <button
            onClick={onTakeFull}
            className="px-5 py-2.5 rounded-lg bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Take the full assessment <ArrowRight size={16} />
          </button>
        </div>
      )}

      {Object.entries(scores.categories || {}).map(([cat, d]) => {
        const repId = REPRESENTATIVE_QUESTION_ID[cat];
        const repQ = questions.find((q) => q.id === repId);
        const avgScore = Math.round((d.sum != null ? d.sum / d.answered : (d.percent / 100) * 5));
        const currentLevelText = repQ?.levels?.[Math.min(4, Math.max(0, avgScore - 1))];
        const goodLevelText = repQ?.levels?.[4];
        const isExpanded = expanded.has(cat);
        const nextStep = NEXT_STEPS[cat] || '';
        return (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <div className="flex-1 mr-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-lg font-bold text-slate-900">{cat}</h4>
                  <span className="text-lg font-bold text-slate-900">{d.percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColorClass(d.percent)}`}
                    style={{ width: `${d.percent}%` }}
                  />
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                {currentLevelText && (
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Where you are now</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{currentLevelText}</p>
                  </div>
                )}
                {goodLevelText && (
                  <div>
                    <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">What good looks like</div>
                    <p className="text-sm text-slate-700 leading-relaxed">{goodLevelText}</p>
                  </div>
                )}
                {nextStep && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Suggested next step</div>
                    <p className="text-sm text-amber-900 leading-relaxed">{nextStep}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-white border-2 border-blue-900 rounded-xl p-6 sm:p-8 text-center">
        <h4 className="text-xl font-bold text-slate-900 mb-2">Want personalised guidance?</h4>
        <p className="text-sm text-slate-600 mb-4">
          Our team will review your results and walk you through specific recommendations on a free 30-minute Discovery Call.
        </p>
        <button
          onClick={onBookCall}
          className="px-6 py-3 rounded-lg bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
        >
          Book a Discovery Call <ArrowRight size={16} />
        </button>
      </div>

      <div className="text-center pt-2">
        <button onClick={onRestart} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
          Restart assessment
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/assessment/AssessmentIntro.jsx src/components/assessment/DetailedResults.jsx
git commit -m "feat(assessment): add intro and detailed results components"
```

---

## Task 9: Build the AIAssessment orchestrator

**Files:**
- Create: `src/components/assessment/AIAssessment.jsx`

- [ ] **Step 1: Create the orchestrator**

```jsx
import React, { useEffect, useReducer, useMemo } from 'react';
import AssessmentIntro from './AssessmentIntro';
import LiteWizard from './LiteWizard';
import FullAccordion from './FullAccordion';
import BasicResults from './BasicResults';
import EmailGate from './EmailGate';
import DetailedResults from './DetailedResults';
import { computeScores } from './scoring';
import { fetchQuestions, submitAssessment } from './webApi';
import { loadDraft, saveDraft, clearDraft } from './storage';

const STATES = {
  INTRO: 'intro',
  LITE: 'lite',
  FULL: 'full',
  BASIC_RESULTS: 'basic_results',
  DETAILED_RESULTS: 'detailed_results',
};

const initialState = {
  state: STATES.INTRO,
  responses: {},
  mode: null,        // 'lite' | 'full'
  submitting: false,
  errorMessage: null,
  serverScores: null,
  email: '',
};

function reducer(s, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...s, ...action.payload };
    case 'START_LITE':
      return { ...s, state: STATES.LITE, mode: 'lite' };
    case 'START_FULL':
      return { ...s, state: STATES.FULL, mode: 'full' };
    case 'ANSWER':
      return { ...s, responses: { ...s.responses, [action.qid]: action.score } };
    case 'SHOW_BASIC':
      return { ...s, state: STATES.BASIC_RESULTS };
    case 'SUBMITTING':
      return { ...s, submitting: true, errorMessage: null };
    case 'SUBMIT_ERROR':
      return { ...s, submitting: false, errorMessage: action.message };
    case 'SUBMIT_SUCCESS':
      return {
        ...s,
        submitting: false,
        state: STATES.DETAILED_RESULTS,
        serverScores: action.scores,
        email: action.email,
      };
    case 'UPGRADE_TO_FULL':
      // Keep responses; switch mode to full and re-enter accordion. Email already captured.
      return { ...s, state: STATES.FULL, mode: 'full' };
    case 'RESTART':
      return { ...initialState };
    default:
      return s;
  }
}

export default function AIAssessment() {
  const [questions, setQuestions] = React.useState([]);
  const [loadError, setLoadError] = React.useState(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load questions once
  useEffect(() => {
    fetchQuestions()
      .then((qs) => setQuestions(qs))
      .catch((e) => setLoadError(e.message));
  }, []);

  // Hydrate draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.responses && (draft.mode === 'lite' || draft.mode === 'full')) {
      dispatch({
        type: 'HYDRATE',
        payload: {
          responses: draft.responses,
          mode: draft.mode,
          state: draft.state || (draft.mode === 'lite' ? STATES.LITE : STATES.FULL),
        },
      });
    }
  }, []);

  // Save draft when responses or mode change (only during quiz states)
  useEffect(() => {
    if (state.state === STATES.LITE || state.state === STATES.FULL) {
      saveDraft({ responses: state.responses, mode: state.mode, state: state.state });
    }
  }, [state.responses, state.mode, state.state]);

  const liteQuestions = useMemo(() => questions.filter((q) => q.lite), [questions]);

  const liteScoresLive = useMemo(
    () => computeScores(state.responses, liteQuestions),
    [state.responses, liteQuestions]
  );
  const fullScoresLive = useMemo(
    () => computeScores(state.responses, questions),
    [state.responses, questions]
  );

  const onAnswer = (qid, score) => dispatch({ type: 'ANSWER', qid, score });

  const onCompleteQuiz = () => dispatch({ type: 'SHOW_BASIC' });

  const onSubmit = async ({ firstName, company, email, website }) => {
    dispatch({ type: 'SUBMITTING' });
    try {
      const filtered = state.mode === 'lite'
        ? Object.fromEntries(Object.entries(state.responses).filter(([qid]) => liteQuestions.some((q) => q.id === qid)))
        : state.responses;
      const result = await submitAssessment({
        email,
        firstName,
        company,
        mode: state.mode,
        responses: filtered,
        website,
      });
      clearDraft();
      dispatch({ type: 'SUBMIT_SUCCESS', scores: result.scores, email });
    } catch (e) {
      dispatch({ type: 'SUBMIT_ERROR', message: e.message || 'Something went wrong. Please try again.' });
    }
  };

  const onUpgradeToFull = () => dispatch({ type: 'UPGRADE_TO_FULL' });
  const onRestart = () => {
    clearDraft();
    dispatch({ type: 'RESTART' });
  };
  const onBookCall = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  const onCancel = () => dispatch({ type: 'RESTART' });

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-slate-500">
        Couldn't load the assessment right now. Please try again later.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  switch (state.state) {
    case STATES.INTRO:
      return (
        <AssessmentIntro
          onStartLite={() => dispatch({ type: 'START_LITE' })}
          onStartFull={() => dispatch({ type: 'START_FULL' })}
        />
      );
    case STATES.LITE:
      return (
        <LiteWizard
          liteQuestions={liteQuestions}
          responses={state.responses}
          onChange={onAnswer}
          onComplete={onCompleteQuiz}
          onBack={onCancel}
        />
      );
    case STATES.FULL:
      return (
        <FullAccordion
          questions={questions}
          responses={state.responses}
          onChange={onAnswer}
          onComplete={onCompleteQuiz}
          onBack={onCancel}
        />
      );
    case STATES.BASIC_RESULTS: {
      const liveScores = state.mode === 'lite' ? liteScoresLive : fullScoresLive;
      return (
        <div className="space-y-2">
          <BasicResults scores={liveScores} mode={state.mode} />
          <EmailGate
            onSubmit={onSubmit}
            submitting={state.submitting}
            errorMessage={state.errorMessage}
          />
        </div>
      );
    }
    case STATES.DETAILED_RESULTS:
      return (
        <DetailedResults
          scores={state.serverScores || {}}
          questions={questions}
          mode={state.mode}
          email={state.email}
          onTakeFull={onUpgradeToFull}
          onRestart={onRestart}
          onBookCall={onBookCall}
        />
      );
    default:
      return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/assessment/AIAssessment.jsx
git commit -m "feat(assessment): add orchestrator state machine"
```

---

## Task 10: Wire `<AIAssessment />` into the homepage

**Files:**
- Modify: `src/JMCWebsite.jsx`

- [ ] **Step 1: Add import near the top of the file (after the existing `lucide-react` import block)**

Find the line that imports the platform logos (`import claudeLogo from './assets/claude-ai-icon.png';` etc., around line 46) and add this immediately after:

```jsx
import AIAssessment from './components/assessment/AIAssessment';
```

- [ ] **Step 2: Insert the new section between Services & Approach and Governance & Security**

Find the closing `</section>` of the `id="approach"` section (currently around line 1843, the line that reads `</section>` followed by the comment `{/* Governance & Security (Moved Here) */}`). Insert this new section _before_ the Governance & Security section's opening tag:

```jsx
          {/* AI Readiness Assessment */}
          <section id="assessment" className="py-16 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-6">
              <Reveal className="text-center max-w-3xl mx-auto mb-10">
                <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">
                  AI Readiness Assessment
                </h2>
                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  How AI-Ready Is Your Business?
                </h3>
                <p className="text-lg text-slate-600">
                  Get a free, immediate snapshot of where you sit across 5 readiness dimensions. Take the 5-minute lite check or go deeper with the full 15-minute assessment.
                </p>
              </Reveal>
              <Reveal>
                <AIAssessment />
              </Reveal>
            </div>
          </section>
```

- [ ] **Step 3: Add an "Assessment" link to the desktop nav menu**

Find the nav items array (around line 1108, the array containing `{ name: 'Services & Approach', id: 'approach' }`). Insert a new entry after the "Services & Approach" item — both occurrences (desktop nav around line 1108 and mobile nav around line 1149):

```jsx
              { name: 'Assessment', id: 'assessment' },
```

- [ ] **Step 4: Verify the dev server still builds**

Run: `npm run build`
Expected: build succeeds, ends with "✓ built in ..."

- [ ] **Step 5: Commit**

```bash
git add src/JMCWebsite.jsx
git commit -m "feat(home): embed AI Readiness Assessment section"
```

---

## Task 11: Manual end-to-end smoke test

**Files:** none (manual verification)

- [ ] **Step 1: Start the portal server in background and the Vite dev server**

```bash
node server/index.js &
sleep 1
npm run dev &
```

Note both PIDs printed.

- [ ] **Step 2: Open http://localhost:5173 in a browser**

Walk the lite flow:

1. Scroll to the new "AI Readiness Assessment" section.
2. Confirm the intro card is visible. Click "Start the lite check".
3. Wizard should advance through 10 questions, 2 from each of 5 categories. Confirm category names show "Technology Readiness" (not "Technology & Microsoft 365 Readiness") for the ti-* questions.
4. Confirm the prompt for `ti-02` reads as in the original (no MS specifics needed there) and that none of the lite questions reference Copilot/M365.
5. Refresh the page mid-quiz — confirm answers and position are restored.
6. Complete all 10. Click "See my results".
7. Confirm basic results render: overall %, 5 per-category bars, "Strong / Building / Early days" labels.
8. Submit the email gate with first name, company, email. Use the `+test` form (e.g. `your+assessment-test@example.com`).
9. Confirm transition to detailed results: 5 expandable cards with current/good/next-step text, an "upsell to full" card, a Discovery Call CTA.
10. Confirm in the portal server logs that the thank-you email and internal lead email were "Sent" (or "Would send" if `RESEND_API_KEY` not set).
11. Confirm the DB has the new row:
    ```bash
    node -e "import('./server/db.js').then(async m => { await m.initDb(); const rows = m.queryAll('SELECT id, email, mode, scores FROM assessment_leads ORDER BY id DESC LIMIT 1'); console.log(JSON.stringify(rows[0], null, 2)); process.exit(0); })"
    ```

- [ ] **Step 3: Walk the upgrade-to-full flow**

1. From the detailed results, click "Take the full assessment".
2. Confirm full accordion appears, with the 10 lite answers pre-filled (open Business Strategy section, the 2 lite questions there should have selected values).
3. Answer the remaining 40 questions (or use the browser console to bulk-set: `localStorage.setItem('jmc-assessment-state-v1', JSON.stringify({mode:'full', state:'full', responses: Object.fromEntries(Array.from({length:50}, (_, i) => [['bs-01','bs-02','bs-03','bs-04','bs-05','bs-06','bs-07','bs-08','oc-01','oc-02','oc-03','oc-04','oc-05','oc-06','oc-07','oc-08','as-01','as-02','as-03','as-04','as-05','as-06','df-01','df-02','df-03','df-04','df-05','df-06','df-07','df-08','df-09','gs-01','gs-02','gs-03','gs-04','gs-05','gs-06','gs-07','gs-08','ti-01','ti-02','ti-03','ti-04','ti-05','ti-06','ti-07','ti-08','rp-01','rp-02','rp-03'][i], 3]))})); location.reload();` — this seeds all 50 to score 3.
4. Click "See my results".
5. Confirm basic results again, submit email (you can reuse the test email).
6. Confirm a second row was created in the DB (returning emails are allowed — both rows retained).

- [ ] **Step 4: Test honeypot / spam path**

In the browser dev console while on the email gate state:

```js
document.getElementById('ag-hp').value = 'http://spam.example';
```

Then click submit. Confirm the page transitions to detailed results but no DB write occurred (server logs will be silent for this submission).

- [ ] **Step 5: Test rate limiting**

In a terminal, hit the submit endpoint 6 times quickly:

```bash
for i in 1 2 3 4 5 6; do
  curl -sS -X POST http://localhost:3001/api/portal/public/assessments/submit \
    -H 'Content-Type: application/json' \
    -d '{"email":"rate@test.co","firstName":"R","company":"T","mode":"lite","responses":{"bs-01":3,"bs-04":3,"oc-01":3,"oc-06":3,"df-01":3,"df-04":3,"gs-01":3,"gs-05":3,"ti-02":3,"ti-05":3}}'
  echo
done
```

Expected: first 5 succeed with `{"ok":true,...}`, the 6th returns `{"error":"Too many submissions, please try again later."}`.

- [ ] **Step 6: Stop dev servers**

```bash
pkill -f 'node server/index.js'
pkill -f 'vite'
```

- [ ] **Step 7: No commit needed for this task — it's verification only**

---

## Task 12: Production build verification

- [ ] **Step 1: Run a clean production build**

```bash
npm run build
```

Expected: build completes without errors. Final output mentions `dist/` size and assets.

- [ ] **Step 2: Run preview to ensure the static bundle works**

```bash
npm run preview &
sleep 2
```

Open http://localhost:4173 and confirm the assessment section renders intro state. Then stop preview: `pkill -f 'vite preview'`.

(API submission won't work against `vite preview` alone — the rewrite to Railway only applies in production / Vercel. That's expected.)

- [ ] **Step 3: Final commit (if `dist/` or any files changed)**

If `git status` shows changes, run `git status` to inspect; otherwise no commit needed.

---

## Task 13: Document the new env var

**Files:**
- Modify: `server/index.js` (header doc comment)

- [ ] **Step 1: Update the env-var list in the docstring**

Find the docstring at the top of `server/index.js` that lists env vars (currently mentions `PORTAL_JWT_SECRET`, `PORTAL_ADMIN_KEY`, `PORTAL_DB_PATH`, `PORTAL_PORT`). Add three lines:

```js
 *   PORTAL_FROM_EMAIL  — Default From: address for outbound email (default: contact@jmcsolutions.ai)
 *   ASSESSMENT_INTERNAL_TO — Recipient address for internal lead notifications (default: contact@jmcsolutions.ai)
 *   RESEND_AUDIENCE_ID — Resend Audience ID for the assessment mailing list (optional; pushes skipped if unset)
```

- [ ] **Step 2: Commit**

```bash
git add server/index.js
git commit -m "docs(server): document RESEND_AUDIENCE_ID and email env vars"
```

---

## Self-review checklist

After all tasks complete, the implementer should verify:

- [ ] All 50 questions in `data/ai_readiness_questions.json` still parse as JSON. The 10 lite questions have `"lite": true`. All 11 `ti-*`/`rp-*` questions have `"web_category": "Technology Readiness"`. The 8 questions needing wording rewrites (`bs-06`, `as-02`, `as-03`, `ti-01`, `ti-04`, `ti-07`, `ti-08`, `rp-01`, `rp-02`, `rp-03`) have appropriate `web_prompt` and `web_levels`.
- [ ] Server route `/api/portal/public/assessments/questions` returns 50 questions, each with web-view fields (overrides applied).
- [ ] Server route `/api/portal/public/assessments/submit` returns 200 with scores on valid input, 400 on invalid, 429 on rate-limit, and 200-with-empty on honeypot.
- [ ] Portal admin UI is unaffected — `/api/portal/assessments` still returns Microsoft-flavoured prompts.
- [ ] Production build (`npm run build`) succeeds.
- [ ] Homepage section renders intro → quiz → basic → detailed in both lite and full modes.
- [ ] Email captured prospect email + JMC internal email both sent (or logged).
- [ ] DB row created with full responses + scores + IP hash.
- [ ] Returning email → new DB row (not deduped).
- [ ] localStorage cleared on success; survives mid-quiz refresh.
