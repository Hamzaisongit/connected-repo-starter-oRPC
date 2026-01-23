import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
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
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    reason: t.string().nullable(),
    status: t.userIntakeLogStatusEnum(),
    scheduledFor: t.timestampNumber(),
    actualAt: t.timestampNumber(),
    logTimezone: t.string().default("Etc/UTC"),
    ...t.timestamps(),
  }));

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

  init(_orm: Db) {
    this.afterUpdateCommit(["userId", "supplementId"], () => {
      // If all supplements for the day have been taken, update the daily compliance table
    })
  }
}