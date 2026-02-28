/**
 * Database setup — SQLite via sql.js (pure JS, no native deps).
 * Persists to disk via manual read/write.
 * Creates tables on first run; safe to call multiple times.
 */
import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.PORTAL_DB_PATH || path.join(__dirname, 'portal.db');

// Ensure the directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

/**
 * Initialise the database. Must be awaited before any queries.
 */
export async function initDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing DB file if it exists
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // ── Migrations ─────────────────────────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_milestones (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id),
      title       TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'draft',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_responses (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      milestone_id  INTEGER NOT NULL REFERENCES assessment_milestones(id) ON DELETE CASCADE,
      question_id   TEXT    NOT NULL,
      score         INTEGER CHECK(score BETWEEN 1 AND 5),
      notes         TEXT    DEFAULT '',
      answered_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(milestone_id, question_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id        TEXT    PRIMARY KEY,
      category  TEXT    NOT NULL,
      prompt    TEXT    NOT NULL,
      "order"   INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS checklist_tasks (
      id          TEXT    NOT NULL,
      client_id   INTEGER NOT NULL REFERENCES clients(id),
      category    TEXT    NOT NULL,
      sub_category TEXT   NOT NULL,
      task        TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',
      notes       TEXT    DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      invoice     INTEGER,
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (id, client_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS client_documents (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id),
      phase       TEXT    NOT NULL,
      filename    TEXT    NOT NULL,
      original_name TEXT  NOT NULL,
      mimetype    TEXT    NOT NULL,
      size        INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // ── Seed questions from JSON if table is empty ────────────────────────────
  const countResult = db.exec('SELECT COUNT(*) AS cnt FROM questions');
  const questionCount = countResult[0]?.values[0]?.[0] || 0;

  if (questionCount === 0) {
    const questionsPath = path.join(__dirname, '..', 'data', 'ai_readiness_questions.json');
    if (fs.existsSync(questionsPath)) {
      const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
      const stmt = db.prepare('INSERT OR IGNORE INTO questions (id, category, prompt, "order", is_active) VALUES (?, ?, ?, ?, 1)');
      for (const q of data.questions) {
        stmt.run([q.id, q.category, q.prompt, q.order]);
      }
      stmt.free();
      console.log(`[db] Seeded ${data.questions.length} questions from JSON.`);
    } else {
      console.warn('[db] Question seed file not found at', questionsPath);
    }
  }

  persist();
  return db;
}

/**
 * Seed delivery checklist tasks for a new client.
 * @param {number} clientId
 * @param {string} [template] — name of a JSON file in data/checklists/ (without .json). Falls back to data/delivery_checklist.json.
 */
export function seedChecklistForClient(clientId, template) {
  let checklistPath;
  if (template) {
    checklistPath = path.join(__dirname, '..', 'data', 'checklists', `${template}.json`);
    if (!fs.existsSync(checklistPath)) {
      console.warn(`[db] Custom checklist "${template}" not found at ${checklistPath}, falling back to default.`);
      checklistPath = null;
    }
  }
  if (!checklistPath) {
    checklistPath = path.join(__dirname, '..', 'data', 'delivery_checklist.json');
  }
  if (!fs.existsSync(checklistPath)) {
    console.warn('[db] Checklist seed file not found at', checklistPath);
    return 0;
  }
  const data = JSON.parse(fs.readFileSync(checklistPath, 'utf-8'));
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO checklist_tasks (id, client_id, category, sub_category, task, status, sort_order, invoice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  for (const t of data.tasks) {
    stmt.run([t.id, clientId, t.category, t.sub_category, t.task, 'pending', t.sort_order, t.invoice || null]);
  }
  stmt.free();
  persist();
  console.log(`[db] Seeded ${data.tasks.length} checklist tasks for client ${clientId}.`);
  return data.tasks.length;
}

/**
 * Persist the database to disk.
 */
export function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Helper: run a query and return all rows as objects.
 */
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper: run a query and return a single row as an object, or null.
 */
export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper: run an INSERT/UPDATE/DELETE and return { changes, lastInsertRowid }.
 */
export function execute(sql, params = []) {
  db.run(sql, params);
  const info = db.exec('SELECT changes() AS changes, last_insert_rowid() AS lastId');
  const changes = info[0]?.values[0]?.[0] || 0;
  const lastId = info[0]?.values[0]?.[1] || 0;
  persist();
  return { changes, lastInsertRowid: lastId };
}

/**
 * Get the raw db instance (for advanced use).
 */
export function getDb() {
  return db;
}
