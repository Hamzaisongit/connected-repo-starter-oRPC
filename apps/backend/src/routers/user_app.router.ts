import { userAdherenceLogsRouter } from '@backend/modules/logs/user_adherence_logs.user_app.router'
import { dailyCompliancesRouter } from '@backend/modules/streaks/daily_compliances.user_app.router'
import { userStackRouter } from '@backend/modules/user_stacks/user_stack.user_app.router'
import { userStatsRouter } from '@backend/modules/users/user_stats.user_app.router'
import { ProfileRouter } from '@backend/modules/users/users.user_app.router'
import { rpcPublicProcedure } from '@backend/procedures/public.procedure'
import type { InferRouterInputs, InferRouterOutputs, RouterClient } from '@orpc/server'

// Phase 1: Basic health check and testing endpoints
// Modules will be added in later phases

// Health check endpoint
const healthCheck = rpcPublicProcedure
	.route({ method: 'GET' })
	.handler(async () => {
		return {
			status: 'ok',
			timestamp: new Date().toISOString(),
			phase: 1,
			message: 'Phase 1: Core Infrastructure - oRPC server is running',
		}
	})
	
export const userAppRouter = {
	health: healthCheck,
	profile: ProfileRouter,
	userStacks: userStackRouter,
	userAdherenceLogs: userAdherenceLogsRouter,
	dailyCompliances: dailyCompliancesRouter,
	userStats: userStatsRouter,
};

export type UserAppRouter = RouterClient<typeof userAppRouter>;
export type UserAppRouterInputs = InferRouterInputs<typeof userAppRouter>
export type UserAppRouterOutputs = InferRouterOutputs<typeof userAppRouter>;
