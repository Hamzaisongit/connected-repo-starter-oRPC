import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import {
	userAdherenceLogCreateInputZod,
	userAdherenceLogDeleteZod,
	userAdherenceLogGetByIdZod,
	userAdherenceLogSelectAllZod,
	userAdherenceLogUpdateInputZod,
} from "@connected-repo/zod-schemas/user_adherence_log.zod";
import { ORPCError } from "@orpc/server";
import z from "zod";

/**
 * Helper function to check if daily compliance has been updated for a given date
 * Returns true if the daily compliance record exists and has been modified
 */
async function isDailyComplianceUpdated(userId: string, scheduledDate: number): Promise<boolean> {
	// Get the start and end of the day for the given timestamp
	const dayStart = new Date(scheduledDate);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(scheduledDate);
	dayEnd.setHours(23, 59, 59, 999);

	const dailyCompliance = await db.dailyCompliances
		.where({ userId })
		.where({ date: { gte: new Date(dayStart) } })
		.where({ date: { lte: new Date(dayEnd) } })
		.takeOptional();

	if (!dailyCompliance) {
		return false;
	}

	// Check if the record has been modified after creation
	return dailyCompliance.updatedAt > dailyCompliance.createdAt;
}

// Get all user adherence logs for the authenticated user
const getAll = rpcProtectedProcedure
	.output(z.array(userAdherenceLogSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const adherenceLogs = await db.userAdherenceLogs
			.select("*")
			.where({ userId: user.id })
			.order({ scheduledFor: "DESC" });

		return adherenceLogs;
	});

// Get user adherence log by ID
const getById = rpcProtectedProcedure
	.input(userAdherenceLogGetByIdZod)
	.output(userAdherenceLogSelectAllZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		const adherenceLog = await db.userAdherenceLogs
			.find(id)
			.where({ userId: user.id });

		return adherenceLog;
	});

// Get adherence logs by supplement ID
const getBySupplementId = rpcProtectedProcedure
	.input(z.object({ supplementId: z.uuid() }))
	.output(z.array(userAdherenceLogSelectAllZod))
	.handler(async ({ input: { supplementId }, context: { user } }) => {
		const adherenceLogs = await db.userAdherenceLogs
			.select("*")
			.where({
				userId: user.id,
				supplementId,
			})
			.order({ scheduledFor: "DESC" });

		return adherenceLogs;
	});

// Get adherence logs by date range
const getByDateRange = rpcProtectedProcedure
	.input(
		z.object({
			startDate: z.number().int(),
			endDate: z.number().int(),
		}),
	)
	.output(z.array(userAdherenceLogSelectAllZod))
	.handler(async ({ input: { startDate, endDate }, context: { user } }) => {
		const adherenceLogs = await db.userAdherenceLogs
			.select("*")
			.where({ userId: user.id })
			.where({ scheduledFor: { gte: new Date(startDate) } })
			.where({ scheduledFor: { lte: new Date(endDate) } })
			.order({ scheduledFor: "DESC" });

		return adherenceLogs;
	});

// Create user adherence log
const create = rpcProtectedProcedure
	.input(userAdherenceLogCreateInputZod)
	.output(userAdherenceLogSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		const newAdherenceLog = await db.userAdherenceLogs.create({
			...input,
			userId: user.id,
		});

		return newAdherenceLog;
	});

// Update user adherence log
const update = rpcProtectedProcedure
	.input(
		userAdherenceLogUpdateInputZod.extend({
			id: z.uuid(),
		}),
	)
	.output(userAdherenceLogSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		const { id, ...updateData } = input;

		// First, get the existing adherence log to check the date
		const existingLog = await db.userAdherenceLogs
			.find(id)
			.where({ userId: user.id });

		if (!existingLog) {
			throw new ORPCError("NOT_FOUND", {
				status: 404,
				message: "Adherence log not found",
			});
		}

		// Check if daily compliance has been updated
		const complianceUpdated = await isDailyComplianceUpdated(
			user.id,
			existingLog.scheduledFor,
		);

		if (complianceUpdated) {
			throw new ORPCError("FORBIDDEN", {
				status: 403,
				message: "Cannot update adherence log: daily compliance has already been finalized",
			});
		}

		const updatedAdherenceLog = await db.userAdherenceLogs
			.selectAll()
			.find(id)
			.where({ userId: user.id })
			.update(updateData);

		return updatedAdherenceLog;
	});

// Delete user adherence log
const deleteLog = rpcProtectedProcedure
	.input(userAdherenceLogDeleteZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		// First, get the existing adherence log to check the date
		const existingLog = await db.userAdherenceLogs
			.find(id)
			.where({ userId: user.id });

		if (!existingLog) {
			throw new ORPCError("NOT_FOUND", {
				status: 404,
				message: "Adherence log not found.",
			});
		}

		// Check if daily compliance has been updated
		const complianceUpdated = await isDailyComplianceUpdated(
			user.id,
			existingLog.scheduledFor,
		);

		if (complianceUpdated) {
			throw new ORPCError("FORBIDDEN", {
				status: 403,
				message: "Cannot delete adherence log: daily compliance has already been finalized",
			});
		}

		await db.userAdherenceLogs
			.find(id)
			.where({ userId: user.id })
			.delete();

		return { success: true };
	});

export const userAdherenceLogsRouter = {
	getAll,
	getById,
	getBySupplementId,
	getByDateRange,
	create,
	update,
	delete: deleteLog,
};
