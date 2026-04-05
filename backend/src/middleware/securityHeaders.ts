import { Request, Response, NextFunction } from 'express';

/**
 * Sets hardened security headers on every response.
 * Register this early in the middleware chain, before routes.
 */
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent rendering in frames (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // HSTS — only sent when running over HTTPS / in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Limit information revealed about the server
  res.removeHeader('X-Powered-By');

  // Basic XSS protection for legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Restrict referrer information sent cross-origin
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
}
