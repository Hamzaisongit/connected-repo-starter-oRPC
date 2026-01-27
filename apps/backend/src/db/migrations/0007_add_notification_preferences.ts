import { change } from '../db_script';

change(async (db) => {
	await db.addColumn(
		"users",
		"emailNotificationPreference",
		(t) => t.boolean().default(true),
	);
	await db.addColumn(
		"users",
		"pushNotificationPreference",
		(t) => t.boolean().default(true),
	);
});
