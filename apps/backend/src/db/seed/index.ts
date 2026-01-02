import { seedUsers } from "./users.seed";

export const seed = async () => {
	console.info("Seeding database...");

	// Only seed users now - other data will be created automatically 
	// when users are created via the database hook
	await seedUsers()

	console.info("User seeding completed! Other data will be seeded automatically via user creation hooks.");
};

