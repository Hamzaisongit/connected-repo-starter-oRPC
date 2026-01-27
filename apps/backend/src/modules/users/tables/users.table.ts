import { BaseTable } from "@backend/db/base_table";
import type { Db } from "@backend/db/db";
import { DailyComplianceTable } from "@backend/modules/daily_complainces/tables/daily_complainces.table";
import { userCreatedEventDef } from "@backend/modules/events/events.schema";
import { orchidToTbusQueryAdapter } from "@backend/modules/events/events.utils";
import { tbus } from "@backend/modules/events/tbus";
import { suprClient } from "@backend/modules/notifications/suprsend.config";
import { UserStatTable } from "@backend/modules/users/tables/user_stats.table";
import { logger } from "@backend/utils/logger.utils";

export class UserTable extends BaseTable {
	readonly table = "users";

  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.string().unique(),
    emailVerified: t.boolean().default(false),
    name: t.string(),
	emailNotificationPreference: t.boolean().default(true),
	pushNotificationPreference: t.boolean().default(true),
    image: t.string().nullable(),
    timezone: t.string().default("Etc/UTC"),
    themeSetting: t.themeSettingEnum().default("light"),
    ...t.timestamps(),
  }));

  relations = {
    dailyCompliances: this.hasMany(() => DailyComplianceTable, {
      columns: ["id"],
      references: ["userId"]
    }),
    userStats: this.hasOne(() => UserStatTable, {
      columns: ["id"],
      references: ["userId"]
    })
  };

  init(orm: Db) {
    this.afterCreate(["id","email","name"], async (users) => {
		await Promise.all(users.map(user =>
			orm.userStats.create({
				userId: user.id,
			})
		));

		await Promise.all(users.map(user => 	
			orm.rewardsLedger.create({
				userId: user.id,
				amountShields: 5,
				amountCoins: 0,
				reason: "Welcome bonus.",
				transactionType: "Assigned",
			})
		));

		//create a user instance with suprsend 
		await Promise.all(users.map(async user => {
			const suprUser = suprClient.user.get_instance(user.id)
			suprUser.add_email(user.email)
			suprUser.set("name", user.name)
			await suprUser.save()
		}))
    });
  
	this.afterCreateCommit(["id", "email", "name", "createdAt"], async (data, queryCtx) => {
		for (const user of data) {
			try {

				const eventData = {
					userId: user.id,
					email: user.email,
					name: user.name
				};

				await tbus.publish(userCreatedEventDef.from(eventData), { query: orchidToTbusQueryAdapter(queryCtx) });

				logger.info(
					{
						userId: user.id,
						eventName: "user.created",
					},
					"Successfully published user.created event",
				);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				logger.error(
					{
						userId: user.id,
						error: errorMessage,
					},
					"Failed to publish user.created event",
				);
			}
		}
	});


}
}