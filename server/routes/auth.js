/**
 * Auth routes — login (with MFA support), verify, password reset.
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as OTPAuth from 'otpauth';
import jwt from 'jsonwebtoken';
import { queryOne, execute } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { loginRateLimit } from '../middleware/rateLimit.js';

const router = Router();
const JWT_SECRET = process.env.PORTAL_JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_use_a_long_random_string';
const ISSUER = 'JMC Solutions Portal';
const TRUSTED_DEVICE_DAYS = Number(process.env.PORTAL_MFA_TRUSTED_DAYS || 30);

function hashTrustedDeviceToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createTrustedDeviceToken(clientId) {
  const trustedDeviceToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashTrustedDeviceToken(trustedDeviceToken);
  const expiresAt = Math.floor(Date.now() / 1000) + (TRUSTED_DEVICE_DAYS * 24 * 60 * 60);

  execute(
    'INSERT OR REPLACE INTO mfa_trusted_devices (client_id, token_hash, expires_at, last_used_at) VALUES (?, ?, ?, datetime(\'now\'))',
    [clientId, tokenHash, expiresAt]
  );

  execute('DELETE FROM mfa_trusted_devices WHERE expires_at <= strftime(\'%s\', \'now\')');

  return trustedDeviceToken;
}

function isTrustedDevice(clientId, trustedDeviceToken) {
  if (!trustedDeviceToken || typeof trustedDeviceToken !== 'string') return false;
  const tokenHash = hashTrustedDeviceToken(trustedDeviceToken);
  const row = queryOne(
    'SELECT id FROM mfa_trusted_devices WHERE client_id = ? AND token_hash = ? AND expires_at > strftime(\'%s\', \'now\')',
    [clientId, tokenHash]
  );
  if (!row) return false;
  execute('UPDATE mfa_trusted_devices SET last_used_at = datetime(\'now\') WHERE id = ?', [row.id]);
  return true;
}

function authSuccessResponse(client, rememberDevice = false) {
  const token = signToken(client);
  const response = {
    token,
    client: { id: client.id, name: client.name, email: client.email, mfaEnabled: !!client.mfa_enabled },
  };

  if (rememberDevice) {
    response.trustedDeviceToken = createTrustedDeviceToken(client.id);
  }

  return response;
}

// ── POST /api/portal/auth/login ─────────────────────────────────────────────
router.post('/login', loginRateLimit, (req, res) => {
  const { email, password, trustedDeviceToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const client = queryOne('SELECT * FROM clients WHERE email = ?', [email.toLowerCase().trim()]);

  if (!client) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, client.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check if MFA is enabled
  if (client.mfa_enabled) {
    if (isTrustedDevice(client.id, trustedDeviceToken)) {
      return res.json(authSuccessResponse(client, false));
    }

    // Issue a short-lived MFA challenge token (5 minutes)
    const mfaToken = jwt.sign(
      { clientId: client.id, email: client.email, purpose: 'mfa-challenge' },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
    return res.json({ requiresMfa: true, mfaToken });
  }

  // Check if forced password reset is required
  if (client.must_reset_password) {
    const resetToken = jwt.sign(
      { clientId: client.id, email: client.email, purpose: 'forced-reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    return res.json({ requiresPasswordReset: true, resetToken });
  }

  return res.json(authSuccessResponse(client, false));
});

// ── POST /api/portal/auth/mfa-verify ────────────────────────────────────────
router.post('/mfa-verify', loginRateLimit, (req, res) => {
  const { mfaToken, code, rememberDevice } = req.body;

  if (!mfaToken || !code) {
    return res.status(400).json({ error: 'MFA token and verification code are required.' });
  }

  let payload;
  try {
    payload = jwt.verify(mfaToken, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'MFA session expired. Please login again.' });
  }

  if (payload.purpose !== 'mfa-challenge') {
    return res.status(400).json({ error: 'Invalid MFA token.' });
  }

  const client = queryOne('SELECT * FROM clients WHERE id = ?', [payload.clientId]);
  if (!client || !client.mfa_enabled) {
    return res.status(401).json({ error: 'Invalid session.' });
  }

  // Try TOTP code
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: client.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(client.mfa_secret),
  });

  const delta = totp.validate({ token: code.trim(), window: 1 });
  if (delta !== null) {
    return res.json(authSuccessResponse(client, !!rememberDevice));
  }

  // Try backup code
  const normalizedCode = code.trim().toUpperCase();
  let backupCodes = [];
  try { backupCodes = JSON.parse(client.mfa_backup_codes || '[]'); } catch { /* ignore */ }

  const codeIndex = backupCodes.indexOf(normalizedCode);
  if (codeIndex !== -1) {
    backupCodes.splice(codeIndex, 1);
    execute(
      'UPDATE clients SET mfa_backup_codes = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [JSON.stringify(backupCodes), client.id]
    );
    return res.json({
      ...authSuccessResponse(client, !!rememberDevice),
      backupCodeUsed: true,
      backupCodesRemaining: backupCodes.length,
    });
  }

  return res.status(401).json({ error: 'Invalid verification code.' });
});

// ── POST /api/portal/auth/request-reset ─────────────────────────────────────
router.post('/request-reset', loginRateLimit, (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const client = queryOne('SELECT id, email FROM clients WHERE email = ?', [email.toLowerCase().trim()]);

  // Always return success to prevent user enumeration
  if (!client) {
    return res.json({ success: true, message: 'If an account exists with that email, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  execute(
    'UPDATE clients SET password_reset_token = ?, password_reset_expires = ?, updated_at = datetime(\'now\') WHERE id = ?',
    [resetToken, expires, client.id]
  );

  const resetLink = `/portal/reset-password?token=${resetToken}`;
  console.log(`[auth] Password reset requested for ${client.email}`);
  console.log(`[auth] Reset link: ${resetLink}`);
  console.log(`[auth] Reset token: ${resetToken}`);

  return res.json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent.',
    ...(process.env.NODE_ENV !== 'production' && { _devToken: resetToken, _devLink: resetLink }),
  });
});

// ── POST /api/portal/auth/reset-password ────────────────────────────────────
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with at least one letter and one number.' });
  }

  const client = queryOne(
    'SELECT id, email, password_reset_token, password_reset_expires FROM clients WHERE password_reset_token = ?',
    [token]
  );

  if (!client) return res.status(400).json({ error: 'Invalid or expired reset token.' });

  if (new Date(client.password_reset_expires) < new Date()) {
    execute('UPDATE clients SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?', [client.id]);
    return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  execute(
    'UPDATE clients SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL, must_reset_password = 0, updated_at = datetime(\'now\') WHERE id = ?',
    [hash, client.id]
  );

  console.log(`[auth] Password reset completed for ${client.email}`);
  return res.json({ success: true, message: 'Password has been reset. You can now log in.' });
});

// ── POST /api/portal/auth/forced-reset ──────────────────────────────────────
router.post('/forced-reset', (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  let payload;
  try { payload = jwt.verify(resetToken, JWT_SECRET); } catch {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }
  if (payload.purpose !== 'forced-reset') {
    return res.status(400).json({ error: 'Invalid reset token.' });
  }

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with at least one letter and one number.' });
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  execute('UPDATE clients SET password_hash = ?, must_reset_password = 0, updated_at = datetime(\'now\') WHERE id = ?', [hash, payload.clientId]);

  const client = queryOne('SELECT id, name, email, mfa_enabled FROM clients WHERE id = ?', [payload.clientId]);
  const token = signToken(client);
  return res.json({
    token,
    client: { id: client.id, name: client.name, email: client.email, mfaEnabled: !!client.mfa_enabled },
  });
});

// ── POST /api/portal/auth/change-password ───────────────────────────────────
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters with at least one letter and one number.' });
  }

  const client = queryOne('SELECT id, password_hash FROM clients WHERE id = ?', [req.client.clientId]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  if (!bcrypt.compareSync(currentPassword, client.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const hash = bcrypt.hashSync(newPassword, 12);
  execute('UPDATE clients SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?', [hash, client.id]);

  return res.json({ success: true, message: 'Password changed successfully.' });
});

// ── GET /api/portal/auth/verify ─────────────────────────────────────────────
router.get('/verify', requireAuth, (req, res) => {
  const client = queryOne('SELECT id, name, email, mfa_enabled FROM clients WHERE id = ?', [req.client.clientId]);
  if (!client) return res.status(401).json({ error: 'Client not found.' });

  return res.json({
    client: { id: client.id, name: client.name, email: client.email, mfaEnabled: !!client.mfa_enabled },
  });
});

export default router;
