import { seedSupplementsForUser } from "@backend/db/seed/supplements.seed";
import { seedUserStatsForUser } from "@backend/db/seed/user-stats.seed";
import { seedDailyComplianceForUser } from "@backend/db/seed/daily-compliance.seed";
import { seedUserAdherenceLogsForUser } from "@backend/db/seed/user-adherence-logs.seed";
import { isTest } from "@backend/configs/env.config";

/**
 * Seeds all mock data for a specific user.
 * This function is called automatically when a new user is created via database hook (only in test mode).
 * 
 * @param userId - The ID of user to seed data for
 */
export async function seedUserDataForUser(userId: string): Promise<void> {
	// Only seed mock data in test mode
	if (!isTest) {
		console.warn(`Skipping user data seeding for user ${userId} - not in test mode`);
		return;
	}

	console.info(`Starting to seed all data for user: ${userId}`);

	try {
		// Step 1: Create supplements (required for adherence logs)
		await seedSupplementsForUser(userId);
		
		// Step 2: Create user stats
		await seedUserStatsForUser(userId);
		
		// Step 3: Create daily compliance data
		await seedDailyComplianceForUser(userId);
		
		// Step 4: Create user adherence logs (depends on supplements existing)
		await seedUserAdherenceLogsForUser(userId);
		
		console.info(`Successfully seeded all data for user: ${userId}`);
	} catch (error) {
		console.error(`Failed to seed data for user ${userId}:`, error);
		throw error;
	}
}