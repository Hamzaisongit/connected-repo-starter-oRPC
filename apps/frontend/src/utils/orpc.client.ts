import { env } from "@frontend/configs/env.config";
import { authClient } from "@frontend/utils/auth.client";
import { logSessionException } from "@frontend/utils/session-logger.utils";
import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { SimpleCsrfProtectionLinkPlugin } from '@orpc/client/plugins';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { toast } from "react-toastify";
import type { UserAppRouter, UserAppRouterInputs, UserAppRouterOutputs } from "../../../backend/src/routers/user_app.router";

interface ClientContext {
  something?: string
}

const link = new RPCLink<ClientContext>({
  url: `${env.VITE_API_URL}/user-app`,
  headers: ({ context }) => (
    { 
        Authorization: 'Bearer token',
        'x-api-key': context.something
    }
  ),
  fetch: (request, init, _options, _path, _input) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: 'include', // Include cookies for cross-origin requests
    })
  },
  interceptors: [
    onError(async (error) => {
      // Extract error info
      const err = error as { message?: string; status?: number; code?: string; path?: string; name?: string };
      const errorMessage = err.message || "An unexpected error occurred";
      
      // IMPORTANT: Ignore AbortErrors - these are normal in React Strict Mode (dev only)
      // React 19 double-mounts components in dev, causing queries to abort on first render
      if (err.name === "AbortError" || errorMessage.includes("signal is aborted")) {
        console.info("oRPC query aborted (React Strict Mode - this is normal in development)");
        return;
      }
      
      console.error("oRPC Error:", error);
      
      // Check if this is an authentication error (401 or 403)
      const isAuthError = 
        err.status === 401 || 
        err.status === 403 ||
        errorMessage.toLowerCase().includes("unauthorized") ||
        errorMessage.toLowerCase().includes("unauthenticated") ||
        errorMessage.toLowerCase().includes("authentication required");
      
      // Record error with session logging
      logSessionException(error instanceof Error ? error : new Error(String(error)), {
        errorType: "oRPC",
        statusCode: err.status,
        errorCode: err.code,
        errorMessage,
        errorPath: err.path,
        isAuthError,
      }, `oRPC Error: ${errorMessage}`);
      
      // Only show toast for non-auth errors or persistent auth errors
      // Don't show toast on initial 401s which might be timing issues during page load
      toast.error(errorMessage);
      
      // For auth errors, redirect to login ONLY if we're on a protected route
      // This prevents redirecting during initial load race conditions
      if (isAuthError) {
        
        // Sign out and redirect to login
        try {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                window.location.href = "/auth/login";
              },
              onError: (ctx) => {
                console.error("Logout error:", ctx.error);
                // Force redirect even if logout fails
                window.location.href = "/auth/login";
              }
            }
          });
        } catch (logoutError) {
          console.error("Failed to logout:", logoutError);
          // Force redirect even if logout fails
          window.location.href = "/auth/login";
        }
      }
    })
  ],
  plugins: [
     new SimpleCsrfProtectionLinkPlugin(),
  ]
})

export const orpcFetch: UserAppRouter = createORPCClient(link);

export const orpc = createTanstackQueryUtils(orpcFetch);
/**
 * @public
 */
export type UserAppBackendInputs = UserAppRouterInputs;
/**
 * @public
 */
export type UserAppBackendOutputs = UserAppRouterOutputs;

