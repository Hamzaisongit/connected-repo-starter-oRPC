import { sql } from "@backend/db/base_table";
import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { UserAdherenceStatus } from "@connected-repo/zod-schemas/enums.zod";
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
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const currentDayOfWeek = dayNames[now.getDay()];

		// Get all user stacks
		const todaysSupplements = await db.userStacks
			.select("*", {
				todayIntakeLog: (q) => q.intakeLogs
					.select("actualAt", "id", "status")
					.where(sql`actual_at >= ${today} AND actual_at < ${tomorrow}`)
					.takeOptional()
			})
			.where({ userId: user.id, isActive: true })
			.where(sql`${currentDayOfWeek} = ANY(reminder_days)`);

		

		// Determine status for each supplement
		const supplementsWithStatus = todaysSupplements.map(supplement => {

			let status: UserAdherenceStatus | "pending" | "overdue";
			const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

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
