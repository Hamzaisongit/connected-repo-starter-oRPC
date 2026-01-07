import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { logger } from "@backend/utils/logger.utils";
import { tbus } from "@backend/modules/events/tbus";
import { openApiPublicProcedure } from "@backend/procedures/open_api_public.procedure";
import * as z from "zod";

const testScheduleReminders = openApiPublicProcedure
	.route({ method: "GET", tags: ["Testing - Reminders"] })
	.output(
		z.object({
			usersProcessed: z.number(),
			eventsPublished: z.number(),
			debugInfo: z.object({
				currentTime: z.string(),
				timeWindowStart: z.string(),
				timeWindowEnd: z.string(),
				dayOfWeek: z.string(),
				dueStacksCount: z.number(),
				timeWindowMinutes: z.number(),
			}),
		})
	)
	.handler(async () => {
		logger.info("TEST: Starting supplement reminder trigger...");

		const now = new Date();
		const nowMs = now.getTime();
		const minutesInMs = 15 * 60 * 1000;
		const endMs = nowMs + minutesInMs;

		const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

		logger.info(
			{
				currentTime: now.toISOString(),
				dayOfWeek,
				timeWindowStart: new Date(nowMs).toISOString(),
				timeWindowEnd: new Date(endMs).toISOString(),
			},
			"TEST: Querying for supplement reminders due in next 15 minutes...",
		);

		const dueStacks = await db.userStacks
			.selectAll()
			.where({
				isActive: true,
			})
			.where(sql`days @> ARRAY[${dayOfWeek}]`);

		const scheduledStacks = (dueStacks ?? []).filter(stack => {
			return stack?.timesOfDay?.some(time => {
				const [hours, minutes] = time.split(":").map(Number);
				const timeMs = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					hours,
					minutes,
				).getTime();
				return timeMs >= nowMs && timeMs <= endMs;
			}) ?? false;
		});

		logger.info(
			{
				dueStacksCount: scheduledStacks.length,
			},
			"TEST: Found supplement stacks due in next 15 minutes",
		);

		const stacksByUser = (scheduledStacks ?? []).reduce((acc, stack) => {
			if (!stack?.userId) return acc;

			if (!acc[stack.userId]) {
				acc[stack.userId] = [];
			}
			(acc[stack.userId] as any).push(stack);
			return acc;
		}, {} as Record<string, any>);

		let eventsPublished = 0;

		logger.info(
			{
				totalUsers: Object.keys(stacksByUser).length,
			},
			"TEST: Users with due supplements",
		);

		for (const [userId, stacks] of Object.entries(stacksByUser)) {
			logger.info(
				{
					userId,
					stackCount: (stacks as any[]).length,
				},
				"TEST: Publishing userstack.scheduled event for user...",
			);

			for (const stack of stacks as any[]) {
				try {
					await tbus.publish({
						event_name: "userstack.scheduled",
						data: {
							userId: stack.userId,
							stackId: stack.id,
							stackName: stack.name,
							supplements: [
								{
									id: stack.id,
									name: stack.name,
									dosage: Number(stack.dosage),
									unit: stack.unit,
									timeOfDay: stack.timesOfDay[0],
									instructions: stack.instructions,
								},
							],
							scheduledFor: (stack.timesOfDay ?? []).reduce((earliest: number, time: string) => {
								const [hours, minutes] = time.split(":").map(Number);
								const timeMs = new Date(
									now.getFullYear(),
									now.getMonth(),
									now.getDate(),
									hours,
									minutes,
								).getTime();
								return timeMs < earliest ? timeMs : earliest;
							}, Infinity),
						},
					});

					eventsPublished++;

					logger.info(
						{
							userId,
							stackId: stack.id,
							stackName: stack.name,
						},
						"TEST: Published userstack.scheduled event",
					);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					logger.error(
						{
							userId,
							stackId: stack.id,
							error: errorMessage,
						},
						"TEST: Failed to publish userstack.scheduled event",
					);
				}
			}
		}

		logger.info(
			{
				usersProcessed: Object.keys(stacksByUser).length,
				eventsPublished,
			},
			"TEST: Supplement reminder trigger completed",
		);

		return {
			usersProcessed: Object.keys(stacksByUser).length,
			eventsPublished,
			debugInfo: {
				currentTime: now.toISOString(),
				timeWindowStart: new Date(nowMs).toISOString(),
				timeWindowEnd: new Date(endMs).toISOString(),
				dayOfWeek,
				dueStacksCount: scheduledStacks.length,
				timeWindowMinutes: 15,
			},
		};
	});

export const testRemindersRouter = {
	"trigger-reminder-test": testScheduleReminders,
};
