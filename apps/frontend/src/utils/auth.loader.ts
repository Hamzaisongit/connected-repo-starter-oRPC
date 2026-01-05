import { userContext } from "@frontend/contexts/UserContext";
import * as Sentry from "@sentry/react";
import type { LoaderFunctionArgs } from "react-router";

/**
 * Mock auth loader for unauthenticated routes
 * Returns mock session data for demo purposes
 */
export async function authLoader({ context }: LoaderFunctionArgs) {
	try {
		const sessionInfo = {
			hasSession: true,
			user: {
				email: "alex.johnson@example.com",
				name: "Alex Johnson",
				image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
				id: "mock-user-id-123",
			},
			isRegistered: true,
		};

		Sentry.setUser({
			email: sessionInfo.user.email,
			username: sessionInfo.user.name,
			id: sessionInfo.user.id
		})

		// Set user context in React Router context
		context.set(userContext, sessionInfo);

		// Return session data for loader
		return sessionInfo;

	} catch (error) {
		console.error("Auth loader error:", error);
		throw error;
	}
}
