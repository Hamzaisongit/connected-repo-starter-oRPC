import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { tbus } from "@backend/modules/events/tbus";
import { initiateWebhookCallService } from "@backend/modules/webhook_calls/services/initiate.webhook_calls.service";
import { cronJobAuthProcedure } from "@backend/procedures/cron_job_auth.procedure";
import { logger } from "@backend/utils/logger.utils";
import type { UserAdherenceLogSelectAll } from "@connected-repo/zod-schemas/user_adherence_log.zod";
import type { UserStackSelectAll } from "@connected-repo/zod-schemas/user_stack.zod";
import * as z from "zod";

const scheduleSupplementReminders = cronJobAuthProcedure
	.route({ method: "POST", tags: ["Cron Jobs"] })
	.output(
		z.object({
			usersProcessed: z.number(),
			eventsPublished: z.number(),
		})
	)
	.handler(async () => {
		logger.info("Starting supplement reminder cron job...");

		const now = new Date();
		const nowMs = now.getTime();
		const minutesInMs = 60 * 1000;
		const endMs = nowMs + minutesInMs;

		const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

		logger.info(
			{
				currentTime: now.toISOString(),
				dayOfWeek,
				timeWindowStart: new Date(nowMs).toISOString(),
				timeWindowEnd: new Date(endMs).toISOString(),
			},
			"Querying for supplement reminders due in next 15 minutes...",
		);

		const dueStacks = await db.userStacks
			.selectAll()
			.where({
				isActive: true,
			})
			.where(sql`${dayOfWeek} = ANY("days")`);

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
			"Found supplement stacks due in next 15 minutes",
		);

		const stacksByUser = (scheduledStacks ?? []).reduce((acc, stack) => {
			if (!stack?.userId) return acc;

			if (!acc[stack.userId]) {
				acc[stack.userId] = [];
			}
			acc[stack.userId]!.push(stack);
			return acc;
		}, {} as Record<string, UserStackSelectAll[]>);

		let eventsPublished = 0;

		for (const [userId, stacks] of Object.entries(stacksByUser)) {
			logger.info(
				{
					userId,
					stackCount: stacks.length,
				},
				"Publishing userstack.scheduled events for user...",
			);

			for (const stack of stacks) {
				try {
					if (!Array.isArray(stack.timesOfDay) || stack.timesOfDay.length === 0) {
						logger.info(
							{
								userId,
								stackId: stack.id,
								stackName: stack.name,
							},
							"Stack has no scheduled times, skipping",
						);
						continue;
					}

					const upcomingTimes = stack.timesOfDay.filter((time) => {
						const [hours, minutes] = time.split(":").map(Number);
						const timeMs = new Date(
							now.getFullYear(),
							now.getMonth(),
							now.getDate(),
							hours,
							minutes,
						).getTime();
						return timeMs >= nowMs && timeMs <= endMs;
					});

					if (upcomingTimes.length === 0) {
						logger.info(
							{
								userId,
								stackId: stack.id,
								stackName: stack.name,
							},
							"Stack has no times in the 15-minute window, skipping",
						);
						continue;
					}

					const earliestTime = upcomingTimes[0]!;
					const timeParts = earliestTime.split(":");
					if (timeParts.length !== 2) {
						logger.warn(
							{
								userId,
								stackId: stack.id,
								time: earliestTime,
							},
							"Invalid time format, skipping",
						);
						continue;
					}
					const h = Number(timeParts[0]);
					const m = Number(timeParts[1]);
					if (isNaN(h) || isNaN(m)) {
						logger.warn(
							{
								userId,
								stackId: stack.id,
								time: earliestTime,
							},
							"Invalid time numbers, skipping",
						);
						continue;
					}
					const hourNum = h % 12 === 0 ? 12 : h % 12;
					const ampm = h < 12 ? "AM" : "PM";
					const minute = m.toString().padStart(2, "0");
					const formattedTime = `${hourNum}:${minute} ${ampm}`;

					// Only publish if there is NOT an adherence log in this 15-min window for this stack/user
					const adherenceLog: UserAdherenceLogSelectAll[] = await db.userAdherenceLogs.where({
						userId: stack.userId,
						supplementId: stack.id,
						actualAt: {
							gte: new Date(nowMs),
							lt: new Date(endMs),
						},
					});

					if (adherenceLog.length > 0) {
						logger.info(
							{
								userId,
								stackId: stack.id,
								stackName: stack.name,
							},
							"Adherence log already exists for this stack/time in 15-min window, skipping event publish",
						);
						continue;
					}

					await tbus.publish({
						event_name: "userstack.scheduled",
						data: {
							userId: stack.userId,
							supplementName: stack.name,
							scheduledTime: formattedTime,
							scheduledFor: new Date(
								now.getFullYear(),
								now.getMonth(),
								now.getDate(),
								...earliestTime.split(":").map(Number),
							).getTime(),
						},
					});

					eventsPublished++;

					logger.info(
						{
							userId,
							stackId: stack.id,
							stackName: stack.name,
							scheduledTime: formattedTime,
						},
						"Published userstack.scheduled event",
					);
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					logger.error(
						{
							userId,
							stackId: stack.id,
							error: errorMessage,
						},
						"Failed to publish userstack.scheduled event",
					);
				}
			}
		}

		logger.info(
			{
				usersProcessed: Object.keys(stacksByUser).length,
				eventsPublished,
			},
			"Supplement reminder cron job completed",
		);

		return {
			usersProcessed: Object.keys(stacksByUser).length,
			eventsPublished,
		};
	});

const processWebhookCalls = cronJobAuthProcedure
	.route({ method: "POST", tags: ["Cron Jobs"] })
	.output(
		z.object({
			processed: z.number(),
		})
	)
	.handler(async () => {
		let cursor: { scheduledFor: number; webhookCallQueueId: string } | null = null;
		const batchSize = 100;
		let totalProcessed = 0;

		while (true) {
			const baseWhere = {
				scheduledFor: {
					lte: sql`NOW()`
				},
				status: {
					not: "Sent"
				},
				attempts: {
					lt: sql`"max_attempts"`
				}
			};

			let query = db.webhookCallQueues
				.selectAll()
				.where(baseWhere)
				.order({
					scheduledFor: "ASC",
					webhookCallQueueId: "ASC"
				})
				.limit(batchSize);

			if (cursor) {
				query = query.where(sql` (scheduled_for > ${cursor.scheduledFor} OR (scheduled_for = ${cursor.scheduledFor} AND webhook_call_queue_id > '${cursor.webhookCallQueueId}')) `);
			}

			const pendingCalls = await query;

			if (pendingCalls.length === 0) break;

			await Promise.all(pendingCalls.map(call => initiateWebhookCallService(call)));
			totalProcessed += pendingCalls.length;
			const lastCall = pendingCalls[pendingCalls.length - 1]!;
			cursor = {
				scheduledFor: lastCall.scheduledFor,
				webhookCallQueueId: lastCall.webhookCallQueueId
			};
		}

		return { processed: totalProcessed };
	});

export const cronJobsRouter = {
	"process-webhook-calls": processWebhookCalls,
	"schedule-supplement-reminders": scheduleSupplementReminders,
};
