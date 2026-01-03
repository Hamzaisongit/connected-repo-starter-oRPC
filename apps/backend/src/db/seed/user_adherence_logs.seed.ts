import { db } from "@backend/db/db";

export async function seedUserAdherenceLogs(userId: string, stacks: any[]) {
	console.info("Seeding user adherence logs...");

	await db.userAdherenceLogs.where({ userId }).delete();

	const logs = [];
	const now = Date.now();
	for (let i = 0; i < 50; i++) {
		const scheduledFor = now - Math.random() * 30 * 24 * 60 * 60 * 1000;
		const isTaken = Math.random() > 0.1;
		const actualAt = isTaken ? scheduledFor + Math.random() * 60 * 60 * 1000 : scheduledFor; // for missed, set to scheduledFor
		const status = isTaken ? "Taken on-time" as const : "Missed" as const;

		logs.push({
			userId,
			supplementId: stacks[Math.floor(Math.random() * stacks.length)].id,
			reason: status === "Missed" ? "Forgot" : null,
			status,
			scheduledFor,
			actualAt,
			timeZoneOffset: -300, // example offset
		});
	}

	for (const log of logs) {
		await db.userAdherenceLogs.create(log);
	}

	console.info(`✓ Seeded ${logs.length} user adherence logs`);
}