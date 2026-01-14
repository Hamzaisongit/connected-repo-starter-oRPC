import * as Sentry from '@sentry/node';
import type { RpcContextWithHeaders } from '@backend/procedures/public.procedure';
import { transformSessionAndUserData } from '@backend/utils/session.utils';
import { type MiddlewareNextFn, ORPCError } from '@orpc/server';
import { auth } from './auth.config';

export const rpcAuthMiddleware = async ({ 
	context, 
	next 
}: {
	context: RpcContextWithHeaders, 
	next: MiddlewareNextFn<unknown>
}) => {
	const reqHeaders = context.reqHeaders;

	// Extract cookie for debugging
	const cookieHeader = reqHeaders.get('cookie') || '';
	const sessionTokenMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
	const cookieToken = sessionTokenMatch?.[1];

	// Track timing to help detect cache hits (cache should be <5ms, DB ~10-50ms)
	const startTime = Date.now();

	Sentry.addBreadcrumb({
		category: 'auth',
		message: 'Session retrieval started',
		level: 'info',
		data: {
			cookieTokenPrefix: cookieToken?.substring(0, 8) || 'NONE',
			userAgent: reqHeaders.get('user-agent')?.substring(0, 100),
			ipAddress: reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown',
			cookieCacheEnabled: true,
			cookieCacheMaxAge: '5 minutes',
		},
	});

	const sessionData = await auth.api.getSession({
		headers: reqHeaders,
	});

	const retrievalTime = Date.now() - startTime;

	if (!sessionData?.session.id || !sessionData?.user.id) {
		Sentry.addBreadcrumb({
			category: 'auth',
			message: 'Session retrieval failed - no session data',
			level: 'warning',
			data: {
				cookieTokenPrefix: cookieToken?.substring(0, 8) || 'NONE',
			},
		});

		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'User is not authenticated'
		});
	}

	// CRITICAL: Validate session token matches cookie
	if (cookieToken && sessionData.session.token !== cookieToken) {
		Sentry.captureException(new Error('SESSION TOKEN MISMATCH DETECTED'), {
			level: 'fatal',
			tags: {
				error_type: 'session_token_mismatch',
			},
			contexts: {
				sessionMismatch: {
					cookieTokenPrefix: cookieToken.substring(0, 8),
					retrievedTokenPrefix: sessionData.session.token.substring(0, 8),
					cookieTokenFull: cookieToken,
					retrievedTokenFull: sessionData.session.token,
					retrievedUserId: sessionData.user.id,
					retrievedUserEmail: sessionData.user.email,
					retrievedSessionId: sessionData.session.id,
				},
			},
		});

		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'Session validation failed - token mismatch'
		});
	}

	const { session, user } = transformSessionAndUserData(sessionData);

	// Detect likely cache hit: Fast retrieval (<5ms) AND no database breadcrumb logged
	// If database adapter logged a breadcrumb, it went to DB (cache miss)
	// If no DB breadcrumb and fast, it's likely a cache hit
	const likelyCacheHit = retrievalTime < 5;

	Sentry.addBreadcrumb({
		category: 'auth',
		message: 'Session validated successfully',
		level: 'info',
		data: {
			sessionDbId: session.id,
			userId: user.id,
			userEmail: user.email,
			// Use 'session_id' instead of 'token' to avoid Sentry scrubbing
			sessionId_first8: session.token.substring(0, 8),
			expiresAt: new Date(session.expiresAt).toISOString(),
			retrievalTimeMs: retrievalTime,
			likelyCacheHit: likelyCacheHit,
			cacheNote: likelyCacheHit
				? 'Fast retrieval - likely from cookie cache'
				: 'Slower retrieval - likely from database',
		},
	});

	// SESSION LEAKAGE DETECTION: Track session usage patterns
	// This helps detect if sessions are being used by unauthorized users
	const currentIP = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
	const currentUserAgent = reqHeaders.get('user-agent') || 'unknown';

	// Track session access from different IPs (suspicious activity)
	Sentry.addBreadcrumb({
		category: 'auth',
		message: 'Session access pattern tracking',
		level: 'debug',
		data: {
			sessionDbId: session.id,
			userId: user.id,
			accessIP: currentIP,
			accessUserAgent: currentUserAgent.substring(0, 100),
			// This will help detect if the same session is used from multiple locations
			sessionAccessFingerprint: `${currentIP}:${currentUserAgent.substring(0, 20)}`,
		},
	});

	// Set user context in Sentry for this request
	Sentry.setUser({
		id: user.id,
		email: user.email,
		username: user.name,
	});

	return next({
		context: {
			...context,
			session,
			user,
		},
	});
};