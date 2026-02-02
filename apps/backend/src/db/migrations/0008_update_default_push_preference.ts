import { change } from "../db_script";

change(async (db) => {
	// Update the default value of pushNotificationPreference to false
	await db.changeTable("users", (t) => ({
		pushNotificationPreference: t.change(
			t.boolean().default(true),
			t.boolean().default(false),
		),
	}));

	// Update all current users so pushNotificationPreference is false
	await db.query`
		UPDATE "users"
		SET "push_notification_preference" = false
	`;
});













    