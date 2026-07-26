/**
 * Simple in-memory sliding-window rate limiter. Suitable for single-instance
 * deployments (e.g. a single Node server / Docker container). For multi-instance
 * deployments, swap this out for a Redis-backed limiter.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60_000;

function sweep() {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

/**
 * Checks and increments the rate limit counter for a given key (e.g. IP address,
 * or `${ip}:${route}`). Returns whether the request is allowed.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  sweep();

  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, limit: options.limit, remaining: options.limit - 1, resetAt };
  }

  if (existing.count >= options.limit) {
    return { success: false, limit: options.limit, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Reset the counter for a given key (e.g. after a successful login). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

export const RATE_LIMITS = {
  contactForm: { limit: 5, windowMs: 10 * 60_000 },
  login: { limit: 8, windowMs: 15 * 60_000 },
} as const satisfies Record<string, RateLimitOptions>;

/** Extract a best-effort client identifier from a Next.js Request for rate limiting. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
