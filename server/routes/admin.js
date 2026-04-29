/**
 * Admin routes — client management.
 * Protected by PORTAL_ADMIN_KEY env var.
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, queryAll, execute, seedChecklistForClient } from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

// Admin auth: require header X-Admin-Key matching env var
function requireAdmin(req, res, next) {
  const adminKey = process.env.PORTAL_ADMIN_KEY;
  if (!adminKey) {
    return res.status(503).json({ error: 'Admin key not configured. Set PORTAL_ADMIN_KEY env var.' });
  }
  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== adminKey) {
    return res.status(403).json({ error: 'Invalid admin key.' });
  }
  next();
}

router.use(requireAdmin);

// ── POST /api/portal/admin/clients — create a new client ─────────────────────
router.post('/clients', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required.' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Password strength: minimum 8 chars, at least one letter and one number
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with at least one letter and one number.',
    });
  }

  // Check uniqueness
  const existing = queryOne('SELECT id FROM clients WHERE email = ?', [email.toLowerCase().trim()]);
  if (existing) {
    return res.status(409).json({ error: 'A client with this email already exists.' });
  }

  const hash = bcrypt.hashSync(password, 12);

  const result = execute(
    'INSERT INTO clients (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email.toLowerCase().trim(), hash]
  );

  const client = queryOne('SELECT id, name, email, created_at FROM clients WHERE id = ?', [result.lastInsertRowid]);

  // Seed delivery checklist tasks for the new client
  seedChecklistForClient(client.id, req.body.checklist_template || null);

  return res.status(201).json({ client });
});

// ── GET /api/portal/admin/clients — list all clients ─────────────────────────
router.get('/clients', (_req, res) => {
  const clients = queryAll(
    'SELECT id, name, email, mfa_enabled, created_at FROM clients ORDER BY created_at DESC'
  );
  for (const c of clients) {
    c.mfa_enabled = !!c.mfa_enabled;
    c.users = queryAll(
      'SELECT id, name, email, mfa_enabled, created_at FROM client_users WHERE client_id = ? ORDER BY created_at',
      [c.id]
    ).map((u) => ({ ...u, mfa_enabled: !!u.mfa_enabled }));
  }
  return res.json({ clients });
});

// ── POST /api/portal/admin/clients/:id/reset-mfa — wipe MFA on a primary client ─
router.post('/clients/:id/reset-mfa', (req, res) => {
  const clientId = parseInt(req.params.id, 10);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID.' });
  }
  const client = queryOne('SELECT id, email FROM clients WHERE id = ?', [clientId]);
  if (!client) return res.status(404).json({ error: 'Client not found.' });

  execute(
    "UPDATE clients SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL, updated_at = datetime('now') WHERE id = ?",
    [clientId]
  );
  // Trusted devices for the primary user are stored with client_user_id IS NULL.
  execute(
    'DELETE FROM mfa_trusted_devices WHERE client_id = ? AND client_user_id IS NULL',
    [clientId]
  );

  return res.json({ success: true, message: `MFA reset for primary client ${client.email}.` });
});

// ── POST /api/portal/admin/users/:id/reset-mfa — wipe MFA on an alias user ───
router.post('/users/:id/reset-mfa', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }
  const user = queryOne('SELECT id, client_id, email FROM client_users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  execute(
    'UPDATE client_users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL WHERE id = ?',
    [userId]
  );
  execute(
    'DELETE FROM mfa_trusted_devices WHERE client_id = ? AND client_user_id = ?',
    [user.client_id, userId]
  );

  return res.json({ success: true, message: `MFA reset for alias user ${user.email}.` });
});

// ── POST /api/portal/admin/impersonate — get a JWT for any client ────────────
router.post('/impersonate', (req, res) => {
  const { client_id } = req.body;
  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required.' });
  }
  const client = queryOne('SELECT id, name, email FROM clients WHERE id = ?', [client_id]);
  if (!client) {
    return res.status(404).json({ error: 'Client not found.' });
  }
  const token = signToken(client, { isAdmin: true });
  return res.json({ token, client: { id: client.id, name: client.name, email: client.email } });
});

// ── POST /api/portal/admin/clients/:id/users — add an alias user to a client account ──
router.post('/clients/:id/users', (req, res) => {
  const clientId = parseInt(req.params.id, 10);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID.' });
  }

  const client = queryOne('SELECT id FROM clients WHERE id = ?', [clientId]);
  if (!client) {
    return res.status(404).json({ error: 'Client not found.' });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with at least one letter and one number.',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check uniqueness across both clients and client_users
  const existingClient = queryOne('SELECT id FROM clients WHERE email = ?', [normalizedEmail]);
  if (existingClient) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }
  const existingUser = queryOne('SELECT id FROM client_users WHERE email = ?', [normalizedEmail]);
  if (existingUser) {
    return res.status(409).json({ error: 'A user with this email already exists.' });
  }

  const hash = bcrypt.hashSync(password, 12);
  const result = execute(
    'INSERT INTO client_users (client_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
    [clientId, name, normalizedEmail, hash]
  );

  const user = queryOne('SELECT id, client_id, name, email, created_at FROM client_users WHERE id = ?', [result.lastInsertRowid]);
  return res.status(201).json({ user });
});

// ── PATCH /api/portal/admin/clients/:id — rename a client ────────────────────
router.patch('/clients/:id', (req, res) => {
  const clientId = parseInt(req.params.id, 10);
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID.' });
  }
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required.' });
  }
  const client = queryOne('SELECT id FROM clients WHERE id = ?', [clientId]);
  if (!client) {
    return res.status(404).json({ error: 'Client not found.' });
  }
  execute("UPDATE clients SET name = ?, updated_at = datetime('now') WHERE id = ?", [name.trim(), clientId]);
  const updated = queryOne('SELECT id, name, email FROM clients WHERE id = ?', [clientId]);
  return res.json({ client: updated });
});

export default router;
