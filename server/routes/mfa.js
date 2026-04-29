/**
 * MFA routes — TOTP setup, verification, and management.
 * Works with Microsoft Authenticator, Google Authenticator, etc.
 *
 * MFA is per-user: primary account holders sit on `clients`, alias users
 * sit on `client_users`. Each row has its own `mfa_secret` / `mfa_enabled`
 * / `mfa_backup_codes`. The authenticated `req.client.userType` decides
 * which table a request operates on.
 */
import { Router } from 'express';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { queryOne, execute } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All MFA routes require authentication
router.use(requireAuth);

const ISSUER = 'JMC Solutions Portal';

// Resolve the row that owns MFA state for the authenticated user.
function loadEntity(req) {
  if (req.client.userType === 'alias') {
    const row = queryOne(
      'SELECT id, email, mfa_secret, mfa_enabled, mfa_backup_codes FROM client_users WHERE id = ?',
      [req.client.userId]
    );
    if (!row) return null;
    return { ...row, table: 'client_users' };
  }
  const row = queryOne(
    'SELECT id, email, mfa_secret, mfa_enabled, mfa_backup_codes FROM clients WHERE id = ?',
    [req.client.clientId]
  );
  if (!row) return null;
  return { ...row, table: 'clients' };
}

// Build an UPDATE statement for either table. `clients` carries `updated_at`,
// `client_users` does not, so we conditionally append the bookkeeping column.
function updateEntity(table, id, fields) {
  const sets = Object.keys(fields).map((k) => `${k} = ?`);
  if (table === 'clients') sets.push("updated_at = datetime('now')");
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`;
  execute(sql, [...Object.values(fields), id]);
}

/**
 * Generate a new TOTP secret and return QR code for setup.
 * POST /api/portal/mfa/setup
 */
router.post('/setup', (req, res) => {
  const entity = loadEntity(req);
  if (!entity) return res.status(404).json({ error: 'Account not found.' });

  if (entity.mfa_enabled) {
    return res.status(400).json({ error: 'MFA is already enabled. Disable it first to reconfigure.' });
  }

  // Generate a new TOTP secret
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: entity.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUrl = totp.toString();

  // Store the secret temporarily (not yet enabled)
  updateEntity(entity.table, entity.id, { mfa_secret: secret.base32 });

  // Generate QR code as data URL
  QRCode.toDataURL(otpauthUrl, { width: 256, margin: 1 })
    .then((qrDataUrl) => {
      res.json({
        qrCode: qrDataUrl,
        secret: secret.base32, // Allow manual entry
        otpauthUrl,
      });
    })
    .catch((err) => {
      console.error('[mfa] QR code generation failed:', err);
      res.status(500).json({ error: 'Failed to generate QR code.' });
    });
});

/**
 * Verify a TOTP code and enable MFA.
 * POST /api/portal/mfa/verify-setup
 * Body: { code: "123456" }
 */
router.post('/verify-setup', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Verification code is required.' });
  }

  const entity = loadEntity(req);
  if (!entity) return res.status(404).json({ error: 'Account not found.' });
  if (entity.mfa_enabled) return res.status(400).json({ error: 'MFA is already enabled.' });
  if (!entity.mfa_secret) return res.status(400).json({ error: 'No MFA setup in progress. Start setup first.' });

  // Verify the code
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: entity.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(entity.mfa_secret),
  });

  const delta = totp.validate({ token: code.trim(), window: 1 });
  if (delta === null) {
    return res.status(400).json({ error: 'Invalid code. Please check Microsoft Authenticator and try again.' });
  }

  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Enable MFA
  updateEntity(entity.table, entity.id, {
    mfa_enabled: 1,
    mfa_backup_codes: JSON.stringify(backupCodes),
  });

  res.json({
    success: true,
    backupCodes,
    message: 'MFA enabled successfully. Save your backup codes in a safe place.',
  });
});

/**
 * Verify TOTP code during login (called after password check).
 * POST /api/portal/mfa/verify
 *
 * Note: actual verification happens at /api/portal/auth/mfa-verify.
 */
router.post('/verify', (req, res) => {
  res.status(501).json({ error: 'Use /auth/mfa-verify instead.' });
});

/**
 * Disable MFA for the current user.
 * POST /api/portal/mfa/disable
 * Body: { code: "123456" } — requires a valid TOTP code to disable
 */
router.post('/disable', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Current TOTP code is required to disable MFA.' });
  }

  const entity = loadEntity(req);
  if (!entity) return res.status(404).json({ error: 'Account not found.' });
  if (!entity.mfa_enabled) return res.status(400).json({ error: 'MFA is not enabled.' });

  // Verify code before disabling
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: entity.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(entity.mfa_secret),
  });

  const delta = totp.validate({ token: code.trim(), window: 1 });
  if (delta === null) {
    return res.status(400).json({ error: 'Invalid code. MFA was not disabled.' });
  }

  updateEntity(entity.table, entity.id, {
    mfa_enabled: 0,
    mfa_secret: null,
    mfa_backup_codes: null,
  });

  // Clear any trusted devices for this specific user.
  const clientUserId = entity.table === 'client_users' ? entity.id : null;
  if (clientUserId) {
    execute(
      'DELETE FROM mfa_trusted_devices WHERE client_id = ? AND client_user_id = ?',
      [req.client.clientId, clientUserId]
    );
  } else {
    execute(
      'DELETE FROM mfa_trusted_devices WHERE client_id = ? AND client_user_id IS NULL',
      [req.client.clientId]
    );
  }

  res.json({ success: true, message: 'MFA has been disabled.' });
});

/**
 * Get MFA status for the current user.
 * GET /api/portal/mfa/status
 */
router.get('/status', (req, res) => {
  const entity = loadEntity(req);
  if (!entity) return res.status(404).json({ error: 'Account not found.' });

  res.json({ mfaEnabled: !!entity.mfa_enabled });
});

export default router;
