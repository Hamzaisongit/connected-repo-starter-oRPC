import { db } from "@backend/db/db";
import type { RpcAuthenticatedContext } from "@backend/procedures/protected.procedure";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { getUserTimeframe } from "@backend/utils/getUserTimeframe.utils";
import { type DAYS_OF_WEEK_ENUM, type DaysOfWeek, daysOfWeekZod, USER_ADHERENCE_STATUS_ENUM, userAdherenceStatusZod } from "@connected-repo/zod-schemas/enums.zod";
import type { Selectable } from "orchid-orm";
import { z } from "zod";
import type { UserAdherenceLogTable } from "../logs/tables/user_adherence_logs.table";

console.log("[supplements.router] Module loaded, procedures exported");



const parseTimeToTimestamp = (timeStr: string, UTCTimeWhenUserTodayStarts: number): number => {
	const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
	const millisToAdd = ((hours * 60) + minutes) * 60 * 1000;
	return UTCTimeWhenUserTodayStarts + millisToAdd;
};

const getDailySchedule = rpcProtectedProcedure.input(z.object({
    userTimezoneOffset: z.number(), 
  }))
	.handler(async ({ context, input }: { context: RpcAuthenticatedContext; input: { userTimezoneOffset: number } }) => {

	const { user } = context;
    const { userTimezoneOffset } = input;

	const userTimeframe = getUserTimeframe(userTimezoneOffset);

	const todayDayName = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	][userTimeframe.userDayOfWeek] ?? "Monday";

	const scheduleItems : Array<{
		supplement: any;
		scheduledTime: number;
		adherenceLog: Selectable<UserAdherenceLogTable> | null;
		status: "pending" | "taken" | "missed" | "skipped";
		isOverdue: boolean;
	}> = [];


	// Get all active supplements for user
	const supplements = await db.supplements
		.where({ userId: user.id, isActive: true, days: {has: todayDayName as DaysOfWeek} })
		.selectAll();

	// Get all adherence logs for today (scheduledFor >= start of today)
	let adherenceLogs: Selectable<UserAdherenceLogTable>[];
	try {
		console.log("[getDailySchedule] Fetching adherence logs for user:", user.id);
		console.log("[getDailySchedule] Timeframe - Start:", new Date(userTimeframe.UTCTimeWhenUserTodayStarts).toISOString(), "End:", new Date(userTimeframe.UTCTimeWhenUserTodayEnds).toISOString());
		adherenceLogs = await db.userAdherenceLogs
			.where({
				userId: user.id,
				scheduledFor: {
					gte: new Date(userTimeframe.UTCTimeWhenUserTodayStarts),
					lt: new Date(userTimeframe.UTCTimeWhenUserTodayEnds)
				},
			})
			.selectAll();
		console.log("[getDailySchedule] Fetched adherence logs:", adherenceLogs.length, adherenceLogs);
	} catch (err) {
		throw err;
	}

	// Curate schedule for each supplement for today
	supplements.forEach((supplement) => {

		supplement.timesOfDay.forEach((timeStr) => {
			const scheduledFor = parseTimeToTimestamp(timeStr, userTimeframe.UTCTimeWhenUserTodayStarts);

			const adherenceLog = adherenceLogs.find(
				(alog) => alog.supplementId === supplement.id && new Date(alog.scheduledFor).getTime() === scheduledFor
			) ?? null;

			console.log("[getDailySchedule] Checking supplement:", supplement.name, "timeStr:", timeStr, "scheduledFor:", new Date(scheduledFor).toISOString(), "found log:", adherenceLog ? adherenceLog.id : null);

			const status = adherenceLog
				? adherenceLog.status === "Taken on-time" || adherenceLog.status === "Taken late"
					? "taken"
					: adherenceLog.status === "Missed"
						? "missed"
						: adherenceLog.status === "Skipped"
							? "skipped"
							: "pending"
				: "pending";
			const isOverdue = scheduledFor < Date.now() && status === "pending";

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

	console.log("SCHEDULEEEEE", scheduleItems)
	return scheduleItems;
});

const recordAdherence = rpcProtectedProcedure
	.input(
		z.object({
			supplementId: z.string().uuid(),
			scheduledFor: z.number(),
			status: userAdherenceStatusZod,
			reason: z.string().nullable().optional(),
			userTimezoneOffset: z.number(),
		}),
	)
	.handler(async ({ context, input }: { context: RpcAuthenticatedContext; input: any }) => {
		const { user } = context;
		const { supplementId, scheduledFor, status, reason } = input;

		console.log("[recordAdherence] Input:", { userId: user.id, supplementId, scheduledFor: new Date(scheduledFor).toISOString(), status, userTimezoneOffset: input.userTimezoneOffset });

		let existingLogs;
		try {
			existingLogs = await db.userAdherenceLogs
				.where({
					userId: user.id,
					supplementId,
					scheduledFor:  new Date(scheduledFor),
				})
				.selectAll();
		} catch (err) {
			throw err;
		}

		const existingLog = existingLogs[0] ?? null;

		if (existingLog) {
			try {
				await db.userAdherenceLogs.where({ id: existingLog.id }).update({
					status,
					reason: reason ?? null,
					actualAt: new Date().toISOString(),
					timeZoneOffset: input.userTimezoneOffset,
				});
				console.log("[recordAdherence] Updated log:", existingLog.id, "with status:", status);
			} catch (err) {
				throw err;
			}
		} else {
			try {
				const newLog = await db.userAdherenceLogs.create({
					userId: user.id,
					supplementId,
					scheduledFor:  new Date(scheduledFor),
					actualAt: new Date().toISOString(),
					status,
					reason: reason ?? null,
					timeZoneOffset: input.userTimezoneOffset,
				});
				console.log("[recordAdherence] Created log:", newLog.id, "with status:", status);
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
  
	  const userTimeframe = getUserTimeframe(userTimezoneOffset)
  
	  // Fetch ONLY today's adherence logs directly from DB (much better than fetching all)
	  const todaysAdherenceLogs = await db.userAdherenceLogs
		.where({
		  userId: user.id,
		  scheduledFor: { gte: new Date(userTimeframe.UTCTimeWhenUserTodayStarts), lt: new Date(userTimeframe.UTCTimeWhenUserTodayEnds) }, 
		})
		.selectAll();
  
	  //Active supplements of the day
	  const todayDayName = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	][userTimeframe.userDayOfWeek] ?? "Monday";
	  const activeSupplements = await db.supplements
		.where({
			userId: user.id,
			isActive: true,
			days: { has: todayDayName as DaysOfWeek },
		})
		.selectAll();

  
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
		date: `${userTimeframe.userYear}-${String(userTimeframe.userMonth).padStart(2, "0")}-${String(userTimeframe.userDay).padStart(2, "0")}`, // YYYY-MM-DD in user timezone
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

const getAllSupplements = rpcProtectedProcedure.handler(async ({ context }: { context: RpcAuthenticatedContext }) => {
	console.log("[getAllSupplements] ===== STARTED =====");
	const { user } = context;
	const supplements = await db.supplements
		.where({ userId: user.id })
		.order({ createdAt: "DESC" })
		.selectAll();
	console.log("[getAllSupplements] Fetched supplements:", supplements.length);
	return supplements;
});

const createSupplement = rpcProtectedProcedure
	.input(
		z.object({
			name: z.string().min(1).max(100),
			dosage: z.number().min(0),
			unit: z.string().min(1).max(50),
			instructions: z.array(z.string().min(1).max(200)).min(1),
			days: z.array(daysOfWeekZod).min(1),
			timesOfDay: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
			isActive: z.boolean().default(true),
			imageUrl: z.string().nullable().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		console.log("[createSupplement] ===== STARTED =====");
		const { user } = context;
		const { name, dosage, unit, instructions, days, timesOfDay, isActive, imageUrl } = input;

		console.log("[createSupplement] Creating supplement:", { userId: user.id, name, dosage, unit, instructions, days, timesOfDay, isActive, imageUrl });

		try {
			const supplement = await db.supplements.create({
				userId: user.id,
				name,
				dosage,
				unit,
				instructions,
				days,
				timesOfDay,
				isActive: isActive ?? true,
				imageUrl,
			});

			console.log("[createSupplement] Created supplement:", supplement);
			return supplement;
		} catch (err) {
			console.error("[createSupplement] Error creating supplement:", err);
			throw err;
		}
	});

const updateSupplement = rpcProtectedProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			name: z.string().min(1).max(100),
			dosage: z.number().min(0),
			unit: z.string().min(1).max(50),
			instructions: z.array(z.string().min(1).max(200)).min(1),
			days: z.array(daysOfWeekZod).min(1),
			timesOfDay: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
			isActive: z.boolean(),
			imageUrl: z.string().nullable().optional(),
		}),
	)
	.handler(async ({ context, input }) => {
		const { user } = context;
		const { id, name, dosage, unit, instructions, days, timesOfDay, isActive, imageUrl } = input;

		console.log("[updateSupplement] Updating supplement:", { id, userId: user.id, name, dosage, unit, instructions, days, timesOfDay, isActive, imageUrl });

		try {
			const supplement = await db.supplements
				.where({ id, userId: user.id })
				.update({
					name,
					dosage,
					unit,
					instructions,
					days,
					timesOfDay,
					isActive,
					imageUrl,
				});

			console.log("[updateSupplement] Updated supplement:", supplement);
			return supplement;
		} catch (err) {
			console.error("[updateSupplement] Error updating supplement:", err);
			throw err;
		}
	});

const deleteSupplement = rpcProtectedProcedure
	.input(
		z.object({
			id: z.string().uuid(),
		}),
	)
	.handler(async ({ context, input }) => {
		const { user } = context;
		const { id } = input;

		const deletedSupplement = await db.supplements.where({ id, userId: user.id }).delete();
		return { success: true };
	});

const toggleActive = rpcProtectedProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			isActive: z.boolean(),
		}),
	)
	.handler(async ({ context, input }) => {
		const { user } = context;
		const { id, isActive } = input;

		console.log("[toggleActive] Toggling supplement:", { id, userId: user.id, isActive });

		try {
			const supplement = await db.supplements
				.where({ id, userId: user.id })
				.update({ isActive });

			console.log("[toggleActive] Toggled supplement:", supplement);
			return supplement;
		} catch (err) {
			console.error("[toggleActive] Error toggling supplement:", err);
			throw err;
		}
	});

export const supplementsRouter = {
	getDailySchedule,
	recordAdherence,
	getDailyProgress,
	getStreak,
	getAllSupplements,
	createSupplement,
	updateSupplement,
	deleteSupplement,
	toggleActive,
};

console.log("[supplements.router] Router exported:", Object.keys(supplementsRouter));
