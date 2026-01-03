import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class UserStatTable extends BaseTable {
  readonly table = "user_stats";

  columns = this.setColumns((t) => ({
    userId: t.uuid().primaryKey().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
		currentStreak: t.integer().default(0),
		longestStreak: t.integer().default(0),
		currentStreakShieldsUsed: t.smallint().default(0),
		longestStreakShieldsUsed: t.smallint().default(0),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    })
  }
}