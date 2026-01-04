import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { getUserTimeframe } from "@backend/utils/getUserTimeframe.utils";
import { z } from "zod";

const getUserStats = rpcProtectedProcedure.handler(async ({ context }) => {
	const { user } = context;

	const userStats = await db.userStats
		.where({ userId: user.id });

	return userStats[0];
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

	const dailyCompliance = await db.dailyCompliances
		.where({ userId: user.id })
		.order({ date: "DESC" })
		.limit(30);

	const supplements = await db.supplements.where({ userId: user.id, isActive: true });

	const adherenceLogs = await db.userAdherenceLogs
		.where({ userId: user.id })
		.order({ actualAt: "DESC" })
		.limit(100);

	console.log("[getInsights] Fetched:", {
		dailyCompliance: dailyCompliance.length,
		adherenceLogs: adherenceLogs.length,
		supplements: supplements.length
	});

	const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

	const weeklyCompliance = dailyCompliance.filter((dc) => dc.date >= sevenDaysAgoMs);
	const monthlyCompliance = dailyCompliance.filter((dc) => dc.date >= thirtyDaysAgoMs);

	const weeklyAvgCompliance = weeklyCompliance.length > 0
		? weeklyCompliance.reduce((acc, dc) => acc + Number(dc.adherencePercentage), 0) / weeklyCompliance.length
		: 0;

	const monthlyAvgCompliance = monthlyCompliance.length > 0
		? monthlyCompliance.reduce((acc, dc) => acc + Number(dc.adherencePercentage), 0) / monthlyCompliance.length
		: 0;

	const totalSupplementsTaken = adherenceLogs.filter(
		(log) => log.status === "Taken on-time" || log.status === "Taken late"
	).length;

	const weeklySupplementsTaken = adherenceLogs.filter(
		(log) => (log.status === "Taken on-time" || log.status === "Taken late") && log.actualAt >= sevenDaysAgoMs
	).length;

	const missedCount = adherenceLogs.filter((log) => log.status === "Missed").length;
	const takenOnTimeCount = adherenceLogs.filter((log) => log.status === "Taken on-time").length;
	const takenLateCount = adherenceLogs.filter((log) => log.status === "Taken late").length;
	const skippedCount = adherenceLogs.filter((log) => log.status === "Skipped").length;

	const overallComplianceRate = adherenceLogs.length > 0
		? Math.round(((takenOnTimeCount + takenLateCount) / adherenceLogs.length) * 100)
		: 0;

	const result = {
		userStats: userStats[0] || null,
		weeklyCompliance: weeklyCompliance.reverse(),
		monthlyCompliance: monthlyCompliance.reverse(),
		weeklyAvgCompliance: Math.round(weeklyAvgCompliance),
		monthlyAvgCompliance: Math.round(monthlyAvgCompliance),
		totalSupplements: supplements.length,
		totalSupplementsTaken,
		weeklySupplementsTaken,
		overallComplianceRate,
		adherenceBreakdown: {
			takenOnTime: takenOnTimeCount,
			takenLate: takenLateCount,
			missed: missedCount,
			skipped: skippedCount,
		},
	};

	console.log("[getInsights] Result:", result);
	return result;
});

export const usersStatsRouter = {
	getUserStats,
	getInsights,
};
