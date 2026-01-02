import { db } from "@backend/db/db";
import type { RpcAuthenticatedContext } from "@backend/procedures/protected.procedure";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { type DAYS_OF_WEEK_ENUM, USER_ADHERENCE_STATUS_ENUM, userAdherenceStatusZod } from "@connected-repo/zod-schemas/enums.zod";
import { z } from "zod";

const getDayName = (): (typeof DAYS_OF_WEEK_ENUM)[number] => {
	const days: (typeof DAYS_OF_WEEK_ENUM)[number][] = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const dayIndex = new Date().getDay();
	return days[dayIndex] ?? "Monday";
};

const getStartOfDay = (): Date => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
};

const getEndOfDay = (): Date => {
	const date = new Date();
	date.setHours(23, 59, 59, 999);
	return date;
};

const parseTimeToTimestamp = (timeStr: string, targetDate: Date): number => {
	const [hours, minutes] = timeStr.split(":").map(Number);
	if (hours === undefined || minutes === undefined) {
		return targetDate.getTime();
	}
	const date = new Date(targetDate);
	date.setHours(hours, minutes, 0, 0);
	return date.getTime();
};

const getStatusFromLog = (log: any | null, scheduledFor: number): "taken" | "missed" | "skipped" | "pending" => {
	if (!log) return "pending";

	if (log.status === "Taken on-time") return "taken";
	if (log.status === "Taken late") return "taken";
	if (log.status === "Missed") return "missed";
	if (log.status === "Skipped") return "skipped";

	return "pending";
};

const getDailySchedule = rpcProtectedProcedure.handler(async ({ context }: { context: RpcAuthenticatedContext }) => {
	const { user } = context;
	const todayDayName = getDayName();
	const now = new Date();

	console.log("[getDailySchedule] user.id:", user.id, "todayDayName:", todayDayName, "now:", now.toISOString());

	const supplements = await db.supplements
		.where({ userId: user.id, isActive: true })
		.selectAll();

	console.log("[getDailySchedule] supplements:", supplements);

	const scheduleItems = [];

	for (const supplement of supplements) {
		if (!supplement.days.includes(todayDayName)) {
			continue;
		}

		for (const timeStr of supplement.timesOfDay) {
			const scheduledFor = parseTimeToTimestamp(timeStr, new Date());
			const scheduledForDate = new Date(scheduledFor);
			console.log("[getDailySchedule] timeStr:", timeStr, "scheduledFor:", scheduledFor, "as date:", scheduledForDate.toISOString());
			let adherenceLogs;
			try {
				adherenceLogs = await db.userAdherenceLogs
					.where({
						userId: user.id,
						supplementId: supplement.id,
						scheduledFor: scheduledForDate,
					})
					.selectAll();
			} catch (err) {
				console.error("[getDailySchedule] Error querying adherenceLogs:", {
					userId: user.id,
					supplementId: supplement.id,
					scheduledFor,
					scheduledForDate: scheduledForDate.toISOString(),
					timeStr,
					err
				});
				throw err;
			}

			console.log("[getDailySchedule] adherenceLogs:", adherenceLogs);

			const adherenceLog = adherenceLogs[0] ?? null;
			const status = getStatusFromLog(adherenceLog, scheduledFor);
			const isOverdue = scheduledFor < now.getTime() && status === "pending";

			scheduleItems.push({
				supplement: {
					id: supplement.id,
					name: supplement.name,
					dosage: supplement.dosage,
					unit: supplement.unit,
					instructions: supplement.instructions,
					imageUrl: supplement.imageUrl,
				},
				scheduledTime: scheduledFor,
				adherenceLog,
				status,
				isOverdue,
			});
		}
	}

	scheduleItems.sort((a, b) => a.scheduledTime - b.scheduledTime);

	return scheduleItems;
});

const recordAdherence = rpcProtectedProcedure
	.input(
		z.object({
			supplementId: z.string().uuid(),
			scheduledFor: z.number(),
			status: userAdherenceStatusZod,
			reason: z.string().nullable().optional(),
		}),
	)
	.handler(async ({ context, input }: { context: RpcAuthenticatedContext; input: any }) => {
		const { user } = context;
		const { supplementId, scheduledFor, status, reason } = input;

		const scheduledForDate = new Date(scheduledFor);
		console.log("[recordAdherence] user.id:", user.id,
			"supplementId:", supplementId,
			"scheduledFor:", scheduledFor,
			"as date:", scheduledForDate.toISOString(),
			"status:", status, "reason:", reason);

		let existingLogs;
		try {
			existingLogs = await db.userAdherenceLogs
				.where({
					userId: user.id,
					supplementId,
					scheduledFor: scheduledForDate,
				})
				.selectAll();
		} catch (err) {
			console.error("[recordAdherence] Error querying existingLogs:", {
				userId: user.id,
				supplementId,
				scheduledFor,
				scheduledForDate: scheduledForDate.toISOString(),
				status,
				reason,
				err
			});
			throw err;
		}

		console.log("[recordAdherence] existingLogs:", existingLogs);

		const existingLog = existingLogs[0] ?? null;
		const timeZoneOffset = -new Date().getTimezoneOffset();

		if (existingLog) {
			try {
				console.log("[recordAdherence] Updating log id:", existingLog.id);
				await db.userAdherenceLogs.where({ id: existingLog.id }).update({
					status,
					reason: reason ?? null,
					actualAt: new Date().toISOString(),
					timeZoneOffset,
				});
			} catch (err) {
				console.error("[recordAdherence] Error updating adherenceLog:", {
					logId: existingLog.id,
					status,
					reason: reason ?? null,
					actualAt: new Date().toISOString(),
					timeZoneOffset,
					err
				});
				throw err;
			}
		} else {
			try {
				console.log("[recordAdherence] Creating new log");
				await db.userAdherenceLogs.create({
					userId: user.id,
					supplementId,
					scheduledFor: scheduledForDate,
					actualAt: new Date().toISOString(),
					status,
					reason: reason ?? null,
					timeZoneOffset,
				});
			} catch (err) {
				console.error("[recordAdherence] Error creating adherenceLog:", {
					userId: user.id,
					supplementId,
					scheduledFor,
					actualAt: new Date().toISOString(),
					status,
					reason: reason ?? null,
					timeZoneOffset,
					err
				});
				throw err;
			}
		}

		return { success: true };
	});

const getDailyProgress = rpcProtectedProcedure.handler(async ({ context }: { context: RpcAuthenticatedContext }) => {
	const { user } = context;
	const startOfDay = getStartOfDay();
	const endOfDay = getEndOfDay();

	console.log("[getDailyProgress] user.id:", user.id, "startOfDay:", startOfDay.toISOString(), "endOfDay:", endOfDay.toISOString());

	let allAdherenceLogs;
	try {
		allAdherenceLogs = await db.userAdherenceLogs
			.where({ userId: user.id })
			.selectAll();
	} catch (err) {
		console.error("[getDailyProgress] Error querying allAdherenceLogs:", {
			userId: user.id,
			startOfDay,
			endOfDay,
			err
		});
		throw err;
	}

	const startOfDayMs = startOfDay.getTime();
	const endOfDayMs = endOfDay.getTime();
	const adherenceLogs = allAdherenceLogs.filter((log: any) => log.scheduledFor >= startOfDayMs && log.scheduledFor <= endOfDayMs);

	console.log("[getDailyProgress] adherenceLogs for today:", adherenceLogs);

	let activeSupplements;
	try {
		activeSupplements = await db.supplements
			.where({ userId: user.id, isActive: true })
			.selectAll();
	} catch (err) {
		console.error("[getDailyProgress] Error querying activeSupplements:", {
			userId: user.id,
			err,
		});
		throw err;
	}

	console.log("[getDailyProgress] activeSupplements:", activeSupplements);

	const todayDayName = getDayName();
	let totalScheduled = 0;

	for (const supplement of activeSupplements) {
		if (supplement.days.includes(todayDayName)) {
			totalScheduled += supplement.timesOfDay.length;
		}
	}

	let takenOnTime = 0;
	let takenLate = 0;
	let missed = 0;
	let skipped = 0;

	for (const log of adherenceLogs) {
		if (log.status === "Taken on-time") {
			takenOnTime++;
		} else if (log.status === "Taken late") {
			takenLate++;
		} else if (log.status === "Missed") {
			missed++;
		} else if (log.status === "Skipped") {
			skipped++;
		}
	}

	const completed = takenOnTime + takenLate;
	const completionPercentage = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

	const result = {
		date: new Date().toISOString().split("T")[0]!,
		totalScheduled,
		takenOnTime,
		takenLate,
		missed,
		skipped,
		completionPercentage,
	};
	console.log("[getDailyProgress] result:", result);
	return result;
});

const getStreak = rpcProtectedProcedure.handler(async ({ context }: { context: RpcAuthenticatedContext }) => {
	const { user } = context;

	const now = new Date();
	const msPerDay = 24 * 60 * 60 * 1000;

	console.log("[getStreak] user.id:", user.id, "now:", now.toISOString(), "msPerDay:", msPerDay);

	let currentStreak = 0;
	let bestStreak = 0;

	for (let daysBack = 0; daysBack < 365; daysBack++) {
		const dayStart = new Date(now.getTime() - daysBack * msPerDay);
		const dayEnd = new Date(dayStart.getTime() + msPerDay);

		console.log(`[getStreak] Checking for daysBack: ${daysBack}, dayStart: ${dayStart.toISOString()}, dayEnd: ${dayEnd.toISOString()}`);

		let allLogsForDay;
		try {
			allLogsForDay = await db.userAdherenceLogs
				.where({ userId: user.id })
				.selectAll();
		} catch (err) {
			console.error("[getStreak] Error querying allLogsForDay:", {
				userId: user.id,
				dayStart,
				dayEnd,
				daysBack,
				err,
			});
			throw err;
		}

		const dayStartMs = dayStart.getTime();
		const dayEndMs = dayEnd.getTime();
		const logsForDay = allLogsForDay.filter((log: any) => log.scheduledFor >= dayStartMs && log.scheduledFor <= dayEndMs);

		console.log(`[getStreak] logsForDay for dayStart: ${dayStart.toISOString()}:`, logsForDay);

		if (logsForDay.length === 0) {
			if (daysBack === 0) {
				continue;
			}
			break;
		}

		let activeSupplements;
		try {
			activeSupplements = await db.supplements
				.where({ userId: user.id, isActive: true })
				.selectAll();
		} catch (err) {
			console.error("[getStreak] Error querying activeSupplements:", {
				userId: user.id,
				dayStart,
				dayEnd,
				daysBack,
				err,
			});
			throw err;
		}

		console.log(`[getStreak] activeSupplements on dayStart: ${dayStart.toISOString()}:`, activeSupplements);

		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const targetDayName = daysOfWeek[dayStart.getDay()] ?? "Monday";

		let scheduledForDay = 0;
		for (const supplement of activeSupplements) {
			if (supplement.days.includes(targetDayName as any)) {
				scheduledForDay += supplement.timesOfDay.length;
			}
		}

		console.log(`[getStreak] scheduledForDay: ${scheduledForDay}, day: ${targetDayName}`);

		if (scheduledForDay === 0) {
			if (daysBack === 0) {
				continue;
			}
			break;
		}

		let takenCount = 0;
		for (const log of logsForDay) {
			if (log.status === "Taken on-time" || log.status === "Taken late") {
				takenCount++;
			}
		}

		console.log(`[getStreak] takenCount: ${takenCount} / scheduledForDay: ${scheduledForDay}`);

		if (takenCount === scheduledForDay) {
			if (daysBack === 0) {
				currentStreak++;
			} else {
				currentStreak++;
				if (currentStreak > bestStreak) {
					bestStreak = currentStreak;
				}
			}
		} else if (daysBack > 0) {
			break;
		}
	}

	if (currentStreak > bestStreak) {
		bestStreak = currentStreak;
	}

	const streakResult = {
		currentStreak,
		bestStreak,
	};
	console.log("[getStreak] streakResult:", streakResult);
	return streakResult;
});

export const supplementsRouter = {
	getDailySchedule,
	recordAdherence,
	getDailyProgress,
	getStreak,
};
