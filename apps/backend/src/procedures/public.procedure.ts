import type { ActiveSessionSelectAll } from "@backend/modules/auth/tables/session.auth.table";
import type { UserSelectAll } from "@connected-repo/zod-schemas/user.zod";
import { os } from "@orpc/server";
import type { RequestHeadersPluginContext } from "@orpc/server/plugins";
import { sessionLogger } from "@backend/utils/session-logger.utils";
import z from "zod";

/**
 * @public
 */
export interface RpcContext extends RequestHeadersPluginContext {
	session?: ActiveSessionSelectAll;
	user?: UserSelectAll;
}

export interface RpcContextWithHeaders extends RpcContext {
	reqHeaders: Headers;
}

const rpcBaseOrpc = os.$context<RpcContext>()

// Public procedure with context
export const rpcPublicProcedure = rpcBaseOrpc
	.use(async ({ context, next, path }) => {
		const reqHeaders = context.reqHeaders ?? new Headers();
		const requestUserId = context.user?.id || 'unauthenticated';

		// Log request user-id
		sessionLogger.debug(`Request: ${path}`, context.session, {
			requestUserId,
			method: 'RPC',
			path
		});

		const result = await next({
			context: {
				...context,
				reqHeaders
			}
		});

		// Log response user-id (may differ if handler changes user context)
		const responseUserId = result.context?.user?.id || requestUserId;
		sessionLogger.debug(`Response: ${path}`, result.context?.session, {
			requestUserId,
			responseUserId,
			method: 'RPC',
			path
		});

		return result;
	})
	.errors({
		INPUT_VALIDATION_FAILED: {
			status: 422,
			data: z.object({
				formErrors: z.array(z.string()),
				fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
			}),
		},
		OUTPUT_VALIDATION_FAILED: {
			status: 500,
			data: z.object({
				formErrors: z.array(z.string()),
				fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
			}),
		},
		RATE_LIMITED: {
			status: 429,
		},
	});
