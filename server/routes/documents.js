/**
 * Document routes — file upload / download / delete per client.
 * Files stored under data/uploads/{clientId}/
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { queryAll, queryOne, execute, persist } from '../db.js';
import { notifyIfAdmin } from '../lib/notifyClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

// Ensure base uploads dir exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Configure multer with per-client folders
const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const dir = path.join(UPLOADS_DIR, String(req.client.clientId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    // Prefix with timestamp to avoid collisions
    const unique = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter(_req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'image/png',
      'image/jpeg',
      'text/csv',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed.`));
    }
  },
});

const router = Router();

// ── GET /api/portal/documents — list all documents for client ──────────────
router.get('/', (req, res) => {
  const docs = queryAll(
    'SELECT id, phase, filename, original_name, mimetype, size, uploaded_at FROM client_documents WHERE client_id = ? ORDER BY phase, uploaded_at DESC',
    [req.client.clientId]
  );
  return res.json({ documents: docs });
});

// ── POST /api/portal/documents — upload a document ─────────────────────────
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const phase = req.body.phase || 'General';

  const result = execute(
    'INSERT INTO client_documents (client_id, phase, filename, original_name, mimetype, size) VALUES (?, ?, ?, ?, ?, ?)',
    [req.client.clientId, phase, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
  );

  persist();

  const doc = queryOne('SELECT * FROM client_documents WHERE id = ?', [result.lastInsertRowid]);

  notifyIfAdmin(req, {
    subject: 'New Document Uploaded — JMC Solutions',
    heading: 'New Document Uploaded',
    changes: [
      `A new file <b>"${req.file.originalname}"</b> has been uploaded to the <b>${phase}</b> phase.`,
      `File size: ${(req.file.size / 1024).toFixed(1)} KB`,
    ],
  });

  return res.status(201).json({ document: doc });
});

// ── GET /api/portal/documents/:id/download — download a document ───────────
router.get('/:id/download', (req, res) => {
  const doc = queryOne(
    'SELECT * FROM client_documents WHERE id = ? AND client_id = ?',
    [req.params.id, req.client.clientId]
  );
  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  const filePath = path.join(UPLOADS_DIR, String(req.client.clientId), doc.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File missing from disk.' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
  res.setHeader('Content-Type', doc.mimetype);
  return res.sendFile(filePath);
});

// ── DELETE /api/portal/documents/:id — delete a document ───────────────────
router.delete('/:id', (req, res) => {
  const doc = queryOne(
    'SELECT * FROM client_documents WHERE id = ? AND client_id = ?',
    [req.params.id, req.client.clientId]
  );
  if (!doc) {
    return res.status(404).json({ error: 'Document not found.' });
  }

  // Remove file from disk
  const filePath = path.join(UPLOADS_DIR, String(req.client.clientId), doc.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  execute('DELETE FROM client_documents WHERE id = ?', [doc.id]);
  persist();

  notifyIfAdmin(req, {
    subject: 'Document Deleted — JMC Solutions',
    heading: 'Document Removed',
    changes: [`The file <b>"${doc.original_name}"</b> from the <b>${doc.phase}</b> phase has been deleted.`],
  });

  return res.json({ success: true });
});

// Error handler for multer
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err?.message) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Upload failed.' });
});

export default router;
