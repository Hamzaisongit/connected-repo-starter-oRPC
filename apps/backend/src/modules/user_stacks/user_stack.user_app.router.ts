import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import {
	userStackCreateInputZod,
	userStackDeleteZod,
	userStackGetByIdZod,
	userStackSelectAllZod,
	userStackUpdateInputZod,
	todaysPlanZod,
} from "@connected-repo/zod-schemas/user_stack.zod";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";
import { userAdherenceStatusZod } from "@connected-repo/zod-schemas/enums.zod";
import z from "zod";

// Get all user stacks for the authenticated user
const getAll = rpcProtectedProcedure
	.output(z.array(userStackSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const userStacks = await db.userStacks
			.select("*")
			.where({ userId: user.id })
			.order({ createdAt: "DESC" });

		return userStacks as z.infer<typeof userStackSelectAllZod>[];
	});

// Get user stack by ID
const getById = rpcProtectedProcedure
	.input(userStackGetByIdZod)
	.output(userStackSelectAllZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		const userStack = await db.userStacks
			.find(id)
			.where({ userId: user.id });

		return userStack as z.infer<typeof userStackSelectAllZod>;
	});

// Create user stack
const create = rpcProtectedProcedure
	.input(userStackCreateInputZod)
	.output(userStackSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		const newUserStack = await db.userStacks.create({
			...input,
			userId: user.id,
		});

		return newUserStack as z.infer<typeof userStackSelectAllZod>;
	});

// Update user stack
const update = rpcProtectedProcedure
	.input(
		userStackUpdateInputZod.extend({
			id: z.uuid(),
		}),
	)
	.handler(async ({ input, context: { user } }) => {
		const { id, ...updateData } = input;

		const updatedUserStack = await db.userStacks
			.selectAll()
			.find(id)
			.where({ userId: user.id })
			.update(updateData);

		return updatedUserStack;
	});

// Delete user stack
const deleteStack = rpcProtectedProcedure
	.input(userStackDeleteZod)
	.handler(async ({ input: { id }, context: { user } }) => {

		await db.userStacks
			.find(id)
			.where({ userId: user.id })
			.delete();

		return { success: true };
	});

// Get today's plan with supplement status
const getTodaysPlan = rpcProtectedProcedure
	.output(todaysPlanZod)
	.handler(async ({ context: { user } }) => {
		const now = new Date();
		const today = DAYS_OF_WEEK_ENUM[now.getDay()] as (typeof DAYS_OF_WEEK_ENUM)[number];
		const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

		// Get all user stacks
		const userStacks = await db.userStacks
			.selectAll()
			.where({ userId: user.id, isActive: true });

		// Filter to today's supplements
		const todaysSupplements = userStacks
			.filter(stack => stack.reminderDays.includes(today))
			.map(stack => {
				// Create an entry for the scheduled time
				const scheduledTime = stack.reminderTime.slice(0, 5); // HH:MM from HH:MM:SS
				return {
					...stack,
					scheduledTime,
					isOverdue: scheduledTime < currentTime,
				};
			});

		// Get today's adherence logs to determine status
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

		const todaysLogs = await db.userAdherenceLogs
			.selectAll()
			.where({ userId: user.id })
			.where({ scheduledFor: { gte: todayStart } })
			.where({ scheduledFor: { lte: todayEnd } });

		// Create a map of supplementId + scheduledTime to log data
		const logStatusMap = new Map<string, { status: z.infer<typeof userAdherenceStatusZod>, logId: string }>();
		todaysLogs.forEach(log => {
			const key = `${log.supplementId}-${new Date(log.scheduledFor).toTimeString().slice(0, 5)}`;
			logStatusMap.set(key, { status: log.status, logId: log.id });
		});

		// Determine status for each supplement
		const supplementsWithStatus = todaysSupplements.map(supplement => {
			const key = `${supplement.id}-${supplement.scheduledTime}`;
			const logData = logStatusMap.get(key);

			let status: "pending" | "taken" | "missed" | "overdue";
			let logId: string | null = null;
			
			if (logData) {
				logId = logData.logId;
				if (logData.status === "Taken on-time" || logData.status === "Taken late") {
					status = "taken";
				} else if (logData.status === "Missed") {
					status = "missed";
				} else if (supplement.isOverdue) {
					status = "overdue";
				} else {
					status = "pending";
				}
			} else if (supplement.isOverdue) {
				status = "overdue";
			} else {
				status = "pending";
			}

			return {
				...supplement,
				status,
				logId,
			};
		});

		// Calculate stats
		const totalCount = supplementsWithStatus.length;
		const takenCount = supplementsWithStatus.filter(s => s.status === "taken").length;
		const overdueCount = supplementsWithStatus.filter(s => s.status === "overdue" || s.status === "missed").length;
		const compliancePercentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

		return {
			supplements: supplementsWithStatus,
			totalCount,
			takenCount,
			overdueCount,
			compliancePercentage,
		};
	});

export const userStackRouter = {
	getAll,
	getById,
	getTodaysPlan,
	create,
	update,
	delete: deleteStack,
};
