import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { getUserTimeframe } from "@backend/utils/getUserTimeframe.utils";
import { z } from "zod";

const getDailyComplianceForToday = rpcProtectedProcedure
	.input(
		z.object({
			userTimezoneOffset: z.number(),
		})
	)
	.handler(async ({ context, input }) => {
		const { user } = context;
		const { userTimezoneOffset } = input;

		const userTimeframe = getUserTimeframe(userTimezoneOffset);

		const todayComplianceArray = await db.dailyCompliances
			.where({
				userId: user.id,
				date: { gte: new Date(userTimeframe.UTCTimeWhenUserTodayStarts), lte: new Date(userTimeframe.UTCTimeWhenUserTodayEnds) }
			})
			.limit(1);

		return todayComplianceArray[0] || null;
	});

const getInsights = rpcProtectedProcedure
	.input(z.object({
		userTimezoneOffset: z.number(),
	}))
	.handler(async ({ context, input }) => {
	const { user } = context;
	const { userTimezoneOffset } = input;

	console.log("[getInsights] Starting with timezoneOffset:", userTimezoneOffset);

	const userTimeframe = getUserTimeframe(userTimezoneOffset);

	const userStats = await db.userStats.where({ userId: user.id });
	const supplements = await db.supplements.where({ userId: user.id, isActive: true });

	// Set cutoff times
	const sevenDaysAgoMs = userTimeframe.UTCTimeWhenUserTodayStarts - 7 * 24 * 60 * 60 * 1000;
	const thirtyDaysAgoMs = userTimeframe.UTCTimeWhenUserTodayStarts - 30 * 24 * 60 * 60 * 1000;

	// Fetch only week & month adherence logs
	const weekLogs = await db.userAdherenceLogs
		.where({
			userId: user.id,
			scheduledFor: { gte: new Date(sevenDaysAgoMs) }
		})
		.order({ actualAt: "DESC" });

	const monthLogs = await db.userAdherenceLogs
		.where({
			userId: user.id,
			scheduledFor: { gte: new Date(thirtyDaysAgoMs) }
		})
		.order({ actualAt: "DESC" });

	// Weekly and monthly daily compliance stats for history charts/etc
	const dailyCompliance = await db.dailyCompliances
		.where({ userId: user.id })
		.order({ date: "DESC" })
		.limit(30);

	const weeklyCompliance = dailyCompliance.filter((dc) => dc.date >= sevenDaysAgoMs).reverse();
	const monthlyCompliance = dailyCompliance.filter((dc) => dc.date >= thirtyDaysAgoMs).reverse();

	const weeklyAvgCompliance = weeklyCompliance.length > 0
		? Math.round(weeklyCompliance.reduce((acc, dc) => acc + Number(dc.adherencePercentage), 0) / weeklyCompliance.length)
		: 0;

	const monthlyAvgCompliance = monthlyCompliance.length > 0
		? Math.round(monthlyCompliance.reduce((acc, dc) => acc + Number(dc.adherencePercentage), 0) / monthlyCompliance.length)
		: 0;

	// Helper functions
	const STATUSES = ["Taken on-time", "Taken late", "Missed", "Skipped"] as const;

	const adherenceSplit = (logs: typeof weekLogs) => ({
		takenOnTime: logs.filter((log) => log.status === "Taken on-time").length,
		takenLate: logs.filter((log) => log.status === "Taken late").length,
		missed: logs.filter((log) => log.status === "Missed").length,
		skipped: logs.filter((log) => log.status === "Skipped").length,
	});

	const complianceRate = (logs: typeof weekLogs) =>
		logs.length > 0
			? Math.round(
				((logs.filter((l) => l.status === "Taken on-time" || l.status === "Taken late").length) / logs.length) * 100
			)
			: 0;

	const makeSupplementCompliance = (logs: typeof weekLogs) => {
		const supplementCompliance: Record<
			string,
			{
				supplementId: string;
				name: string;
				complianceRate: number;
				adherenceBreakdown: Record<string, number>;
				count: number;
			}
		> = {};
		for (const supp of supplements) {
			const suppLogs = logs.filter((log) => log.supplementId === supp.id);
			const suppCount = suppLogs.length;
			let compliantCount = 0;
			const breakdown: Record<string, number> = {
				"Taken on-time": 0,
				"Taken late": 0,
				"Missed": 0,
				"Skipped": 0
			};
			for (const s of suppLogs) {
				if (s.status === "Taken on-time" || s.status === "Taken late") compliantCount++;
				if (s.status && typeof breakdown[s.status] === "number") breakdown[s.status] += 1;
			}
			supplementCompliance[supp.id] = {
				supplementId: supp.id,
				name: supp.name,
				complianceRate: suppCount > 0 ? Math.round((compliantCount / suppCount) * 100) : 0,
				adherenceBreakdown: breakdown,
				count: suppCount
			};
		}
		return supplementCompliance;
	};

	const weeklySupplementCompliance = makeSupplementCompliance(weekLogs);
	const monthlySupplementCompliance = makeSupplementCompliance(monthLogs);

	const result = {
		userStats: userStats[0] || null,
		weeklyCompliance,
		monthlyCompliance,
		weeklyAvgCompliance,
		monthlyAvgCompliance,
		totalSupplements: supplements.length,

		weeklyComplianceRate: complianceRate(weekLogs),
		monthlyComplianceRate: complianceRate(monthLogs),

		weeklyAdherenceBreakdown: adherenceSplit(weekLogs),
		monthlyAdherenceBreakdown: adherenceSplit(monthLogs),

		weeklySupplementCompliance,
		monthlySupplementCompliance
	};

	console.log("[getInsights] Result:", result);
	return result;
});

export const dailyComplianceRouter = {
	getDailyComplianceForToday,
    getInsights
};
