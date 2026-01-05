import type { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";
import { createContext, useOutletContext } from "react-router";

export interface SessionInfo {
	hasSession: boolean;
	user: UserSelectAll | null;
	isRegistered: boolean;
}

/**
 * React Router context for user session data
 * Set by authLoader before components render
 * Used for loader-to-loader context sharing
 */
export const userContext = createContext<SessionInfo | null>(null);

/**
 * Hook to access session data in components
 * Session data is provided by AppLayout via Outlet context
 *
 * @returns SessionInfo object with user data and session state, or null if not set
 */
export function useSessionInfo(): SessionInfo | null {
	try {
		const sessionInfo = useOutletContext<SessionInfo>();
		return sessionInfo || null;
	} catch {
		return null;
	}
}
