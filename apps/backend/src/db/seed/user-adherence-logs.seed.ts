import { db } from "@backend/db/db"
import { USER_ADHERENCE_STATUS_ENUM } from "@connected-repo/zod-schemas/enums.zod"

export async function seedUserAdherenceLogsForUser(userId: string) {
	console.info(`Seeding user adherence logs for user: ${userId}`)

	// Get all supplements for this user
	const supplementRows = await db.supplements.where({ userId }).select("id")
	const supplementIds: string[] = supplementRows.map((s: { id: string }) => s.id)

	if (supplementIds.length === 0) {
		console.warn(`No supplements found for user: ${userId}. Skipping adherence logs seeding.`)
		return
	}

	// User adherence status enum
	const statuses: typeof USER_ADHERENCE_STATUS_ENUM = [
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

	// Seed logs for today, for 2 random supplements per user
	let ct = 0
	const randomSuppIds = supplementIds
		.slice()
		.sort(() => 0.5 - Math.random())
		.slice(0, Math.min(2, supplementIds.length))
	
	for (const supplementId of randomSuppIds) {
		const status = statuses[Math.floor(Math.random() * statuses.length)]!

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
	
	console.info(`Seeded ${ct} user adherence logs for user: ${userId}!`)
}


