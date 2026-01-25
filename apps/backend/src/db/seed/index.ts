import { db } from "@backend/db/db";
import { seedUserStacks } from "@backend/db/seed/user_stacks.seed";
import * as readline from "readline";

export const seed = async () => {
	console.info("Seeding database...");

	// Ask for user email
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	const email = await new Promise<string>((resolve) => {
		rl.question("Enter user email to seed data for: ", (answer) => {
			resolve(answer);
			rl.close();
		});
	});

	// Find user by email
	let user = await db.users.findBy({ email });
	if (!user) {
		console.error(`User with email ${email} not found. Please create the user first.`);
		return;
	}

	console.info(`Seeding data for user: ${user.email} (ID: ${user.id})`);

	// Seed user_stacks
	await seedUserStacks(user.id);

	console.info("Seeding completed successfully!");
};

