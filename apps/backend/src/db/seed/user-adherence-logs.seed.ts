import { db } from "@backend/db/db"

export async function seedUserAdherenceLogs() {
	console.info("Seeding user adherence logs...")

	// Clear existing logs
	await db.userAdherenceLogs.where({}).delete()

	// Example user/supplement pairs from supplements seeder context
	const userIds = [
		"00000000-0000-0000-0000-000000000001",
		"00000000-0000-0000-0000-000000000002",
		"00000000-0000-0000-0000-000000000003",
		"00000000-0000-0000-0000-000000000004",
		"00000000-0000-0000-0000-000000000005",
		"00000000-0000-0000-0000-000000000006"
	]

	// Get all supplements
	const supplementRows = await db.supplements.where({}).select("id")
	const supplementIds: string[] = supplementRows.map((s: { id: string }) => s.id)

	// User adherence status enum
	const statuses = [
		"Taken on-time",
		"Taken late",
		"Missed",
		"Skipped"
	] as const

	const reasons = [
		null,
		"Forgot to take",
		"Felt unwell",
		"Out of stock",
		"Traveling",
		"Busy schedule"
	]

	const now = Date.now()

	// Seed logs for each user for today, for 2 supplements per user
	let ct = 0
	for (const userId of userIds) {
		const randomSuppIds = supplementIds
			.slice()
			.sort(() => 0.5 - Math.random())
			.slice(0, 2)
		for (const supplementId of randomSuppIds) {
			const status = statuses[Math.floor(Math.random() * statuses.length)]

			const reason = (status === "Missed" || status === "Skipped")
				? reasons[Math.floor(Math.random() * reasons.length)]
				: null

			// All dates in timestampnumber format (milliseconds since epoch)
			const scheduledFor: number =
				now -
				(Math.floor(Math.random() * 4) * 60 * 60 * 1000) // up to 4h ago

			let actualAt: number
			if (status === "Taken on-time") {
				actualAt = scheduledFor
			} else if (status === "Taken late") {
				actualAt = scheduledFor + (Math.floor(Math.random() * 60) + 5) * 60 * 1000 // 5-65 min late
			} else {
				// For missed/skipped, just use scheduled time
				actualAt = scheduledFor
			}

			try {
				await db.userAdherenceLogs.create({
					userId,
					supplementId,
					status,
					reason,
					scheduledFor: Number(scheduledFor),
					actualAt: Number(actualAt),
					timeZoneOffset: Number(-new Date().getTimezoneOffset())
				})
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
						timeZoneOffset: Number(-new Date().getTimezoneOffset())
					},
					"Error:",
					err
				)
				throw err
			}

			ct++
		}
	}
	console.info(`Seeded ${ct} user adherence logs!`)
}
