import { db } from "@backend/db/db";
import { subscriptionOpenApiRouter } from "@backend/modules/subscriptions/subscription.router";
import { openApiPublicProcedure } from "@backend/procedures/open_api_public.procedure";
import { testRemindersRouter } from "./test_reminders.router";
import { isSupplementReminderCronRunning } from "@backend/modules/cron/supplement_reminder.cron";
import * as z from "zod";
import { teamRouter } from "../modules/teams/team.router";

// Health check endpoint for OpenAPI (public - no auth required)
const healthCheck = openApiPublicProcedure
	.route({ method: "GET", path: "/health", tags: ["Health"] })
	.output(
		z.object({
			status: z.string(),
			timestamp: z.string(),
			database: z.string(),
			cronJob: z.string(),
			error: z.string().optional(),
		})
	)
	.handler(async () => {
		try {
			// Test database connection by running a simple query
			await db.$query`SELECT 1`;
			const databaseStatus = "ok";

			// Check cron job status
			const cronStatus = isSupplementReminderCronRunning() ? "running" : "stopped";

			return {
				status: "ok",
				timestamp: new Date().toISOString(),
				database: databaseStatus,
				cronJob: cronStatus,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown database error";
			return {
				status: "error",
				timestamp: new Date().toISOString(),
				database: "error",
				cronJob: "unknown",
				error: errorMessage,
			};
		}
	});

export const openApiRouter = {
	health: healthCheck,
	test: testRemindersRouter,
	v1: {
		subscriptions: subscriptionOpenApiRouter,
		team: teamRouter,
	},
};
