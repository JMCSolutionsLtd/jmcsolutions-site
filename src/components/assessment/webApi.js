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
