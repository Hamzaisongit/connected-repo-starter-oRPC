import { userContext } from "@frontend/contexts/UserContext";
import { authClient } from "@frontend/utils/auth.client";
import * as Sentry from "@sentry/react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

/**
 * Auth loader for protected routes
 * Fetches session, sets React Router context, and redirects based on auth state
 */
export async function authLoader({ context }: LoaderFunctionArgs) {
	try {
		// Check what cookies exist in the browser
		const cookies = document.cookie;
		const sessionTokenMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
		const sessionToken = sessionTokenMatch?.[1];
		
		// Check localStorage/sessionStorage for any cached data
		const localStorageKeys = Object.keys(localStorage);
		const sessionStorageKeys = Object.keys(sessionStorage);
		
		Sentry.addBreadcrumb({
			category: 'auth',
			message: 'Frontend: Auth loader started - checking browser state',
			level: 'info',
			data: {
				hasSessionCookie: !!sessionToken,
				sessionTokenPrefix: sessionToken?.substring(0, 8) || 'NONE',
				cookieCount: cookies.split(';').filter(c => c.trim()).length,
				localStorageKeys: localStorageKeys.filter(k => k.includes('auth') || k.includes('session')),
				sessionStorageKeys: sessionStorageKeys.filter(k => k.includes('auth') || k.includes('session')),
				userAgent: navigator.userAgent.substring(0, 100),
				timestamp: new Date().toISOString(),
			},
		});

		// Fetch session from better-auth client
		const { data: session, error } = await authClient.getSession();

		if (error || !session) {
			Sentry.addBreadcrumb({
				category: 'auth',
				message: 'Frontend: Session fetch failed - redirecting to login',
				level: 'warning',
				data: {
					error: error?.message || 'No session data',
					hadCookie: !!sessionToken,
					cookieTokenPrefix: sessionToken?.substring(0, 8) || 'NONE',
				},
			});

			throw redirect("/auth/login");
		}

		// CRITICAL: Validate that session token from authClient matches cookie
		const retrievedToken = session.session.token;
		const cookieTokenFull = sessionToken;
		
		if (cookieTokenFull && retrievedToken !== cookieTokenFull) {
			Sentry.captureException(new Error('FRONTEND SESSION TOKEN MISMATCH'), {
				level: 'fatal',
				tags: {
					error_type: 'frontend_session_token_mismatch',
				},
				contexts: {
					sessionMismatch: {
						cookieTokenPrefix: cookieTokenFull.substring(0, 8),
						retrievedTokenPrefix: retrievedToken.substring(0, 8),
						cookieTokenFull: cookieTokenFull,
						retrievedTokenFull: retrievedToken,
						retrievedUserId: session.user.id,
						retrievedUserEmail: session.user.email,
						retrievedSessionId: session.session.id,
					},
				},
			});
		}

		Sentry.addBreadcrumb({
			category: 'auth',
			message: 'Frontend: Session retrieved successfully',
			level: 'info',
			data: {
				userId: session.user.id,
				userEmail: session.user.email,
				sessionDbId: session.session.id,
				// Use 'session_id' instead of 'token' to avoid Sentry scrubbing
				sessionId_first8: session.session.token.substring(0, 8),
				expiresAt: new Date(session.session.expiresAt).toISOString(),
				cookieSessionMatches: !cookieTokenFull || (retrievedToken === cookieTokenFull),
				// SESSION LEAKAGE: Track if new users have unexpected cookies
				sessionState: {
					hasCookie: !!sessionToken,
					hasLocalStorage: localStorageKeys.some(k => k.includes('awc')),
					// Flag if user might be seeing someone else's session
					potentialLeakage: !sessionToken && localStorageKeys.some(k => k.includes('awc.session')),
				},
			},
		});

		const sessionInfo = {
			hasSession: true,
			user: session.user,
			isRegistered: true, // better-auth handles registration
		};

		Sentry.setUser({
			email: session.user.email,
			username: session.user.name,
			id: session.user.id
		})

		// Set user context in React Router context
		context.set(userContext, sessionInfo);

		// Return session data for loader
		return sessionInfo;

	} catch (error) {
		Sentry.captureException(error, {
			tags: {
				error_type: 'auth_loader_error',
			},
		});
		throw redirect("/auth/login");
	}
}
