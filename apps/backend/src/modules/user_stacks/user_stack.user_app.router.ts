import { db } from "@backend/db/db";
import { daysPlanUserStacksService } from "@backend/modules/user_stacks/services/days_plan.user_stacks.services";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { dayJsTz } from "@backend/utils/dayjs.utils";
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
			.updateOrThrow(updateData);

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
		return await daysPlanUserStacksService({
			planDate: dayJsTz(userTz).format('YYYY-MM-DD'),
			userId,
			userTz: userTz || 'UTC',
		})
	});

export const userStackRouter = {
	getAll,
	getById,
	getTodaysPlan,
	create,
	update,
	delete: deleteStack,
};
