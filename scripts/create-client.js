#!/usr/bin/env node
/**
 * CLI script to create a new client account in the portal.
 * Calls the running server's admin API so the in-memory DB is updated immediately.
 *
 * Requires:
 *   - The portal server to be running (npm run dev:portal or npm run dev:all)
 *   - PORTAL_ADMIN_KEY env var to match the server's
 *
 * Usage:
 *   PORTAL_ADMIN_KEY=mykey node scripts/create-client.js --name "Acme Corp" --email "admin@acme.com" --password "SecurePass1"
 *
 * Or interactive:
 *   PORTAL_ADMIN_KEY=mykey node scripts/create-client.js
 */
import readline from 'readline';

const PORT = process.env.PORTAL_PORT || 3001;
const ADMIN_KEY = process.env.PORTAL_ADMIN_KEY;
const BASE_URL = `http://localhost:${PORT}/api/portal/admin`;

// Parse CLI args
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  if (!ADMIN_KEY) {
    console.error('Error: PORTAL_ADMIN_KEY env var is required.');
    console.error('Usage: PORTAL_ADMIN_KEY=mykey node scripts/create-client.js --name "..." --email "..." --password "..."');
    process.exit(1);
  }

  let name = getArg('--name');
  let email = getArg('--email');
  let password = getArg('--password');
  const checklistTemplate = getArg('--checklist'); // optional custom checklist template

  if (!name) name = await prompt('Client name: ');
  if (!email) email = await prompt('Client email: ');
  if (!password) password = await prompt('Temporary password (min 8 chars, 1 letter + 1 number): ');

  // Validate locally before hitting the server
  if (!name || !email || !password) {
    console.error('Error: name, email, and password are all required.');
    process.exit(1);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Error: Invalid email format.');
    process.exit(1);
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    console.error('Error: Password must be at least 8 characters with at least one letter and one number.');
    process.exit(1);
  }

  // Call the admin API on the running server
  let res;
  try {
    res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_KEY,
      },
      body: JSON.stringify({ name, email, password, checklist_template: checklistTemplate || undefined }),
    });
  } catch (err) {
    console.error('Error: Could not connect to the portal server.');
    console.error(`Make sure it is running on port ${PORT} (npm run dev:portal or npm run dev:all).`);
    process.exit(1);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`Error (${res.status}): ${data.error || 'Unknown error'}`);
    process.exit(1);
  }

  console.log(`\n✅ Client created successfully!`);
  console.log(`   ID:    ${data.client.id}`);
  console.log(`   Name:  ${data.client.name}`);
  console.log(`   Email: ${data.client.email}`);
  console.log(`\nThey can now log in at /portal/login`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
