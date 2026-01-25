import { BaseTable, sql } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { UserIntakeLogTable } from "@backend/modules/logs/tables/user_adherence_logs.table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class RewardsLedgerTable extends BaseTable {
  readonly table = "rewards_ledger";

  columns = this.setColumns((t) => ({
    rewardLedgerId: t.ulid().primaryKey(),
    userId: t.uuid().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    intakeLogId: t.uuid().nullable(),
    amountCoins: t.smallint(),
    amountShields: t.smallint(),
    reason: t.string(),
    transactionType: t.rewardsTransactionTypeEnum(),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    }),
    intakeLog: this.belongsTo(() => UserIntakeLogTable, {
      columns: ["intakeLogId"],
      foreignKey: false, // Because intake log might be deleted.
      references: ["id"],
    })
  }

  init(orm: Db) {
    this.afterCreate(["userId", "amountCoins", "amountShields"], async (ledgers) => {
      await Promise.all(ledgers.map(async (ledger) => 
        orm.userStats.where({ userId: ledger.userId }).updateOrThrow({
          shieldsBalance: () => sql`"shields_balance" + ${ledger.amountShields}`,
          coinsBalance: () => sql`"coins_balance" + ${ledger.amountCoins}`
        })
      ));
    });
    this.beforeUpdate(() => {
      throw new Error("Rewards ledger entries cannot be updated");
    });
    this.beforeDelete(() => {
      throw new Error("Rewards ledger entries cannot be deleted");
    });
  }
}