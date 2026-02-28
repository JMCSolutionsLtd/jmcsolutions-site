/**
 * Assessment routes — CRUD for milestones & responses.
 * All routes require auth; tenant isolation enforced via req.client.clientId.
 */
import { Router } from 'express';
import { queryAll, queryOne, execute, persist } from '../db.js';
import { notifyIfAdmin } from '../lib/notifyClient.js';

const router = Router();

// ── Helper: compute scores ──────────────────────────────────────────────────

function computeScores(milestoneId) {
  const responses = queryAll(
    'SELECT r.question_id, r.score, q.category FROM assessment_responses r JOIN questions q ON r.question_id = q.id WHERE r.milestone_id = ? AND r.score IS NOT NULL',
    [milestoneId]
  );

  const byCategory = {};
  let totalScore = 0;
  let totalAnswered = 0;

  for (const r of responses) {
    if (!byCategory[r.category]) {
      byCategory[r.category] = { sum: 0, count: 0 };
    }
    byCategory[r.category].sum += r.score;
    byCategory[r.category].count += 1;
    totalScore += r.score;
    totalAnswered += 1;
  }

  const categoryScores = {};
  for (const [cat, data] of Object.entries(byCategory)) {
    categoryScores[cat] = {
      percent: Math.round((data.sum / (data.count * 5)) * 100),
      answered: data.count,
      sum: data.sum,
    };
  }

  return {
    overall: totalAnswered > 0
      ? { percent: Math.round((totalScore / (totalAnswered * 5)) * 100), answered: totalAnswered, sum: totalScore }
      : null,
    categories: categoryScores,
  };
}

// ── GET /api/portal/assessments — list all milestones for client ─────────────
router.get('/', (req, res) => {
  const milestones = queryAll(
    'SELECT * FROM assessment_milestones WHERE client_id = ? ORDER BY created_at ASC',
    [req.client.clientId]
  );

  const result = milestones.map((m) => ({
    ...m,
    scores: computeScores(m.id),
  }));

  return res.json({ milestones: result });
});

// ── GET /api/portal/assessments/questions — all active questions ─────────────
router.get('/questions', (_req, res) => {
  const questions = queryAll(
    'SELECT id, category, prompt, "order" FROM questions WHERE is_active = 1 ORDER BY category, "order"'
  );
  return res.json({ questions });
});

// ── POST /api/portal/assessments — create a new milestone ───────────────────
router.post('/', (req, res) => {
  const clientId = req.client.clientId;

  const countResult = queryOne(
    'SELECT COUNT(*) AS cnt FROM assessment_milestones WHERE client_id = ?',
    [clientId]
  );
  const count = countResult?.cnt || 0;
  const title = req.body.title || `Assessment ${count + 1}`;

  const result = execute(
    'INSERT INTO assessment_milestones (client_id, title) VALUES (?, ?)',
    [clientId, title]
  );

  const newId = result.lastInsertRowid;

  // Copy responses from the most recent previous milestone (if any)
  const previousMilestone = queryOne(
    'SELECT id FROM assessment_milestones WHERE client_id = ? AND id != ? ORDER BY id DESC LIMIT 1',
    [clientId, newId]
  );
  if (previousMilestone) {
    const prevResponses = queryAll(
      'SELECT question_id, score, notes FROM assessment_responses WHERE milestone_id = ?',
      [previousMilestone.id]
    );
    for (const r of prevResponses) {
      execute(
        "INSERT INTO assessment_responses (milestone_id, question_id, score, notes, answered_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [newId, r.question_id, r.score, r.notes || '']
      );
    }
  }

  const milestone = queryOne('SELECT * FROM assessment_milestones WHERE id = ?', [newId]);

  notifyIfAdmin(req, {
    subject: 'New Assessment Milestone Created — JMC Solutions',
    heading: 'New Assessment Milestone',
    changes: [`A new assessment milestone <b>"${title}"</b> has been created for your portal.`],
  });

  return res.status(201).json({ milestone: { ...milestone, scores: computeScores(milestone.id) } });
});

// ── GET /api/portal/assessments/:id — single milestone with responses ────────
router.get('/:id', (req, res) => {
  const milestone = queryOne(
    'SELECT * FROM assessment_milestones WHERE id = ? AND client_id = ?',
    [req.params.id, req.client.clientId]
  );

  if (!milestone) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  const responses = queryAll(
    'SELECT question_id, score, notes, answered_at FROM assessment_responses WHERE milestone_id = ?',
    [milestone.id]
  );

  return res.json({
    milestone: {
      ...milestone,
      scores: computeScores(milestone.id),
      responses,
    },
  });
});

// ── PUT /api/portal/assessments/:id — save responses (partial or complete) ──
router.put('/:id', (req, res) => {
  const milestone = queryOne(
    'SELECT * FROM assessment_milestones WHERE id = ? AND client_id = ?',
    [req.params.id, req.client.clientId]
  );

  if (!milestone) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  const { responses, status } = req.body;

  if (!Array.isArray(responses)) {
    return res.status(400).json({ error: 'responses must be an array.' });
  }

  for (const item of responses) {
    if (item.score !== null && item.score !== undefined) {
      const s = parseInt(item.score, 10);
      if (isNaN(s) || s < 1 || s > 5) continue; // skip invalid
      // Upsert: try update first, then insert
      const existing = queryOne(
        'SELECT id FROM assessment_responses WHERE milestone_id = ? AND question_id = ?',
        [milestone.id, item.question_id]
      );
      if (existing) {
        execute(
          "UPDATE assessment_responses SET score = ?, notes = ?, answered_at = datetime('now') WHERE milestone_id = ? AND question_id = ?",
          [s, item.notes || '', milestone.id, item.question_id]
        );
      } else {
        execute(
          "INSERT INTO assessment_responses (milestone_id, question_id, score, notes, answered_at) VALUES (?, ?, ?, ?, datetime('now'))",
          [milestone.id, item.question_id, s, item.notes || '']
        );
      }
    }
  }

  // Update milestone status and timestamp
  const newStatus = status === 'completed' ? 'completed' : milestone.status;
  execute(
    "UPDATE assessment_milestones SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [newStatus, milestone.id]
  );

  // Return updated milestone
  const updated = queryOne('SELECT * FROM assessment_milestones WHERE id = ?', [milestone.id]);
  const updatedResponses = queryAll(
    'SELECT question_id, score, notes, answered_at FROM assessment_responses WHERE milestone_id = ?',
    [milestone.id]
  );

  // Notify client if admin-initiated
  const changes = [];
  if (status === 'completed' && milestone.status !== 'completed') {
    changes.push(`Assessment <b>"${milestone.title}"</b> has been marked as <b>completed</b>.`);
  }
  changes.push(`${responses.length} response(s) updated on assessment <b>"${milestone.title}"</b>.`);
  notifyIfAdmin(req, {
    subject: 'Assessment Updated — JMC Solutions',
    heading: 'Assessment Update',
    changes,
  });

  return res.json({
    milestone: {
      ...updated,
      scores: computeScores(milestone.id),
      responses: updatedResponses,
    },
  });
});

// ── DELETE /api/portal/assessments/:id ───────────────────────────────────────
router.delete('/:id', (req, res) => {
  const milestone = queryOne(
    'SELECT * FROM assessment_milestones WHERE id = ? AND client_id = ?',
    [req.params.id, req.client.clientId]
  );

  if (!milestone) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  execute('DELETE FROM assessment_responses WHERE milestone_id = ?', [milestone.id]);
  execute('DELETE FROM assessment_milestones WHERE id = ?', [milestone.id]);

  notifyIfAdmin(req, {
    subject: 'Assessment Milestone Deleted — JMC Solutions',
    heading: 'Assessment Milestone Deleted',
    changes: [`Assessment milestone <b>"${milestone.title}"</b> has been removed.`],
  });

  return res.json({ success: true });
});

export default router;
