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



export const usersStatsRouter = {
	getUserStats
};
