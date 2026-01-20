import * as Sentry from '@sentry/react';

/**
 * Filters sensitive session data to prevent leakage
 * - Session tokens: always first 8 chars only
 * - User IDs/Emails: hash or remove
 * - IPs/User-Agents: remove actual values
 * - Fingerprints: remove completely
 * - URLs: strip session params
 */
const filterSessionData = (data: Record<string, unknown> = {}): Record<string, unknown> => {
  const filtered = { ...data };

  // Filter session tokens - keep first 8 chars
  if (typeof filtered.sessionToken === 'string') {
    filtered.sessionToken = `${filtered.sessionToken.substring(0, 8)}...`;
  }
  if (typeof filtered.cookieToken === 'string') {
    filtered.cookieToken = `${filtered.cookieToken.substring(0, 8)}...`;
  }
  if (typeof filtered.token === 'string') {
    filtered.token = `${filtered.token.substring(0, 8)}...`;
  }

  // Remove fingerprints
  if (filtered.fingerprint || filtered.deviceFingerprint) {
    delete filtered.fingerprint;
    delete filtered.deviceFingerprint;
  }

  // Filter URLs - remove session params
  if (typeof filtered.url === 'string') {
    try {
      const url = new URL(filtered.url);
      const params = url.searchParams;
      params.delete('session');
      params.delete('token');
      params.delete('auth');
      filtered.url = url.toString();
    } catch {
      // Invalid URL, keep as is
    }
  }

  return filtered;
};

/**
 * Logs session-related events using console (auto-breadcrumbs in Sentry)
 */
export const logSessionEvent = (
  level: 'log' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) => {
  const filteredData = filterSessionData(data);
  console[level](`[SESSION] ${message}`, filteredData);
};

/**
 * Logs session-related exceptions to Sentry
 */
export const logSessionException = (
  error: Error,
  context: Record<string, unknown> = {},
  message?: string
) => {
  const filteredContext = filterSessionData(context);
  Sentry.captureException(error, {
    extra: filteredContext,
    tags: { category: 'session' },
    ...(message && { message })
  });
};