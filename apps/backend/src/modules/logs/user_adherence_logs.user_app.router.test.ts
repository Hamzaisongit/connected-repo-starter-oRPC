import { db } from '@backend/db/db';
import { userIntakeLogsRouter } from '@backend/modules/logs/user_adherence_logs.user_app.router';
import { defaultContext } from '@backend/test/setup';
import { createUserIntakeLogFixture } from '@connected-repo/zod-schemas/user_adherence_log.fixture';
import { createUserStackFixture } from '@connected-repo/zod-schemas/user_stack.fixture';
import { createRouterClient, type RouterClient } from '@orpc/server';
import { beforeEach, describe, expect, it } from 'vitest';

describe('User Adherence Logs Endpoints', () => {
	let defaultClient: RouterClient<typeof userIntakeLogsRouter>;
	const unauthClient = createRouterClient(userIntakeLogsRouter);

	const dummyStack = createUserStackFixture();
	let dummyLog: ReturnType<typeof createUserIntakeLogFixture>;

	beforeEach(async () => {
		defaultClient = createRouterClient(userIntakeLogsRouter, {
			context: defaultContext,
		});
		// Create a stack first for the supplementId
		const stack = await db.userStacks.create({
			...dummyStack,
			userId: defaultContext?.user.id,
		});
		dummyLog = createUserIntakeLogFixture({ supplementId: stack.id });
	});

	describe('getAll', () => {
		it('should return empty array when user has no logs', async () => {
			const result = await defaultClient.getAll();

			expect(result).toEqual([]);
		});

		it('should return user\'s adherence logs', async () => {
			// Create a test log first
			const createResult = await defaultClient.create(dummyLog);

			expect(createResult).toBeDefined();
			expect(createResult.status).toBe(dummyLog.status);

			// Now get all logs
			const result = await defaultClient.getAll();

			expect(result).toHaveLength(1);
			expect(result[0]?.status).toBe(dummyLog.status);
			expect(result[0]?.userId).toBe(defaultContext?.user.id);
		});

		it('should fail when user is not authenticated', async () => {
			await expect(unauthClient.getAll()).rejects.toThrow();
		});
	});

	describe('create', () => {
		it('should create a log successfully', async () => {
			const result = await defaultClient.create(dummyLog);

			expect(result).toBeDefined();
			expect(result.status).toBe(dummyLog.status);
			expect(result.supplementId).toBe(dummyLog.supplementId);
			expect(result.userId).toBe(defaultContext?.user.id);
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeDefined();
		});

		it('should fail when user is not authenticated', async () => {
			await expect(unauthClient.create(dummyLog)).rejects.toThrow();
		});
	});
});