/**
 * Portal API server — Express + SQLite.
 *
 * Run alongside Vite dev server:
 *   node server/index.js
 *
 * Env vars:
 *   PORTAL_JWT_SECRET  — JWT signing secret (required in production)
 *   PORTAL_ADMIN_KEY   — Admin API key for client creation
 *   PORTAL_DB_PATH     — SQLite database file path (default: server/portal.db)
 *   PORTAL_PORT        — Server port (default: 3001)
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessments.js';
import adminRoutes from './routes/admin.js';
import checklistRoutes from './routes/checklist.js';
import documentRoutes from './routes/documents.js';
import mfaRoutes from './routes/mfa.js';
import { requireAuth } from './middleware/auth.js';

// Initialise async db before starting the server
import { initDb } from './db.js';

const app = express();
const PORT = process.env.PORTAL_PORT || 3001;

// ── Global middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP relaxed for dev
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/portal/health', (_req, res) => res.json({ status: 'ok' }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/portal/auth', authRoutes);
app.use('/api/portal/admin', adminRoutes);
app.use('/api/portal/mfa', mfaRoutes);
app.use('/api/portal/assessments', requireAuth, assessmentRoutes);
app.use('/api/portal/checklist', requireAuth, checklistRoutes);
app.use('/api/portal/documents', requireAuth, documentRoutes);

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────────────────────────────
(async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`[portal-server] Running on http://localhost:${PORT}`);
  });
})();
