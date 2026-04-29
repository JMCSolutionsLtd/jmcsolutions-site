/**
 * JWT auth middleware — verifies Bearer token and attaches client to req.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_use_a_long_random_string';
const JWT_EXPIRES_IN = process.env.PORTAL_JWT_EXPIRES_IN || '8h';

/**
 * Sign a JWT for a client.
 *
 * `client` carries the parent-account context (`id`, `name`, `email`).
 * For alias users, pass `userType: 'alias'` and `userId: <client_users.id>` —
 * `email` should still be the alias user's login email so the response/UI
 * reflects who is logged in.
 *
 * For backwards compatibility: callers that pass only `{ id, name, email }`
 * (e.g. admin impersonate) get `userType: 'primary'` and `userId: id`.
 */
export function signToken(client, extra = {}) {
  return jwt.sign(
    {
      clientId: client.id,
      email: client.email,
      userType: client.userType || 'primary',
      userId: client.userId || client.id,
      ...extra,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Express middleware — rejects requests without a valid token.
 * Attaches req.client = { clientId, email, userType, userId, isAdmin }.
 *
 * `userType` is 'primary' or 'alias'. For alias users, `userId` is the
 * `client_users.id`; for primary users, `userId === clientId`.
 * Tokens issued before per-user MFA default to 'primary' so existing
 * sessions keep working.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.client = {
      clientId: payload.clientId,
      email: payload.email,
      userType: payload.userType || 'primary',
      userId: payload.userId || payload.clientId,
      isAdmin: !!payload.isAdmin,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
