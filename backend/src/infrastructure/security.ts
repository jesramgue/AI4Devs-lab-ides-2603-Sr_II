import path from 'path';

/**
 * Strips potentially dangerous characters from a user-supplied string.
 * Removes null bytes, HTML tags, and trims surrounding whitespace.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, '')          // null bytes
    .replace(/<[^>]*>/g, '')     // HTML tags (basic XSS prevention)
    .trim();
}

/**
 * Sanitizes a filename or relative path segment to prevent directory traversal.
 * Returns only the basename so callers can safely join it with the upload dir.
 */
export function sanitizePath(filePath: string): string {
  // Take only the filename; strip any directory components
  const basename = path.basename(filePath);
  // Remove any remaining path separators and null bytes
  return basename.replace(/[/\\]/g, '').replace(/\0/g, '');
}

/**
 * Sanitizes all string fields in a plain-object payload in-place.
 */
export function sanitizePayload<T extends Record<string, unknown>>(
  payload: T
): T {
  for (const key of Object.keys(payload) as (keyof T)[]) {
    const value = payload[key];
    if (typeof value === 'string') {
      (payload as Record<string, unknown>)[key as string] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      (payload as Record<string, unknown>)[key as string] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizePayload(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitizePayload(value as Record<string, unknown>);
    }
  }
  return payload;
}
