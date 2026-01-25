import { Db } from "@backend/db/db";
import { UserIntakeStatus } from "@connected-repo/zod-schemas/enums.zod";

export const revertAdherenceReward = async (
  log: {
    id: string;
    status: UserIntakeStatus;
    userId: string;
  },
  orm: Db
) => {
  const onTime = log.status === "Taken on-time";
    // Revoke 10 coins
    return orm.rewardsLedger.create({
      userId: log.userId,
      intakeLogId: log.id,
      amountCoins: onTime ? -10 : -5,
      amountShields: 0,
      reason: onTime ? "Revert supplement taken on-time." : "Revert supplement taken late.",
      transactionType: "Revert"
    });
} 