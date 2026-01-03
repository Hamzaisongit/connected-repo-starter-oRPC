import { db } from "@backend/db/db";

export async function seedDailyCompliances(userId: string) {
  console.info("Seeding daily compliances...");

  await db.dailyCompliances.where({ userId }).delete();

  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const date = now - i * 24 * 60 * 60 * 1000; // days ago
    await db.dailyCompliances.create({
      userId,
      adherencePercentage: (Math.random() * 100).toFixed(2),
      date,
      dailyShieldOpeningBalance: Math.floor(Math.random() * 5),
      dailyShieldClosingBalance: Math.floor(Math.random() * 5),
      dailyShieldUsed: Math.random() > 0.5,
    });
  }

  console.info(`✓ Seeded 30 daily compliances`);
}