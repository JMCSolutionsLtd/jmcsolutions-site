# JMC Solutions Website

Marketing site and **Client Portal** for JMC Solutions — an AI strategy consultancy.

Built with React 18, Vite 5, and Tailwind CSS 3.4.

---

## Quick Start

```bash
npm install
npm run dev          # Vite dev server (marketing site)
```

---

## Client Portal

A secure, multi-tenant portal where clients log in to complete the **AI Readiness Assessment** (72 questions across 7 categories) and track progress over time.

### Architecture

| Layer       | Stack                                                  |
|-------------|--------------------------------------------------------|
| Frontend    | React 18, react-router-dom 6, Recharts, Tailwind CSS  |
| Backend     | Express 4, sql.js (SQLite in pure JS/WASM)             |
| Auth        | JWT Bearer tokens, bcryptjs password hashing           |
| Dev proxy   | Vite proxy (`/api/portal` → `localhost:3001`)          |

### Running the Portal Locally

```bash
# 1. Set env vars (or use defaults for local dev)
export PORTAL_JWT_SECRET="your-secret-here"   # defaults to a dev fallback
export PORTAL_ADMIN_KEY="your-admin-key"       # required for client creation

# 2. Start both the portal server and Vite dev server
npm run dev:all

# 3. Create a client account
npm run create-client -- --name "Acme Corp" --email "admin@acme.com" --password "SecurePass1"

# 4. Visit http://localhost:5173/portal/login
```

### Environment Variables

| Variable            | Required | Default               | Description                          |
|---------------------|----------|-----------------------|--------------------------------------|
| `PORTAL_JWT_SECRET` | Prod     | Dev fallback          | JWT signing secret                   |
| `PORTAL_ADMIN_KEY`  | Yes      | —                     | Admin API key for client management  |
| `PORTAL_DB_PATH`    | No       | `server/portal.db`    | SQLite database file location        |
| `PORTAL_PORT`       | No       | `3001`                | Portal API server port               |
| `PORTAL_JWT_EXPIRES_IN` | No   | `8h`                  | JWT session lifetime (e.g. `7d`)     |
| `PORTAL_MFA_TRUSTED_DAYS` | No | `30`                | Trusted-device MFA duration in days  |

### Production Persistence (Important)

If you deploy the portal API to Railway (or any container platform), ensure the database file is on a persistent volume, otherwise milestones/MFA settings can disappear after redeploy/restart.

- Create a persistent volume and mount it (example mount path: `/data`).
- Set `PORTAL_DB_PATH=/data/portal.db`.
- Keep backups/snapshots enabled for that volume.

### npm Scripts

| Script             | Description                                        |
|--------------------|----------------------------------------------------|
| `npm run dev`      | Vite dev server only (marketing site)              |
| `npm run dev:portal` | Portal Express server only                       |
| `npm run dev:all`  | Both servers concurrently                          |
| `npm run build`    | Production build (frontend only)                   |
| `npm run create-client` | CLI to create a new client account            |
| `npm run validate-scoring` | Run scoring algorithm validation tests     |

### Portal Routes

| Path                       | Description                                 |
|----------------------------|---------------------------------------------|
| `/portal/login`            | Client login page                           |
| `/portal`                  | Dashboard — milestones, charts, score cards |
| `/portal/assessment/:id`   | 72-question AI Readiness Assessment form    |

### API Endpoints

| Method | Path                              | Auth       | Description                      |
|--------|-----------------------------------|------------|----------------------------------|
| GET    | `/api/portal/health`              | None       | Health check                     |
| POST   | `/api/portal/auth/login`          | None       | Email + password login           |
| GET    | `/api/portal/auth/verify`         | Bearer     | Verify token validity            |
| GET    | `/api/portal/assessments`         | Bearer     | List client's milestones         |
| GET    | `/api/portal/assessments/questions` | Bearer   | All 72 assessment questions      |
| POST   | `/api/portal/assessments`         | Bearer     | Create new milestone             |
| GET    | `/api/portal/assessments/:id`     | Bearer     | Get milestone with responses     |
| PUT    | `/api/portal/assessments/:id`     | Bearer     | Save responses (draft/complete)  |
| DELETE | `/api/portal/assessments/:id`     | Bearer     | Delete milestone                 |
| POST   | `/api/portal/admin/clients`       | Admin key  | Create client account            |
| GET    | `/api/portal/admin/clients`       | Admin key  | List all clients                 |

### Assessment Categories (72 questions)

1. AI Readiness: Business Strategy (10)
2. AI Readiness: Organization and Culture (11)
3. AI Readiness: AI Strategy and Experience (10)
4. AI Readiness: Data Foundations (11)
5. AI Readiness: AI Governance and Security (10)
6. AI Readiness: Infrastructure for AI (10)
7. AI Readiness: Model Management (10)

### Scoring

Each question is scored 1–5. Scores are computed **server-side** (source of truth) per category and overall as a percentage of maximum possible score. Color bands: red ≤33%, yellow 34–65%, green ≥66%.
