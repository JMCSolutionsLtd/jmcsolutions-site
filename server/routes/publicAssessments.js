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
  for (const [qid, score] of Object.entries(responses)) {
    if (!QUESTIONS_BY_ID[qid]) return res.status(400).json({ error: `Unknown question: ${qid}` });
    const s = parseInt(score, 10);
    if (!Number.isInteger(s) || s < 1 || s > 5) {
      return res.status(400).json({ error: `Invalid score for ${qid}` });
    }
  }

  const scores = computeScoresFromResponses(responses);

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
