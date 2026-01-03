import { userStackRouter } from '@backend/modules/user_stacks/user_stack.user_app.router';
import { defaultContext } from '@backend/test/setup';
import { createUserStackFixture } from '@connected-repo/zod-schemas/user_stack.fixture';
import { createRouterClient, type RouterClient } from '@orpc/server';
import { beforeEach, describe, expect, it } from 'vitest';

describe('User Stack Endpoints', () => {
	let defaultClient: RouterClient<typeof userStackRouter>;
	const unauthClient = createRouterClient(userStackRouter);

	const dummyStack = createUserStackFixture();

	beforeEach(() => {
		defaultClient = createRouterClient(userStackRouter, {
			context: defaultContext,
		});
	});

	describe('getAll', () => {
		it('should return empty array when user has no stacks', async () => {
			const result = await defaultClient.getAll();

			expect(result).toEqual([]);
		});

		it('should return user\'s stacks', async () => {
			// Create a test stack first
			const createResult = await defaultClient.create(dummyStack);

			expect(createResult).toBeDefined();
			expect(createResult.name).toBe(dummyStack.name);

			// Now get all stacks
			const result = await defaultClient.getAll();

			expect(result).toHaveLength(1);
			expect(result[0]?.name).toBe(dummyStack.name);
			expect(result[0]?.userId).toBe(defaultContext?.user.id);
		});

		it('should fail when user is not authenticated', async () => {
			await expect(unauthClient.getAll()).rejects.toThrow();
		});
	});

	describe('create', () => {
		it('should create a stack successfully', async () => {
			const result = await defaultClient.create(dummyStack);

			expect(result).toBeDefined();
			expect(result.name).toBe(dummyStack.name);
			expect(result.isActive).toBe(dummyStack.isActive);
			expect(result.userId).toBe(defaultContext?.user.id);
			expect(result.id).toBeDefined();
			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeDefined();
		});

		it('should fail when user is not authenticated', async () => {
			await expect(unauthClient.create(dummyStack)).rejects.toThrow();
		});
	});
});