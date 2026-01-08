import { BaseTable } from "@backend/db/base_table";
import { UserAdherenceLogTable } from "@backend/modules/logs/tables/user_adherence_logs.table";
import { UserTable } from "@backend/modules/users/tables/users.table";
import { DaysOfWeek } from "@connected-repo/zod-schemas/enums.zod";

export class UserStackTable extends BaseTable {
  readonly table = "user_stacks";

  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    userId: t.uuid().foreignKey("users", "id", {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT"
    }),
    name: t.string(),
    instructions: t.array(t.string()),
    isActive: t.boolean(),
    dosage: t.smallint(),
    unit: t.string(),
    reminderDays: t.array(t.string().narrowType((t) => t<DaysOfWeek>())),
    reminderTime: t.time().default("08:00:00"),
    imageUrl: t.string().nullable(),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    }),
    intakeLogs: this.hasMany(() => UserAdherenceLogTable, {
      columns: ["id"],
      references: ["supplementId"]
    })
  }
}