#!/usr/bin/env node
/**
 * Renames the JMC Solutions client to Essjay Solutions and adds two alias users.
 *
 * Usage:
 *   Local:      PORTAL_ADMIN_KEY=mykey node scripts/seed-essjay.js
 *   Production: PORTAL_ADMIN_KEY=mykey PORTAL_URL=https://jmcsolutions.ai node scripts/seed-essjay.js
 */

const ADMIN_KEY = process.env.PORTAL_ADMIN_KEY;
const BASE_URL = process.env.PORTAL_URL
  ? `${process.env.PORTAL_URL.replace(/\/$/, '')}/api/portal/admin`
  : `http://localhost:${process.env.PORTAL_PORT || 3001}/api/portal/admin`;

async function main() {
  if (!ADMIN_KEY) {
    console.error('Error: PORTAL_ADMIN_KEY env var is required.');
    process.exit(1);
  }

  console.log(`Connecting to: ${BASE_URL}\n`);

  // 1. Find the existing client
  const listRes = await fetch(`${BASE_URL}/clients`, { headers: { 'X-Admin-Key': ADMIN_KEY } });
  if (!listRes.ok) { console.error('Failed to list clients:', await listRes.text()); process.exit(1); }
  const { clients } = await listRes.json();
  const client = clients.find((c) => c.email === 'fin@jmcsolutions.ai');
  if (!client) { console.error('Client fin@jmcsolutions.ai not found.'); process.exit(1); }
  console.log(`Found: "${client.name}" (ID: ${client.id}) — ${client.email}`);

  // 2. Rename to Essjay Solutions
  if (client.name !== 'Essjay Solutions') {
    const r = await fetch(`${BASE_URL}/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
      body: JSON.stringify({ name: 'Essjay Solutions' }),
    });
    const d = await r.json();
    if (!r.ok) { console.error('Rename failed:', d.error); process.exit(1); }
    console.log(`✅ Renamed to: "${d.client.name}"`);
  } else {
    console.log('ℹ️  Already named "Essjay Solutions" — skipping rename.');
  }

  // 3. Add alias users
  const aliasUsers = [
    { name: 'Seema Jaitly',     email: 'seemajaitly@essjaysolutions.co.uk',      password: 'Testingpassword1!' },
    { name: 'Sabita Mukherjee', email: 'sabita.mukherjee@essjaysolutions.co.uk',  password: 'Testingpassword1!' },
  ];

  for (const user of aliasUsers) {
    const r = await fetch(`${BASE_URL}/clients/${client.id}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
      body: JSON.stringify(user),
    });
    const d = await r.json();
    if (!r.ok) {
      console.log(r.status === 409 ? `ℹ️  Already exists: ${user.email}` : `❌ Error adding ${user.email}: ${d.error}`);
    } else {
      console.log(`✅ Added: ${d.user.name} (${d.user.email})`);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => { console.error(err); process.exit(1); });

async function main() {
  if (!ADMIN_KEY) {
    console.error('Error: PORTAL_ADMIN_KEY env var is required.');
    console.error('Usage: PORTAL_ADMIN_KEY=mykey node scripts/seed-essjay.js');
    process.exit(1);
  }

  console.log('Creating Essjay Solutions account...\n');

  // 1. Create the primary account
  let clientId;
  try {
    const res = await fetch(`${BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
      body: JSON.stringify({
        name: 'Essjay Solutions',
        email: 'fin@jmcsolutions.ai',
        password: 'testpassword1!',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 409) {
        console.log('Primary account (fin@jmcsolutions.ai) already exists — skipping creation.');
        // Look up the existing client ID
        const listRes = await fetch(`${BASE_URL}/clients`, {
          headers: { 'X-Admin-Key': ADMIN_KEY },
        });
        const listData = await listRes.json();
        const existing = listData.clients?.find((c) => c.email === 'fin@jmcsolutions.ai');
        if (!existing) {
          console.error('Could not find existing client by email.');
          process.exit(1);
        }
        clientId = existing.id;
      } else {
        console.error(`Error creating primary account: ${data.error}`);
        process.exit(1);
      }
    } else {
      clientId = data.client.id;
      console.log(`✅ Primary account created: ${data.client.name} (ID: ${clientId})`);
      console.log(`   Email: ${data.client.email}`);
    }
  } catch (err) {
    console.error('Error: Could not connect to the portal server.');
    console.error(`Make sure it is running on port ${PORT}.`);
    process.exit(1);
  }

  // 2. Create alias users
  const aliasUsers = [
    { name: 'Seema Jaitly', email: 'seemajaitly@essjaysolutions.co.uk', password: 'testpassword1!' },
    { name: 'Sabita Mukherjee', email: 'sabita.mukherjee@essjaysolutions.co.uk', password: 'testpassword1!' },
  ];

  for (const user of aliasUsers) {
    try {
      const res = await fetch(`${BASE_URL}/clients/${clientId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          console.log(`   User ${user.email} already exists — skipping.`);
        } else {
          console.error(`   Error creating ${user.email}: ${data.error}`);
        }
      } else {
        console.log(`✅ Alias user created: ${data.user.name} (${data.user.email})`);
      }
    } catch (err) {
      console.error(`   Error creating ${user.email}: ${err.message}`);
    }
  }

  console.log('\nDone! All three users can now log in at /portal/login');
  console.log('They will all see the shared Essjay Solutions portal.\n');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
