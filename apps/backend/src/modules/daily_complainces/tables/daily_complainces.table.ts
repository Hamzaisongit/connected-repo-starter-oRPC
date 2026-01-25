import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { updateUserStreakService } from "@backend/modules/users/services/update_streaks.users.service";
import { UserTable } from "@backend/modules/users/tables/users.table";

export class DailyComplianceTable extends BaseTable {
  readonly table = "daily_compliances";

  columns = this.setColumns(
    (t) => ({
      id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
      userId: t.uuid().foreignKey("users", "id", {
        onDelete: "CASCADE",
        onUpdate: "RESTRICT"
      }),
      intakeCount: t.smallint().default(0),
      intakePercentage: t.decimal(),
      date: t.date(),
      shieldsOpeningBalance: t.smallint(),
      shieldsClosingBalance: t.smallint(),
      shieldsUsed: t.smallint().default(0),
      totalSupplements: t.smallint().default(0),
      ...t.timestamps(),
    }),
    (t) => [
      t.index([
        "userId",
        {
          column: "date",
          order: "DESC"
        }
      ])
    ]
  );

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    })
  }

  init(orm: Db) {
    this.afterCreate(
      ["userId", "intakePercentage", "shieldsUsed", "totalSupplements"], 
      async (dailyCompliances) => {
        await Promise.all(dailyCompliances.map(async (compliance) => 
          updateUserStreakService(
            compliance.intakePercentage,
            orm,
            compliance.shieldsUsed,
            !Boolean(compliance.totalSupplements), // If no supplements for the day, the streak is considered to be paused.
            compliance.userId
          )
        ));
      }
    );
    this.afterUpdate([], () => {
      throw new Error("DailyCompliance updates are not allowed");
    });
    this.afterDelete([], () => {
      throw new Error("DailyCompliance deletes are not allowed");
    });
  }
}