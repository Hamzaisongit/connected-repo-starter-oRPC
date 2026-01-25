import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { allocateAdherenceReward } from "@backend/modules/rewards_ledger/services/allocate_intake.rewards_ledger.service";
import { recordShieldUseRewardsLedgerService } from "@backend/modules/rewards_ledger/services/record_shield_use.rewards_ledger.service";
import { revertAdherenceReward } from "@backend/modules/rewards_ledger/services/revert_intake.rewards_ledger.service";
import { UserStackTable } from "@backend/modules/user_stacks/tables/user_stacks.table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class UserIntakeLogTable extends BaseTable {
  readonly table = "user_adherence_logs";

  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    supplementId: t.uuid().foreignKey("user_stacks", "id", {
      onDelete: "RESTRICT",
      onUpdate: "RESTRICT"
    }),
    reason: t.string().nullable(),
    status: t.userIntakeLogStatusEnum(),
    scheduledFor: t.timestampNumber(),
    actualAt: t.timestampNumber(),
    logTimezone: t.string().default("Etc/UTC"),
    ...t.timestamps(),
  }),
  (t) => t.index([
    "supplementId",
    {
      column: "scheduledFor",
      order: "DESC"
    }
  ])
);

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    }),
    supplement: this.belongsTo(() => UserStackTable, {
      columns: ["supplementId"],
      references: ["id"],
    })
  }

  init(orm: Db) {
    this.afterCreate(["userId", "status", "id"], async (logs) => {
      await Promise.all(logs.map(log => 
        log.status === "Taken on-time" || log.status == "Taken late"
          ? allocateAdherenceReward(log, orm)
          : log.status === "Shield used"
            ? recordShieldUseRewardsLedgerService(log.id, orm, log.userId)
            : Promise.resolve()
      ));
    });
    this.afterUpdate([], () => {
      throw new Error("UserIntakeLog updates are not allowed");
    });
    this.afterDelete(["userId", "status", "id"], async (logs) => {
      await Promise.all(
        logs.map(async (log) => 
          log.status === "Taken on-time" || log.status === "Taken late" && revertAdherenceReward(log, orm)
      ));
    });
  }
}