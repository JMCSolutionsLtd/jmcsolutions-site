/**
 * Checklist routes — delivery checklist CRUD.
 * All routes require auth; tenant isolation via req.client.clientId.
 */
import { Router } from 'express';
import { queryAll, queryOne, execute, seedChecklistForClient } from '../db.js';
import { notifyIfAdmin } from '../lib/notifyClient.js';

const router = Router();

// ── GET /api/portal/checklist — all tasks for this client ────────────────────
router.get('/', (req, res) => {
  const clientId = req.client.clientId;

  let tasks = queryAll(
    'SELECT * FROM checklist_tasks WHERE client_id = ? ORDER BY sort_order ASC',
    [clientId]
  );

  // If no tasks exist yet, auto-seed from the template
  if (tasks.length === 0) {
    seedChecklistForClient(clientId);
    tasks = queryAll(
      'SELECT * FROM checklist_tasks WHERE client_id = ? ORDER BY sort_order ASC',
      [clientId]
    );
  }

  return res.json({ tasks });
});

// ── PUT /api/portal/checklist/:id — update a single task (status / notes) ────
router.put('/:id', (req, res) => {
  const clientId = req.client.clientId;
  const taskId = req.params.id;
  const { status, notes } = req.body;

  const existing = queryOne(
    'SELECT * FROM checklist_tasks WHERE id = ? AND client_id = ?',
    [taskId, clientId]
  );

  if (!existing) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const validStatuses = ['pending', 'in-progress', 'complete'];
  const newStatus = validStatuses.includes(status) ? status : existing.status;
  const newNotes = notes !== undefined ? notes : existing.notes;

  execute(
    "UPDATE checklist_tasks SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ? AND client_id = ?",
    [newStatus, newNotes, taskId, clientId]
  );

  const updated = queryOne(
    'SELECT * FROM checklist_tasks WHERE id = ? AND client_id = ?',
    [taskId, clientId]
  );

  // Notify client if admin-initiated
  const statusChanged = newStatus !== existing.status;
  const notesChanged = newNotes !== (existing.notes || '');
  const changes = [];
  if (statusChanged) changes.push(`Task <b>"${existing.task}"</b> status changed from <b>${existing.status}</b> → <b>${newStatus}</b>`);
  if (notesChanged) changes.push(`Notes updated on task <b>"${existing.task}"</b>`);
  if (changes.length > 0) {
    notifyIfAdmin(req, {
      subject: 'Delivery Checklist Updated — JMC Solutions',
      heading: 'Delivery Checklist Update',
      changes,
    });
  }

  return res.json({ task: updated });
});

// ── PUT /api/portal/checklist — bulk update multiple tasks ───────────────────
router.put('/', (req, res) => {
  const clientId = req.client.clientId;
  const { updates } = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates must be an array.' });
  }

  const validStatuses = ['pending', 'in-progress', 'complete'];
  let updated = 0;

  for (const u of updates) {
    if (!u.id) continue;
    const existing = queryOne(
      'SELECT * FROM checklist_tasks WHERE id = ? AND client_id = ?',
      [u.id, clientId]
    );
    if (!existing) continue;

    const newStatus = validStatuses.includes(u.status) ? u.status : existing.status;
    const newNotes = u.notes !== undefined ? u.notes : existing.notes;

    execute(
      "UPDATE checklist_tasks SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ? AND client_id = ?",
      [newStatus, newNotes, u.id, clientId]
    );
    updated++;
  }

  // Notify client if admin-initiated
  if (updated > 0) {
    notifyIfAdmin(req, {
      subject: 'Delivery Checklist Updated — JMC Solutions',
      heading: 'Delivery Checklist Update',
      changes: [`${updated} checklist task(s) were updated by the JMC team.`],
    });
  }

  return res.json({ updated });
});

export default router;
