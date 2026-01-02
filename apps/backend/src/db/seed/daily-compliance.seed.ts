import { db } from "@backend/db/db"

export async function seedDailyCompliance() {
	console.info("Seeding daily_compliance...")

	// Clear existing daily_compliance entries
	await db.dailyCompliances.where({}).delete()

	const userIds = [
		"00000000-0000-0000-0000-000000000001",
		"00000000-0000-0000-0000-000000000002",
		"00000000-0000-0000-0000-000000000003",
		"00000000-0000-0000-0000-000000000004",
		"00000000-0000-0000-0000-000000000005",
		"00000000-0000-0000-0000-000000000006"
	]

	// Seed 10 days per user (fake data), start 10 days ago
	const baseDate = new Date()
	baseDate.setHours(12, 0, 0, 0)
	for (const userId of userIds) {
		let dailyShield = 3
		for (let i = 0; i < 10; i++) {
			const date = new Date(baseDate)
			date.setDate(baseDate.getDate() - i)
			const adherencePercentage = 70 + Math.floor(Math.random() * 31) // 70-100
			const shieldUsed = Math.random() > 0.7 // 30% chance of using shield
			const openingBalance = dailyShield
			const closingBalance = shieldUsed ? Math.max(0, openingBalance - 1) : openingBalance
			dailyShield = closingBalance
			await db.dailyCompliances.create({
				userId,
				adherencePercentage,
				date: date.getTime(),
				dailyShieldOpeningBalance: openingBalance,
				dailyShieldClosingBalance: closingBalance,
				dailyShieldUsed: shieldUsed,
			})
		}
	}
	console.info("daily_compliance seeded successfully!")
}
