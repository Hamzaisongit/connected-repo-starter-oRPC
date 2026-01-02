import { db } from "@backend/db/db"

export async function seedUserStats() {
	console.info("Seeding user_stats...")

	// Clear existing stats
	await db.userStats.where({}).delete()

	const userIds = [
		"00000000-0000-0000-0000-000000000001",
		"00000000-0000-0000-0000-000000000002",
		"00000000-0000-0000-0000-000000000003",
		"00000000-0000-0000-0000-000000000004",
		"00000000-0000-0000-0000-000000000005",
		"00000000-0000-0000-0000-000000000006"
	]

	for (const userId of userIds) {
		const currentStreak = Math.floor(Math.random() * 10)
		const longestStreak = currentStreak + Math.floor(Math.random() * 5)
		const currentStreakShieldsUsed = Math.floor(Math.random() * 4)
		const longestStreakShieldsUsed = currentStreakShieldsUsed + Math.floor(Math.random() * 2)

		await db.userStats.create({
			userId,
			currentStreak,
			longestStreak,
			currentStreakShieldsUsed,
			longestStreakShieldsUsed,
		})
	}

	console.info("User stats seeded successfully!")
}
