import { BaseTable } from "@backend/db/base_table";
import { seedUserDataForUser } from "@backend/services/seed-user-data.service";
import { isTest } from "@backend/configs/env.config";

export class UserTable extends BaseTable {
	readonly table = "users";

	columns = this.setColumns((t) => ({
		id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
		email: t.string().unique(),
		emailVerified: t.boolean().default(false),
		name: t.string(),
		image: t.string().nullable(),
		timeZone: t.string().nullable(),
		...t.timestamps(),
	}));

	init(orm: typeof import("@backend/db/db").db) {
		this.afterCreateCommit(['id'], async (userData) => {
			try {
				// Only seed mock data in test mode
				if (!isTest) {
					return;
				}

				// userData is an array containing created user object
				const userArray = userData as any[];
				const user = userArray[0]; // Get first user object
				const userId = user?.id;
				
				if (!userId) {
					console.error('No user ID found in hook data:', userData);
					return;
				}
				
				// Seed mock data for the newly created user (only in test mode)
				await seedUserDataForUser(userId);
			} catch (error) {
				console.error(`Failed to seed data for user:`, error);
				// Don't throw error to avoid breaking user creation
				// The user can still function without mock data
			}
		});
	}
}