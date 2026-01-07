import { BaseTable } from "@backend/db/base_table";

export class UserTable extends BaseTable {
	readonly table = "users";

	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		email: t.string().unique(),
		emailVerified: t.boolean().default(false),
		image: t.string().nullable(),
		name: t.string(),
		notificationPreferences: t.json().default(
			JSON.stringify({
				emailNotification: true,
				pushNotification: true,
			}),
		),
		timezone: t.string().nullable(),
		themeSetting: t.themeSettingEnum().default("light"),
		...t.timestamps(),
	}));
}