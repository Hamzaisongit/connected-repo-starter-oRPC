import { seedSupplements } from "@backend/db/seed/supplements.seed"
import { seedUserAdherenceLogs } from "@backend/db/seed/user-adherence-logs.seed"
import { seedDailyCompliance } from "./daily-compliance.seed";
import { seedUserStats } from "./user-stats.seed";
import { seedUsers } from "./users.seed";

export const seed = async () => {
	console.info("Seeding database...");

	await seedUsers()
	await seedSupplements()
	await seedUserAdherenceLogs()
	await seedDailyCompliance()
	await seedUserStats()

	console.info("Seeding completed successfully!");
};

