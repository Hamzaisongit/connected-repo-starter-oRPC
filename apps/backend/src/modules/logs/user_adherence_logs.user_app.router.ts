import { db } from "@backend/db/db";
import { isDailyComplianceCreated } from "@backend/modules/daily_complainces/services/is_created.daily_compliance.service";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import {
	userIntakeLogCreateInputZod,
	userIntakeLogDeleteZod,
	userIntakeLogGetByIdZod,
	userIntakeLogSelectAllZod,
	userIntakeLogUpdateInputZod,
} from "@connected-repo/zod-schemas/user_adherence_log.zod";
import { zTimeEpoch, zTimezone } from "@connected-repo/zod-schemas/zod_utils";
import { ORPCError } from "@orpc/server";
import z from "zod";

// All date-based calculations are performed at the database level to ensure timezone awareness.

// Get all user adherence logs for the authenticated user
const getAll = rpcProtectedProcedure
	.output(z.array(userIntakeLogSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const intakeLogs = await db.userIntakeLogs
			.select("*")
			.where({ userId: user.id })
			.order({
				actualAt: "DESC"
			});

		return intakeLogs;
	});

// Get user adherence log by ID
const getById = rpcProtectedProcedure
	.input(userIntakeLogGetByIdZod)
	.output(userIntakeLogSelectAllZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		return await db.userIntakeLogs
        .find(id)
        .where({ userId: user.id })
        .select("*");
	});

// Get adherence logs by supplement ID
const getBySupplementId = rpcProtectedProcedure
	.input(z.object({ supplementId: z.uuid() }))
	.output(z.array(userIntakeLogSelectAllZod))
	.handler(async ({ input: { supplementId }, context: { user } }) => {
		const intakeLogs = await db.userIntakeLogs
			.select("*")
			.where({
				userId: user.id,
				supplementId,
			})
			.order({
				actualAt: "DESC"
			});

		return intakeLogs;
	});

// Get adherence logs by date range
const getByDateRange = rpcProtectedProcedure
	.input(
		z.object({
			startDate: z.number().int(),
			endDate: z.number().int(),
		}),
	)
	.output(z.array(userIntakeLogSelectAllZod))
	.handler(async ({ input: { startDate, endDate }, context: { user } }) => {
		const intakeLogs = await db.userIntakeLogs
			.select("*")
			.where({ 
				userId: user.id,
				scheduledFor: { 
					gte: new Date(startDate),
					lte: new Date(endDate) 
				} 
			})
			.order({
				scheduledFor: "DESC"
			});

		return intakeLogs;
	});

// Create user adherence log
const create = rpcProtectedProcedure
	.input(userIntakeLogCreateInputZod)
	.output(userIntakeLogSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		const newIntakeLog = await db.userIntakeLogs.create({
			...input,
			userId: user.id,
		});

		return newIntakeLog;
	});

// Update user adherence log
const update = rpcProtectedProcedure
	.input(
		userIntakeLogUpdateInputZod.extend({
			id: z.uuid(),
			logTimezone: zTimezone,
			scheduledFor: zTimeEpoch,
		}),
	)
	.output(userIntakeLogSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		const { id, logTimezone, scheduledFor, ...updateData } = input;

		// Check if daily compliance has been updated
		const complianceUpdated = await isDailyComplianceCreated(
			user.id,
			logTimezone,
			input.scheduledFor,
		);

		if (complianceUpdated) {
			throw new ORPCError("FORBIDDEN", {
				status: 403,
				message: "Cannot update adherence log: daily compliance has already been finalized",
			});
		}

		await db.userIntakeLogs
			.find(id)
			.where({ userId: user.id })
			.update(updateData);

		const updatedIntakeLog = await db.userIntakeLogs
			.find(id)
			.where({ userId: user.id });

		return updatedIntakeLog;
	});

// Delete user adherence log
const deleteLog = rpcProtectedProcedure
	.input(userIntakeLogDeleteZod)
	.handler(async ({ input: { id, logTimezone, scheduledFor }, context: { user } }) => {
		// Check if daily compliance has been updated
		const complianceUpdated = await isDailyComplianceCreated(
			user.id,
			logTimezone,
			scheduledFor,
		);

		if (complianceUpdated) {
			throw new ORPCError("FORBIDDEN", {
				status: 403,
				message: "Cannot delete adherence log: daily compliance has already been finalized",
			});
		}

		await db.userIntakeLogs
			.find(id)
			.where({ userId: user.id })
			.delete();

		return { success: true };
	});

export const userIntakeLogsRouter = {
	getAll,
	getById,
	getBySupplementId,
	getByDateRange,
	create,
	update,
	delete: deleteLog,
};
