import { db } from "../db";

export async function seedUsers() {

	// Delete all users (will cascade via foreign keys if set)
	await db.users.where({}).delete();

	const users = [
		{
			id: "00000000-0000-0000-0000-000000000001",
			email: "user1@example.com",
			emailVerified: false,
			name: "User 1",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: "00000000-0000-0000-0000-000000000002",
			email: "user2@example.com",
			emailVerified: false,
			name: "User 2",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: "00000000-0000-0000-0000-000000000003",
			email: "user3@example.com",
			emailVerified: false,
			name: "User 3",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: "00000000-0000-0000-0000-000000000004",
			email: "user4@example.com",
			emailVerified: false,
			name: "User 4",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: "00000000-0000-0000-0000-000000000005",
			email: "user5@example.com",
			emailVerified: false,
			name: "User 5",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: "00000000-0000-0000-0000-000000000006",
			email: "user6@example.com",
			emailVerified: false,
			name: "User 6",
			image: null,
			timeZone: null,
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];

	for (const user of users) {
			await db.users.create({
				id: user.id,
				email: user.email,
				emailVerified: user.emailVerified,
				name: user.name,
				image: user.image,
				timeZone: user.timeZone,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			});
	}

	console.info("Users seeded successfully!");
}

