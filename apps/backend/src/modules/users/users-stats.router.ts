import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";

const getUserStats = rpcProtectedProcedure.handler(async ({ context }) => {
	const { user } = context;

	const userStats = await db.userStats
		.where({ userId: user.id });

	return userStats[0];
});

export const usersStatsRouter = {
	getUserStats,
};
