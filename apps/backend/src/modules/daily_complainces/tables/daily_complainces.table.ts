import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class DailyComplianceTable extends BaseTable {
  readonly table = "daily_compliances";

  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    intakePercentage: t.decimal(),
    date: t.date(),
    dailyShieldOpeningBalance: t.smallint(),
    dailyShieldClosingBalance: t.smallint(),
    dailyShieldUsed: t.boolean(),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    })
  }

  init(_orm: Db) {
    this.afterUpdateCommit(["userId"], () => {
      // Update user-stats table with streak info
    });
  }
}