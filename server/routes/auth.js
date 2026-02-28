/**
 * Auth routes — login + verify (token refresh / check).
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { loginRateLimit } from '../middleware/rateLimit.js';

const router = Router();

// ── POST /api/portal/auth/login ─────────────────────────────────────────────
router.post('/login', loginRateLimit, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const client = queryOne('SELECT * FROM clients WHERE email = ?', [email.toLowerCase().trim()]);

  if (!client) {
    // Intentionally vague to prevent user enumeration
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(password, client.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(client);

  return res.json({
    token,
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
    },
  });
});

// ── GET /api/portal/auth/verify ─────────────────────────────────────────────
router.get('/verify', requireAuth, (req, res) => {
  const client = queryOne('SELECT id, name, email FROM clients WHERE id = ?', [req.client.clientId]);

  if (!client) {
    return res.status(401).json({ error: 'Client not found.' });
  }

  return res.json({ client });
});

export default router;
