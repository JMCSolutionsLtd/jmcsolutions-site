/**
 * notifyClient — sends an email to a client when an admin makes a change.
 * Uses the Resend SDK (already installed). Set RESEND_API_KEY in env.
 * If RESEND_API_KEY is not set, logs the notification to console instead.
 */
import { Resend } from 'resend';
import { queryOne } from '../db.js';

const FROM_ADDRESS = process.env.PORTAL_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Send a change-notification email to a client.
 *
 * @param {object} opts
 * @param {number} opts.clientId
 * @param {string} opts.subject  — email subject line
 * @param {string} opts.heading  — bold heading inside the email
 * @param {string[]} opts.changes — list of human-readable change descriptions
 */
export async function notifyClient({ clientId, subject, heading, changes }) {
  const client = queryOne('SELECT name, email FROM clients WHERE id = ?', [clientId]);
  if (!client) return;

  const changeList = changes.map((c) => `<li style="margin-bottom:6px;">${c}</li>`).join('');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <img src="https://jmcsolutions.ai/logo.png" alt="JMC Solutions" style="height:40px;margin-bottom:16px;" />
      <h2 style="color:#1e293b;margin-bottom:4px;">${heading}</h2>
      <p style="color:#64748b;font-size:14px;margin-bottom:16px;">
        Hi ${client.name}, the JMC Solutions team has made updates to your portal:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
        <ul style="color:#334155;font-size:14px;padding-left:20px;margin:0;">
          ${changeList}
        </ul>
      </div>
      <p style="color:#64748b;font-size:13px;">
        Log in to your <a href="https://jmcsolutions.ai/portal" style="color:#2563eb;text-decoration:none;">Client Portal</a> to review the changes.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0 12px;" />
      <p style="color:#94a3b8;font-size:11px;">JMC Solutions — AI Adoption & Delivery</p>
    </div>
  `.trim();

  // If no API key, log instead of sending
  if (!process.env.RESEND_API_KEY) {
    console.log(`[notify] Would email ${client.email}: ${subject}`);
    changes.forEach((c) => console.log(`  • ${c}`));
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: client.email,
      subject,
      html,
    });
    console.log(`[notify] Sent email to ${client.email}: ${subject}`);
  } catch (err) {
    console.error(`[notify] Failed to email ${client.email}:`, err.message);
  }
}

/**
 * Helper — only sends notification if the action was admin-initiated.
 * Call this from route handlers: `notifyIfAdmin(req, { ... })`.
 */
export function notifyIfAdmin(req, opts) {
  if (req.client?.isAdmin) {
    // Fire-and-forget: don't block the HTTP response
    notifyClient({ clientId: req.client.clientId, ...opts }).catch(() => {});
  }
}
