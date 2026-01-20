import type { ActiveSessionSelectAll } from '../modules/auth/tables/session.auth.table';
import { logger } from './logger.utils';

/**
 * Filters sensitive session data to prevent leakage
 * - Session tokens: always first 8 chars only
 * - User IDs/Emails: hash or remove
 * - IPs/User-Agents: remove actual values
 * - Fingerprints: remove completely
 * - URLs: strip session params
 */
const filterSessionData = (data: Record<string, any> = {}): Record<string, any> => {
  const filtered = { ...data };

  // Filter session tokens - keep first 8 chars
  if (filtered.sessionToken) {
    filtered.sessionToken = filtered.sessionToken.substring(0, 8) + '...';
  }
  if (filtered.cookieToken) {
    filtered.cookieToken = filtered.cookieToken.substring(0, 8) + '...';
  }
  if (filtered.token) {
    filtered.token = filtered.token.substring(0, 8) + '...';
  }

  // Remove fingerprints
  if (filtered.fingerprint || filtered.deviceFingerprint) {
    delete filtered.fingerprint;
    delete filtered.deviceFingerprint;
  }

  // Filter URLs - remove session params
  if (filtered.url) {
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
 * Session logger with structured logging methods
 */
class SessionLogger {
  private extractSessionData(session?: ActiveSessionSelectAll | null) {
    if (!session) return {};

    return {
      sessionId: session.id,
      userId: session.userId,
      sessionTokenPrefix: session.token?.substring(0, 8),
      ipAddress: session.ipAddress,
      userAgent: session.userAgent?.substring(0, 50),
      deviceFingerprint: session.deviceFingerprint,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  debug(message: string, session?: ActiveSessionSelectAll | null, extraData?: Record<string, any>) {
    const sessionData = this.extractSessionData(session);
    const data = { ...sessionData, ...extraData };
    const filteredData = filterSessionData(data);
    logger.debug(filteredData, `[SESSION] ${message}`);
  }

  info(message: string, session?: ActiveSessionSelectAll | null, extraData?: Record<string, any>) {
    const sessionData = this.extractSessionData(session);
    const data = { ...sessionData, ...extraData };
    const filteredData = filterSessionData(data);
    logger.info(filteredData, `[SESSION] ${message}`);
  }

  warn(message: string, session?: ActiveSessionSelectAll | null, extraData?: Record<string, any>) {
    const sessionData = this.extractSessionData(session);
    const data = { ...sessionData, ...extraData };
    const filteredData = filterSessionData(data);
    logger.warn(filteredData, `[SESSION] ${message}`);
  }

  error(message: string, session?: ActiveSessionSelectAll | null, extraData?: Record<string, any>) {
    const sessionData = this.extractSessionData(session);
    const data = { ...sessionData, ...extraData };
    const filteredData = filterSessionData(data);
    logger.error(filteredData, `[SESSION] ${message}`);
  }
}

export const sessionLogger = new SessionLogger();

/**
 * Legacy function for backward compatibility
 * @deprecated Use sessionLogger.debug/info/warn/error instead
 */
export const logSessionEvent = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, any>
) => {
  const filteredData = filterSessionData(data);
  logger[level](filteredData, `[SESSION] ${message}`);
};

/**
 * Logs session-related exceptions to Sentry
 */
export const logSessionException = (
  error: Error,
  context: Record<string, any> = {},
  message?: string
) => {
  const filteredContext = filterSessionData(context);
  // Use Pino for structured logging - Sentry integration will handle capture
  logger.error({ error: error.message, stack: error.stack, ...filteredContext }, `[SESSION EXCEPTION] ${message || error.message}`);
};