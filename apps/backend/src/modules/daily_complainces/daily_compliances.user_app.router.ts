import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";

import {
	dailyComplianceGetByDateRangeZod,
	dailyComplianceGetByIdZod,
	dailyComplianceSelectAllZod,
} from "@connected-repo/zod-schemas/daily_compliance.zod";
import z from "zod";

// Get all daily compliances for the authenticated user
const getAll = rpcProtectedProcedure
	.output(z.array(dailyComplianceSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const dailyCompliances = await db.dailyCompliances
			.select("*")
			.where({ userId: user.id })
			.order({ date: "DESC" });

		return dailyCompliances;
	});

// Get daily compliance by ID
const getById = rpcProtectedProcedure
	.input(dailyComplianceGetByIdZod)
	.output(dailyComplianceSelectAllZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		const dailyCompliance = await db.dailyCompliances
			.find(id)
			.where({ userId: user.id });

		return dailyCompliance;
	});

// Get daily compliances by date range
const getByDateRange = rpcProtectedProcedure
	.input(dailyComplianceGetByDateRangeZod)
	.output(z.array(dailyComplianceSelectAllZod))
	.handler(async ({ input: { userId, startDate, endDate }, context: { user } }) => {
		// Ensure user can only query their own data
		const queryUserId = userId || user.id;
		
		if (queryUserId !== user.id) {
			return [];
		}

		const dailyCompliances = await db.dailyCompliances
			.select("*")
			.where({ userId: queryUserId })
			.where({
				date: {
					gte: startDate,
					lte: endDate
				}
			})
			.order({ date: "DESC" });

		return dailyCompliances;
	});

// Get last 7 daily compliances (most recent)
const getLast7 = rpcProtectedProcedure
	.output(z.array(dailyComplianceSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const dailyCompliances = await db.dailyCompliances
			.select("*")
			.where({ userId: user.id })
			.order({ date: "DESC" })
			.limit(7);

		return dailyCompliances;
	});

// Get daily compliance for a specific date
const getByDate = rpcProtectedProcedure
	.input(z.object({ date: z.iso.date() }))
	.output(dailyComplianceSelectAllZod.nullable())
	.handler(async ({ input: { date }, context: { user } }) => {
		const dailyCompliance = await db.dailyCompliances
			.where({ userId: user.id })
			.where({ date })
			.take();

		return dailyCompliance;
	});

// Get latest daily compliance
const getLatest = rpcProtectedProcedure
	.output(dailyComplianceSelectAllZod.nullable())
	.handler(async ({ context: { user } }) => {

		const latestCompliance = await db.dailyCompliances
			.where({ userId: user.id })
			.order({
				date: "DESC"
			})
			.take();

		return latestCompliance
	});

// Get compliance statistics
const getStats = rpcProtectedProcedure
	.output(
		z.object({
			totalDays: z.number(),
			averageIntake: z.string(),
			perfectDays: z.number(),
			daysWithShieldUsed: z.number(),
		}),
	)
	.handler(async ({ context: { user } }) => {
		const compliances = await db.dailyCompliances
			.select("*")
			.where({ userId: user.id });

		const totalDays = compliances.length;
		
		if (totalDays === 0) {
			return {
				totalDays: 0,
				averageIntake: "0",
				perfectDays: 0,
				daysWithShieldUsed: 0,
			};
		}

		const totalIntake = compliances.reduce(
			(sum, c) => sum + Number.parseFloat(c.intakePercentage),
			0,
		);
		const averageIntake = (totalIntake / totalDays).toFixed(2);
		const perfectDays = compliances.filter(
			(c) => Number.parseFloat(c.intakePercentage) === 100,
		).length;
		const daysWithShieldUsed = compliances.filter((c) => c.shieldsUsed).length;

		return {
			totalDays,
			averageIntake,
			perfectDays,
			daysWithShieldUsed,
		};
	});

export const dailyCompliancesRouter = {
	getAll,
	getById,
	getByDateRange,
	getByDate,
	getLast7,
	getLatest,
	getStats,
};
