import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import {
	rewardsLedgerGetByUserInputZod,
	rewardsLedgerSelectAllZod,
} from "@connected-repo/zod-schemas/rewards_ledger.zod";
import { ORPCError } from "@orpc/server";
import z from "zod";

const getEntryCount = rpcProtectedProcedure
	.input(z.object({ itemType: z.enum(["all", "coins", "shields"]) }))
	.output(z.number())
	.handler(async ({ context: { user }, input: { itemType } }) => {

		let query = db.rewardsLedger.where({ userId: user.id });

		// Filter by type if specified
		if (itemType === "coins") {
			query = query.where({ amountCoins: { not: 0 } });
		} else if (itemType === "shields") {
			query = query.where({ amountShields: { not: 0 } });
		};

		return await query.count();
	});

const getRewardsHistory = rpcProtectedProcedure
	.input(rewardsLedgerGetByUserInputZod)
	.output(
		z.object({
			items: z.array(rewardsLedgerSelectAllZod),
			nextCursor: z.ulid().nullable()
		}),
	)
	.handler(async ({ input, context: { user } }) => {
		const { itemType, limit, cursor } = input;

		let query = db.rewardsLedger.where({ userId: user.id });

		// Filter by type if specified
		if (itemType === "coins") {
			query = query.where({ amountCoins: { not: 0 } });
		} else if (itemType === "shields") {
			query = query.where({ amountShields: { not: 0 } });
		}
		
		// Apply cursor-based pagination
		if (cursor) {
			query = query.where({ rewardLedgerId: { lt: cursor } });
		}

		const items = await query
			.selectAll()
			.order({ rewardLedgerId: "DESC" })
			.limit(limit);

		return {
			items,
			nextCursor: items.length === limit ? items[items.length - 1]?.rewardLedgerId || null : null,
		};
	});

const buyShields = rpcProtectedProcedure
	.input(z.object({ shieldCount: z.number().int().positive() }))
	.output(z.object({ success: z.boolean(), newShieldsBalance: z.number(), newCoinsBalance: z.number() }))
	.handler(async ({ context: { user }, input: { shieldCount } }) => {
		const COINS_PER_SHIELD = 50;
		const totalCoinCost = shieldCount * COINS_PER_SHIELD;

		// Get current user stats
		const userStats = await db.userStats
			.selectAll()
			.where({ userId: user.id })
			.takeOptional();
		
		if (!userStats) {
			throw new ORPCError("NOT_FOUND", {
				message: "User stats not found",
			});
		}

		// Validate user has enough coins
		if (userStats.coinsBalance < totalCoinCost) {
			throw new ORPCError("BAD_REQUEST", {
				message: `Insufficient coins. You need ${totalCoinCost} coins but only have ${userStats.coinsBalance}`,
			});
		}

		// Create ledger entry - this will auto-update the balances via hook
		await db.rewardsLedger.create({
			userId: user.id,
			intakeLogId: null,
			amountCoins: -totalCoinCost,
			amountShields: shieldCount,
			reason: `Purchased ${shieldCount} shield${shieldCount > 1 ? "s" : ""} for ${totalCoinCost} coins`,
			transactionType: "Convert",
		});

		// Get updated balances
		const updatedStats = await db.userStats
			.selectAll()
			.where({ userId: user.id })
			.take();

		return {
			success: true,
			newShieldsBalance: updatedStats.shieldsBalance,
			newCoinsBalance: updatedStats.coinsBalance,
		};
	});

export const rewardsLedgerRouter = {
	getEntryCount,
	getRewardsHistory,
	buyShields,
};
