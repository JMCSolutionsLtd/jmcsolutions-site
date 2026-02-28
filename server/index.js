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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const PORT = process.env.PORT || process.env.PORTAL_PORT || 3001;

// ── Allowed CORS origins ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
  process.env.CORS_ORIGIN,
  'https://jmcsolutions.ai',
  'https://www.jmcsolutions.ai',
  'https://jmcsolutions-site-production.up.railway.app',
].filter(Boolean);

// ── Global middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Admin-Key'],
}));
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

// ── Serve static frontend (production) ──────────────────────────────────────
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

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
