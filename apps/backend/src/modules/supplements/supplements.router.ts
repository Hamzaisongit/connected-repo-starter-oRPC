import { db } from "@backend/db/db";
import type { RpcAuthenticatedContext } from "@backend/procedures/protected.procedure";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { type DAYS_OF_WEEK_ENUM, type DaysOfWeek, USER_ADHERENCE_STATUS_ENUM, userAdherenceStatusZod } from "@connected-repo/zod-schemas/enums.zod";
import type { QueryBase, QueryBuilder, Selectable } from "orchid-orm";
import { z } from "zod";
import type { UserAdherenceLogTable } from "../logs/tables/user_adherence_logs.table";

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

const getDailySchedule = rpcProtectedProcedure.input(z.object({
    userTimezoneOffset: z.number(), 
  }))
	.handler(async ({ context, input }: { context: RpcAuthenticatedContext; input: { userTimezoneOffset: number } }) => {

	const { user } = context;
    const { userTimezoneOffset } = input;

    // Step 1: Calculate "today" midnight in user's timezone
    const now = new Date();
    const serverNowMs = now.getTime()
    const userNowMs = serverNowMs + userTimezoneOffset * 60000;

    const userTodayStart = new Date(userNowMs);
    userTodayStart.setUTCHours(0, 0, 0, 0); // Midnight in user timezone

    const userTodayEnd = new Date(userTodayStart);
    userTodayEnd.setUTCDate(userTodayEnd.getUTCDate() + 1); // Next day midnight

    const nowInUserTimeMs = userNowMs;

	const todayDayName = getDayName();

	const scheduleItems : Array<{
		supplement: any;
		scheduledTime: number;
		adherenceLog: Selectable<UserAdherenceLogTable> | null;
		status: "pending" | "taken" | "missed" | "skipped";
		isOverdue: boolean;
	}> = [];


	// Get all active supplements for user
	const supplements = await db.supplements
		.where({ userId: user.id, isActive: true, days: {has: todayDayName} })
		.selectAll();

	// Get all adherence logs for today (scheduledFor >= start of today)
	let adherenceLogs: Selectable<UserAdherenceLogTable>[];
	try {
		adherenceLogs = await db.userAdherenceLogs
			.where({
				userId: user.id,
				scheduledFor: { gte: userTodayStart, lt: userTodayEnd },
			})
			.selectAll();
	} catch (err) {
		throw err;
	}

	// Curate schedule for each supplement for today
	supplements.forEach((supplement) => {

		supplement.timesOfDay.forEach((timeStr) => {
			const scheduledFor = parseTimeToTimestamp(timeStr, userTodayStart);

			const adherenceLog = adherenceLogs.find(
				(alog) => alog.supplementId === supplement.id && new Date(alog.scheduledFor).getTime() === scheduledFor
			) ?? null;

			const status = adherenceLog
				? adherenceLog.status === "Taken on-time" || adherenceLog.status === "Taken late"
					? "taken"
					: adherenceLog.status === "Missed"
						? "missed"
						: adherenceLog.status === "Skipped"
							? "skipped"
							: "pending"
				: "pending";
			const isOverdue = scheduledFor < nowInUserTimeMs && status === "pending";

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
		})
	})

	scheduleItems.sort((a, b) => a.scheduledTime - b.scheduledTime);

	console.log("[getDailySchedule] scheduleItems:", scheduleItems);
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
			throw err;
		}

		const existingLog = existingLogs[0] ?? null;
		const timeZoneOffset = -new Date().getTimezoneOffset();

		if (existingLog) {
			try {
				await db.userAdherenceLogs.where({ id: existingLog.id }).update({
					status,
					reason: reason ?? null,
					actualAt: new Date().toISOString(),
					timeZoneOffset,
				});
			} catch (err) {
				throw err;
			}
		} else {
			try {
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
				throw err;
			}
		}

		return { success: true };
	});

const getDailyProgress = rpcProtectedProcedure
	.input(z.object({
	  userTimezoneOffset: z.number(), // e.g., -480 for UTC-8, 120 for UTC+2
	}))
	.handler(async ({ context, input }) => {
	  const { user } = context;
	  const { userTimezoneOffset } = input;
  
	  // Calculate start of today in user's timezone (midnight)
	  const now = new Date();
	  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // convert to UTC ms
	  const userTodayStart = new Date(utc + userTimezoneOffset * 60000);
	  userTodayStart.setUTCHours(0, 0, 0, 0); // midnight in user timezone
  
	  const userTodayEnd = new Date(userTodayStart);
	  userTodayEnd.setUTCDate(userTodayEnd.getUTCDate() + 1); // next day midnight
  
	  const startOfDayMs = userTodayStart.getTime();
	  const endOfDayMs = userTodayEnd.getTime();
  
	  // Fetch ONLY today's adherence logs directly from DB (much better than fetching all)
	  const todaysAdherenceLogs = await db.userAdherenceLogs
		.where({
		  userId: user.id,
		  scheduledFor: { gte: new Date(startOfDayMs), lt: new Date(endOfDayMs) }, 
		})
		.selectAll();
	  console.log("[getDailyProgress] todaysAdherenceLogs:", todaysAdherenceLogs);
  
	  //Active supplements of the day
	  const todayDayName = userTodayStart.toLocaleString("en-us", { weekday: "long" }) as DaysOfWeek;
	  const activeSupplements = await db.supplements
		.where({
			userId: user.id,
			isActive: true,
			days: { has: todayDayName },
		})
		.selectAll();
	  console.log("[getDailyProgress] activeSupplements:", activeSupplements);

  
	  // Calculate total scheduled doses for today
	  const totalScheduled = activeSupplements.reduce((acc, supp) => acc + supp.timesOfDay.length, 0);
  
	  // Count statuses from today's logs
	  const counters = todaysAdherenceLogs.reduce(
		(acc, log) => {
			if (log.status === "Taken on-time") acc.takenOnTime++;
			else if (log.status === "Taken late") acc.takenLate++;
			else if (log.status === "Missed") acc.missed++;
			else if (log.status === "Skipped") acc.skipped++;
			return acc;
		},
		{
			takenOnTime: 0,
			takenLate: 0,
			missed: 0,
			skipped: 0,
		},
	  );
  
	  const completed = counters.takenOnTime + counters.takenLate;
	  const completionPercentage = totalScheduled > 0 
		? Math.round((completed / totalScheduled) * 100) 
		: 0;
  
	  const result = {
		date: userTodayStart.toISOString().split("T")[0], // YYYY-MM-DD in user timezone
		totalScheduled,
		takenOnTime: counters.takenOnTime,
		takenLate: counters.takenLate,
		missed: counters.missed,
		skipped: counters.skipped,
		completionPercentage,
	  };
  
	  return result;
	});

const getStreak = rpcProtectedProcedure.handler(async ({ context }: { context: RpcAuthenticatedContext }) => {
	const { user } = context;

	const now = new Date();
	const msPerDay = 24 * 60 * 60 * 1000;

	let currentStreak = 0;
	let bestStreak = 0;

		for (let daysBack = 0; daysBack < 365; daysBack++) {
		const dayStart = new Date(now.getTime() - daysBack * msPerDay);
		const dayEnd = new Date(dayStart.getTime() + msPerDay);

		let allLogsForDay;
		try {
			allLogsForDay = await db.userAdherenceLogs
				.where({ userId: user.id })
				.selectAll();
		} catch (err) {
			throw err;
		}

		const dayStartMs = dayStart.getTime();
		const dayEndMs = dayEnd.getTime();
		const logsForDay = allLogsForDay.filter((log: any) => new Date(log.scheduledFor).getTime() >= dayStartMs && new Date(log.scheduledFor).getTime() <= dayEndMs);

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
			throw err;
		}

		const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const targetDayName = daysOfWeek[dayStart.getDay()] ?? "Monday";

		let scheduledForDay = 0;
		for (const supplement of activeSupplements) {
			if (supplement.days.includes(targetDayName as any)) {
				scheduledForDay += supplement.timesOfDay.length;
			}
		}

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
	return streakResult;
});

export const supplementsRouter = {
	getDailySchedule,
	recordAdherence,
	getDailyProgress,
	getStreak,
};
