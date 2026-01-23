import { userContext } from "@frontend/contexts/UserContext";
import { authClient } from "@frontend/utils/auth.client";
import { logSessionEvent, logSessionException } from "@frontend/utils/session-logger.utils";
import { detectUserTimezone } from "@frontend/utils/timezone.utils";
import * as Sentry from "@sentry/react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { toast } from "react-toastify";

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
		
		logSessionEvent('log', 'Frontend: Auth loader started - checking browser state', {
			hasSessionCookie: !!sessionToken,
			sessionTokenPrefix: sessionToken?.substring(0, 8) || 'NONE',
			cookieCount: cookies.split(';').filter(c => c.trim()).length,
			localStorageKeys: localStorageKeys.filter(k => k.includes('auth') || k.includes('session')),
			sessionStorageKeys: sessionStorageKeys.filter(k => k.includes('auth') || k.includes('session')),
			userAgent: navigator.userAgent.substring(0, 100),
			timestamp: new Date().toISOString(),
		});

		// Fetch session from better-auth client
		const { data: session, error } = await authClient.getSession();

		if (error || !session) {
			logSessionEvent('warn', 'Frontend: Session fetch failed - redirecting to login', {
				error: error?.message || 'No session data',
				hadCookie: !!sessionToken,
				cookieTokenPrefix: sessionToken?.substring(0, 8) || 'NONE',
			});

			throw redirect("/auth/login");
		}

		// CRITICAL: Validate that session token from authClient matches cookie
		const retrievedToken = session.session.token;
		const cookieTokenFull = sessionToken;
		
		if (cookieTokenFull && retrievedToken !== cookieTokenFull) {
			logSessionException(new Error('FRONTEND SESSION TOKEN MISMATCH'), {
				cookieTokenPrefix: cookieTokenFull.substring(0, 8),
				retrievedTokenPrefix: retrievedToken.substring(0, 8),
				cookieTokenFull: cookieTokenFull,
				retrievedTokenFull: retrievedToken,
				retrievedUserId: session.user.id,
				retrievedUserEmail: session.user.email,
				retrievedSessionId: session.session.id,
				error_type: 'frontend_session_token_mismatch',
			}, 'Frontend session token mismatch detected');
		}

		logSessionEvent('log', 'Frontend: Session retrieved successfully', {
			userId: session.user.id,
			userEmail: session.user.email,
			sessionId: session.session.id,
			sessionTokenPrefix: session.session.token.substring(0, 8),
			expiresAt: new Date(session.session.expiresAt).toISOString(),
			cookieTokenMatches: !cookieTokenFull || (retrievedToken === cookieTokenFull),
			// SESSION LEAKAGE: Track if new users have unexpected cookies
			sessionState: {
				hasCookie: !!sessionToken,
				hasLocalStorage: localStorageKeys.some(k => k.includes('awc')),
				// Flag if user might be seeing someone else's session
				potentialLeakage: !sessionToken && localStorageKeys.some(k => k.includes('awc.session')),
			},
		});

		// Timezone Detection and Auto-Update
		try {
			const detectedTimezone = await detectUserTimezone();
			if (detectedTimezone && detectedTimezone !== session.user.timezone) {
				toast.info(`Timezone change detected. Updating timezone to match your current location.`, {
					position: "top-center",
					autoClose: 1000,
				});
				logSessionEvent('log', 'Frontend: Timezone update initiated', {
					userId: session.user.id,
					currentTimezone: session.user.timezone,
					detectedTimezone: detectedTimezone,
				});

				await authClient.updateUser({ timezone: detectedTimezone });

				logSessionEvent('log', 'Frontend: Timezone updated successfully', {
					userId: session.user.id,
					newTimezone: detectedTimezone,
				});

				// Update the session user object with the new timezone
				session.user.timezone = detectedTimezone;

				// Show toast notification
				toast.success(`Your timezone has been updated to match your current location`, {
					position: "top-center",
					autoClose: 3000,
				});
			}
		} catch (timezoneError) {
			logSessionException(timezoneError instanceof Error ? timezoneError : new Error(String(timezoneError)), {
				error_type: 'timezone_detection_failed',
				userId: session.user.id,
			}, 'Timezone detection failed');
			// Continue without failing the auth flow
		}

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
		logSessionException(error instanceof Error ? error : new Error(String(error)), {
			error_type: 'auth_loader_error',
		}, 'Auth loader error');
		throw redirect("/auth/login");
	}
}
