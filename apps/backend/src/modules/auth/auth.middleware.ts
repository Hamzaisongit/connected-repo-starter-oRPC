import type { RpcContextWithHeaders } from '@backend/procedures/public.procedure';
import { getClientIpAddress } from '@backend/utils/client-info.utils';
import { sessionLogger } from '@backend/utils/session-logger.utils';
import { transformSessionAndUserData } from '@backend/utils/session.utils';
import { type MiddlewareNextFn, ORPCError } from '@orpc/server';
import * as Sentry from '@sentry/node';
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

	sessionLogger.debug('Session retrieval started', null, {
		cookieTokenPrefix: cookieToken?.substring(0, 8) || 'NONE',
		userAgent: reqHeaders.get('user-agent')?.substring(0, 100),
		ipAddress: getClientIpAddress(reqHeaders),
		cookieCacheEnabled: true,
		cookieCacheMaxAge: '5 minutes',
	});

	const sessionData = await auth.api.getSession({
		headers: reqHeaders,
	});

	const retrievalTime = Date.now() - startTime;

	if (!sessionData?.session.id || !sessionData?.user.id) {
		sessionLogger.warn('Session retrieval failed - no session data', null, {
			cookieTokenPrefix: cookieToken?.substring(0, 8) || 'NONE',
		});

		throw new ORPCError('UNAUTHORIZED', {
			status: 401,
			message: 'User is not authenticated'
		});
	}



	const { session, user } = transformSessionAndUserData(sessionData);

	// Detect likely cache hit: Fast retrieval (<5ms) AND no database breadcrumb logged
	// If database adapter logged a breadcrumb, it went to DB (cache miss)
	// If no DB breadcrumb and fast, it's likely a cache hit
	const likelyCacheHit = retrievalTime < 5;

	sessionLogger.debug('Session validated successfully', session, {
		retrievalTimeMs: retrievalTime,
		likelyCacheHit: likelyCacheHit,
		cacheNote: likelyCacheHit
			? 'Fast retrieval - likely from cookie cache'
			: 'Slower retrieval - likely from database',
	});

	// SESSION LEAKAGE DETECTION: Track session usage patterns
	// This helps detect if sessions are being used by unauthorized users
	const currentIP = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
	const currentUserAgent = reqHeaders.get('user-agent') || 'unknown';

	// Track session access from different IPs (suspicious activity)
		sessionLogger.debug('Session access pattern tracking', session, {
			accessIP: currentIP,
			accessUserAgent: currentUserAgent.substring(0, 100),
			// This will help detect if the same session is used from multiple locations
			sessionAccessFingerprint: `${currentIP}:${currentUserAgent.substring(0, 20)}`,
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