import { change } from "../db_script";

change(async (db) => {
	// Remove notification preference columns from users table
	await db.changeTable("users", (t) => ({
		pushNotificationPreference: t.drop(t.boolean()),
		emailNotificationPreference: t.drop(t.boolean()),
	}));
});










    