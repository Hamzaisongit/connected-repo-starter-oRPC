import { db } from "@backend/db/db";
import type { USER_ADHERENCE_STATUS_ENUM } from "@connected-repo/zod-schemas/enums.zod";

export async function seedUserAdherenceLogsForUser(userId: string) {
	console.info(`Seeding user adherence logs for user: ${userId}`);

	const supplementRows = await db.supplements.where({ userId }).select("id");
	const supplementIds: string[] = supplementRows.map((s: { id: string }) => s.id);

	if (supplementIds.length === 0) {
		console.warn(`No supplements found for user: ${userId}. Skipping adherence logs seeding.`);
		return;
	}

	const statuses: typeof USER_ADHERENCE_STATUS_ENUM = [
		"Taken on-time",
		"Taken late",
		"Missed",
		"Skipped",
	] as const;

	const reasons = [
		null,
		"Forgot to take",
		"Felt unwell",
		"Out of stock",
		"Traveling",
		"Busy schedule",
	];

	const now = Date.now();
	const oneDayMs = 24 * 60 * 60 * 1000;

	let ct = 0;
	const randomSuppIds = supplementIds
		.slice()
		.sort(() => 0.5 - Math.random())
		.slice(0, Math.min(2, supplementIds.length));

	// Add logs for the past 10 days for each of the (up to 2) supplements
	for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
		for (const supplementId of randomSuppIds) {
			const status = statuses[Math.floor(Math.random() * statuses.length)]!;

			const reason = status === "Missed" || status === "Skipped"
				? reasons[Math.floor(Math.random() * reasons.length)]
				: null;

			// Random scheduled time during the day, subtracted dayOffset days ago
			const randomHour = 8 + Math.floor(Math.random() * 10); // Between 8am and 6pm
			const randomMinute = Math.floor(Math.random() * 60);
			const scheduledFor = now - (dayOffset + 1) * oneDayMs + (randomHour * 60 + randomMinute) * 60 * 1000;

			let actualAt: number;
			if (status === "Taken on-time") {
				actualAt = scheduledFor;
			} else if (status === "Taken late") {
				actualAt = scheduledFor + (Math.floor(Math.random() * 60) + 5) * 60 * 1000;
			} else {
				actualAt = scheduledFor;
			}

			try {
				await db.userAdherenceLogs.create({
					userId,
					supplementId,
					status,
					reason,
					scheduledFor,
					actualAt,
					timeZoneOffset: Number(-new Date().getTimezoneOffset()),
				});
			} catch (err) {
				console.error(
					"Failed to insert userAdherenceLog row. Details:",
					{
						userId,
						supplementId,
						status,
						reason,
						scheduledFor,
						actualAt,
						timeZoneOffset: Number(-new Date().getTimezoneOffset()),
					},
					"Error:",
					err,
				);
				throw err;
			}

			ct++;
		}
	}

	console.info(`Seeded user adherence logs for users!`);
}