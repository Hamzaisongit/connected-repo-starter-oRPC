import { BaseTable } from "@backend/db/base_table";
import { UserTable } from "@backend/modules/users/tables/users.table";

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
    days: t.daysOfWeekEnum(),
    timesOfDay: t.array(t.string()),
    imageUrl: t.string().nullable(),
    ...t.timestamps(),
  }));

  relations = {
    user: this.belongsTo(() => UserTable, {
      columns: ["userId"],
      references: ["id"],
    })
  }
}