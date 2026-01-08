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
		const minutesInMs = 60 * 1000; // 1 minute window
		const endMs = nowMs + minutesInMs;

		const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });

		logger.info(
			{
				currentTime: now.toISOString(),
				dayOfWeek,
				timeWindowStart: new Date(nowMs).toISOString(),
				timeWindowEnd: new Date(endMs).toISOString(),
			},
			"Querying for supplement reminders due in next 1 minute...",
		);

		const dueStacks = await db.userStacks
			.selectAll()
			.where({
				isActive: true,
			})
			.where(sql`${dayOfWeek} = ANY("days")`);

		// Find all stacks with times in the 1-minute window
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
			"Found supplement stacks due in next 1 minute",
		);

		// Group stacks by user and then by exact scheduled time
		const supplementsByUserAndTime = (scheduledStacks ?? []).reduce((acc, stack) => {
			if (!stack?.userId || !Array.isArray(stack.timesOfDay)) return acc;

			const upcomingTimes = stack.timesOfDay.filter(time => {
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

			if (upcomingTimes.length === 0) return acc;

			if (!acc[stack.userId]) {
				acc[stack.userId] = {};
			}

			for (const timeStr of upcomingTimes) {
				const timeParts = timeStr.split(":");
				if (timeParts.length !== 2) continue;

				const h = Number(timeParts[0]);
				const m = Number(timeParts[1]);
				if (isNaN(h) || isNaN(m)) continue;

				const hourNum = h % 12 === 0 ? 12 : h % 12;
				const ampm = h < 12 ? "AM" : "PM";
				const minute = m.toString().padStart(2, "0");
				const formattedTime = `${hourNum}:${minute} ${ampm}`;

				if (!acc[stack.userId]![formattedTime]) {
					acc[stack.userId]![formattedTime] = [];
				}

				acc[stack.userId]![formattedTime]!.push({
					stack,
					scheduledTime: formattedTime,
					scheduledTimeMs: new Date(
						now.getFullYear(),
						now.getMonth(),
						now.getDate(),
						h,
						m,
					).getTime(),
				});
			}

			return acc;
		}, {} as Record<string, Record<string, Array<{
			stack: UserStackSelectAll;
			scheduledTime: string;
			scheduledTimeMs: number;
		}>>>);

		let eventsPublished = 0;

		for (const [userId, timeGroups] of Object.entries(supplementsByUserAndTime)) {
			logger.info(
				{
					userId,
					timeGroupsCount: Object.keys(timeGroups).length,
				},
				"Publishing consolidated userstack.scheduled events for user...",
			);

			for (const [scheduledTime, supplements] of Object.entries(timeGroups)) {
				try {
					// Check adherence logs for each supplement in this time group
					const supplementsToRemind = [];
					for (const supplement of supplements) {
						const adherenceLog: UserAdherenceLogSelectAll[] = await db.userAdherenceLogs.where({
							userId: supplement.stack.userId,
							supplementId: supplement.stack.id,
							actualAt: {
								gte: new Date(nowMs),
								lt: new Date(endMs),
							},
						});

						// Only include supplements that haven't been taken in this time window
						if (adherenceLog.length === 0) {
							supplementsToRemind.push({
								name: supplement.stack.name,
								dosage: Number(supplement.stack.dosage),
								unit: supplement.stack.unit,
								scheduledTime: supplement.scheduledTime,
							});
						}
					}

					// Only publish event if there are supplements to remind
					if (supplementsToRemind.length > 0 && supplements.length > 0) {
						await tbus.publish({
							event_name: "userstack.scheduled",
							data: {
								userId,
								supplements: supplementsToRemind,
								scheduledFor: supplements[0]!.scheduledTimeMs,
							},
						});

						eventsPublished++;

						logger.info(
							{
								userId,
								scheduledTime,
								supplementsCount: supplementsToRemind.length,
							},
							"Published consolidated userstack.scheduled event",
						);
					} else {
						logger.info(
							{
								userId,
								scheduledTime,
							},
							"All supplements at this time have been taken, skipping event",
						);
					}
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					logger.error(
						{
							userId,
							scheduledTime,
							error: errorMessage,
						},
						"Failed to publish consolidated userstack.scheduled event",
					);
				}
			}
		}

		logger.info(
			{
				usersProcessed: Object.keys(supplementsByUserAndTime).length,
				eventsPublished,
			},
			"Supplement reminder cron job completed",
		);

		return {
			usersProcessed: Object.keys(supplementsByUserAndTime).length,
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
