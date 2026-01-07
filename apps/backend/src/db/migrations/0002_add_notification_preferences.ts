import { change } from '../db_script';

change(async (db) => {
	await db.addColumn(
		"users",
		"notificationPreferences",
		(t) => t.json().default({
			emailNotification: true,
			pushNotification: true,
		}),
	);
});
