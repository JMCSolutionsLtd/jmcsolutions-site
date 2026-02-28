/**
 * JWT auth middleware — verifies Bearer token and attaches client to req.
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_use_a_long_random_string';
const JWT_EXPIRES_IN = '8h';

/**
 * Sign a JWT for a client.
 */
export function signToken(client, extra = {}) {
  return jwt.sign(
    { clientId: client.id, email: client.email, ...extra },
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
 * Attaches req.client = { clientId, email }.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.client = { clientId: payload.clientId, email: payload.email, isAdmin: !!payload.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
