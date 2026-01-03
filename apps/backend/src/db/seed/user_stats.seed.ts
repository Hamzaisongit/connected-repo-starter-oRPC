import { db } from "@backend/db/db";

export async function seedUserStats(userId: string) {
  console.info("Seeding user stats...");

  await db.userStats.where({ userId }).delete();

  await db.userStats.create({
    userId,
    currentStreak: 5,
    longestStreak: 10,
    currentStreakShieldsUsed: 1,
    longestStreakShieldsUsed: 2,
  });

  console.info("✓ Seeded user stats");
}