import { db } from "@backend/db/db"

export async function seedUserStatsForUser(userId: string) {
	console.info(`Seeding user stats for user: ${userId}`)

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

	console.info(`User stats seeded successfully for user: ${userId}!`)
}


