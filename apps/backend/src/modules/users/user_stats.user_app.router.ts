import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { userStatsSelectAllZod } from "@connected-repo/zod-schemas/user_stats.zod";

// Get user stats for the authenticated user
const getMine = rpcProtectedProcedure
	.output(userStatsSelectAllZod.nullable())
	.handler(async ({ context: { user } }) => {
		const userStats = await db.userStats
			.selectAll()
			.where({ userId: user.id })
			.take();

		return userStats || null;
	});

// Get current streak info
const getCurrentStreak = rpcProtectedProcedure
	.output(
		userStatsSelectAllZod
			.pick({
				currentStreak: true,
				currentStreakShieldsUsed: true,
			})
			.nullable(),
	)
	.handler(async ({ context: { user } }) => {
		const userStats = await db.userStats
			.select("currentStreak", "currentStreakShieldsUsed")
			.where({ userId: user.id })
			.take();

		return userStats || null;
	});

// Get longest streak info
const getLongestStreak = rpcProtectedProcedure
	.output(
		userStatsSelectAllZod
			.pick({
				longestStreak: true,
				longestStreakShieldsUsed: true,
			})
			.nullable(),
	)
	.handler(async ({ context: { user } }) => {
		const userStats = await db.userStats
			.select("longestStreak", "longestStreakShieldsUsed")
			.where({ userId: user.id })
			.take();

		return userStats || null;
	});

export const userStatsRouter = {
	getMine,
	getCurrentStreak,
	getLongestStreak,
};
