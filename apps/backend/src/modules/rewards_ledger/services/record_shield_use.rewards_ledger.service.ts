import { Db } from "@backend/db/db";

export const recordShieldUseRewardsLedgerService = async (
  intakeLogId: string,
  orm: Db,
  userId: string,
) => {
  await orm.rewardsLedger.create({
    userId,
    intakeLogId,
    amountCoins: 0,
    amountShields: -1,
    reason: "Shield used for missed supplement",
    transactionType: "Use",
  });
};