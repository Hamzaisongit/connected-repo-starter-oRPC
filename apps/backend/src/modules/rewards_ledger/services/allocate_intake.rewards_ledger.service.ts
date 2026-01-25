import { Db } from "@backend/db/db";
import { UserIntakeStatus } from "@connected-repo/zod-schemas/enums.zod";

export async function allocateAdherenceReward(
  log: {
    id: string;
    status: UserIntakeStatus;
    userId: string;
  },
  orm: Db
) {
  const onTime = log.status === "Taken on-time";
  const reason = onTime ? "Supplement taken on-time." : "Supplement taken late.";
  // Earn 10 coins
  return orm.rewardsLedger.create({
    userId: log.userId,
    intakeLogId: log.id,
    amountCoins: onTime ? 10 : 5,
    amountShields: 0,
    reason,
    transactionType: "Earn"
  });
} 