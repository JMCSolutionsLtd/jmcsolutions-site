/**
 * MFA routes — TOTP setup, verification, and management.
 * Works with Microsoft Authenticator, Google Authenticator, etc.
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

/**
 * Generate a new TOTP secret and return QR code for setup.
 * POST /api/portal/mfa/setup
 */
router.post('/setup', (req, res) => {
  const client = queryOne('SELECT id, email, mfa_enabled FROM clients WHERE id = ?', [req.client.clientId]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  if (client.mfa_enabled) {
    return res.status(400).json({ error: 'MFA is already enabled. Disable it first to reconfigure.' });
  }

  // Generate a new TOTP secret
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: client.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  const otpauthUrl = totp.toString();

  // Store the secret temporarily (not yet enabled)
  execute('UPDATE clients SET mfa_secret = ?, updated_at = datetime(\'now\') WHERE id = ?', [
    secret.base32,
    client.id,
  ]);

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

  const client = queryOne('SELECT id, email, mfa_secret, mfa_enabled FROM clients WHERE id = ?', [
    req.client.clientId,
  ]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  if (client.mfa_enabled) return res.status(400).json({ error: 'MFA is already enabled.' });
  if (!client.mfa_secret) return res.status(400).json({ error: 'No MFA setup in progress. Start setup first.' });

  // Verify the code
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: client.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(client.mfa_secret),
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
  execute(
    'UPDATE clients SET mfa_enabled = 1, mfa_backup_codes = ?, updated_at = datetime(\'now\') WHERE id = ?',
    [JSON.stringify(backupCodes), client.id]
  );

  res.json({
    success: true,
    backupCodes,
    message: 'MFA enabled successfully. Save your backup codes in a safe place.',
  });
});

/**
 * Verify TOTP code during login (called after password check).
 * POST /api/portal/mfa/verify
 * Body: { code: "123456", mfaToken: "..." }
 *
 * Note: mfaToken is a temporary token issued after password verification.
 */
router.post('/verify', (req, res) => {
  // This route doesn't use requireAuth — it uses a temporary MFA token.
  // We override the middleware at the router level for this specific case.
  // Actually, this is handled directly in auth.js login flow.
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

  const client = queryOne('SELECT id, email, mfa_secret, mfa_enabled FROM clients WHERE id = ?', [
    req.client.clientId,
  ]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  if (!client.mfa_enabled) return res.status(400).json({ error: 'MFA is not enabled.' });

  // Verify code before disabling
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: client.email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(client.mfa_secret),
  });

  const delta = totp.validate({ token: code.trim(), window: 1 });
  if (delta === null) {
    return res.status(400).json({ error: 'Invalid code. MFA was not disabled.' });
  }

  execute(
    'UPDATE clients SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL, updated_at = datetime(\'now\') WHERE id = ?',
    [client.id]
  );

  res.json({ success: true, message: 'MFA has been disabled.' });
});

/**
 * Get MFA status for the current user.
 * GET /api/portal/mfa/status
 */
router.get('/status', (req, res) => {
  const client = queryOne('SELECT mfa_enabled FROM clients WHERE id = ?', [req.client.clientId]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  res.json({ mfaEnabled: !!client.mfa_enabled });
});

export default router;
