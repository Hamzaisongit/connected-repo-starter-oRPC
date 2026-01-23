import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";

// All date-based calculations are performed at the database level to ensure timezone awareness.
import type { UserIntakeStatus } from "@connected-repo/zod-schemas/enums.zod";
import {
	todaysPlanZod,
	userStackCreateInputZod,
	userStackDeleteZod,
	userStackGetByIdZod,
	userStackSelectAllZod,
	userStackUpdateInputZod,
} from "@connected-repo/zod-schemas/user_stack.zod";
import z from "zod";

// Get all user stacks for the authenticated user
const getAll = rpcProtectedProcedure
	.output(z.array(userStackSelectAllZod))
	.handler(async ({ context: { user } }) => {
		const userStacks = await db.userStacks
			.select("*")
			.where({ userId: user.id })
			.order({
				createdAt: "DESC"
			});

		return userStacks;
	});

// Get user stack by ID
const getById = rpcProtectedProcedure
	.input(userStackGetByIdZod)
	.output(userStackSelectAllZod)
	.handler(async ({ input: { id }, context: { user } }) => {
		const userStack = await db.userStacks
			.find(id)
			.where({ userId: user.id })
			.select("*");

		return userStack;
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

		return newUserStack;
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
	.handler(async ({ context: { user: { id: userId, timezone: userTz} } }) => {

		// Get all user stacks
		const todaysSupplements = await db.userStacks
			.select("*", {
				todayIntakeLog: (q) => q.intakeLogs
					.select("actualAt", "id", "logTimezone","scheduledFor", "status")
					.where(sql`DATE("scheduled_for" AT TIME ZONE 'UTC' AT TIME ZONE ${userTz}) = (CURRENT_TIMESTAMP AT TIME ZONE ${userTz})::date`)
					.takeOptional()
			})
			.where({ userId: userId, isActive: true })// 2. Filter stacks where today's day name exists in the reminder_days array
      .where(sql`trim(to_char(CURRENT_TIMESTAMP AT TIME ZONE ${userTz}, 'Day')) = ANY("reminder_days")`);

		

		// Determine status for each supplement
		const supplementsWithStatus = todaysSupplements.map(supplement => {

			let status: UserIntakeStatus | "pending" | "overdue";
			const currentTime = new Date().toLocaleTimeString('en-GB', {timeZone: userTz}).slice(0, 5); // HH:MM format in user tz

			if (supplement.todayIntakeLog) {
				status = supplement.todayIntakeLog.status
			} else if (currentTime > supplement.reminderTime) {
				status = "overdue";
			} else {
				status = "pending";
			}

			return {
				...supplement,
				status,
			};
		});

		// Calculate stats
		const totalCount = supplementsWithStatus.length;
		const takenCount = supplementsWithStatus.filter(s => s.todayIntakeLog).length;
		const overdueCount = supplementsWithStatus.filter(s => s.status === "overdue" || s.status === "Missed").length;
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
