/**
 * Simple in-memory rate limiter for login endpoint.
 * Limits to MAX_ATTEMPTS per windowMs per IP.
 */
const store = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

export function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!store.has(ip)) {
    store.set(ip, []);
  }

  // Remove expired entries
  const attempts = store.get(ip).filter((t) => now - t < WINDOW_MS);
  store.set(ip, attempts);

  if (attempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
    });
  }

  attempts.push(now);
  next();
}

// Periodically clean up old entries (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, attempts] of store) {
    const valid = attempts.filter((t) => now - t < WINDOW_MS);
    if (valid.length === 0) store.delete(ip);
    else store.set(ip, valid);
  }
}, 5 * 60 * 1000);
