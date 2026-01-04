import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";

const getUserStats = rpcProtectedProcedure.handler(async ({ context }) => {
	const { user } = context;

	const userStats = await db.userStats
		.where({ userId: user.id });

	return userStats[0];
});

const getInsights = rpcProtectedProcedure.handler(async ({ context }) => {
	const { user } = context;

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

	const now = new Date();
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const weeklyCompliance = dailyCompliance.filter((dc) => dc.date >= sevenDaysAgo.getTime());
	const monthlyCompliance = dailyCompliance.filter((dc) => dc.date >= thirtyDaysAgo.getTime());

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
		(log) => (log.status === "Taken on-time" || log.status === "Taken late") && log.actualAt >= sevenDaysAgo.getTime()
	).length;

	const missedCount = adherenceLogs.filter((log) => log.status === "Missed").length;
	const takenOnTimeCount = adherenceLogs.filter((log) => log.status === "Taken on-time").length;
	const takenLateCount = adherenceLogs.filter((log) => log.status === "Taken late").length;
	const skippedCount = adherenceLogs.filter((log) => log.status === "Skipped").length;

	const overallComplianceRate = adherenceLogs.length > 0
		? Math.round(((takenOnTimeCount + takenLateCount) / adherenceLogs.length) * 100)
		: 0;

	return {
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
});

export const usersStatsRouter = {
	getUserStats,
	getInsights,
};
