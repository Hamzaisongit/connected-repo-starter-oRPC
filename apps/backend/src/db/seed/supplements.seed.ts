import { db } from "@backend/db/db";

export async function seedSupplements() {
	console.info("Seeding supplements...");

	// Clear existing supplements
	await db.supplements.where({}).delete();

	const supplementTemplates = [
		{
			name: "Vitamin D3",
			isActive: true,
			dosage: 50,
			unit: "mcg",
			instructions: [
				"Take one capsule in the morning with food.",
			],
			days: [
				"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
			],
			timesOfDay: ["08:15"], // unique time per supplement
			imageUrl: null
		},
		{
			name: "Fish Oil",
			isActive: true,
			dosage: 1200,
			unit: "mg",
			instructions: [
				"Take with a meal."
			],
			days: [
				"Monday","Wednesday","Friday","Sunday"
			],
			timesOfDay: ["18:35"],
			imageUrl: null
		},
		{
			name: "Multivitamin",
			isActive: true,
			dosage: 1,
			unit: "tablet",
			instructions: [
				"Take right after breakfast.",
			],
			days: [
				"Monday","Tuesday","Wednesday","Thursday","Friday"
			],
			timesOfDay: ["09:05"],
			imageUrl: null
		},
		{
			name: "Iron",
			isActive: true,
			dosage: 18,
			unit: "mg",
			instructions: [
				"Take on an empty stomach if possible.",
			],
			days: [
				"Monday","Wednesday","Friday"
			],
			timesOfDay: ["13:45"],
			imageUrl: null
		},
		{
			name: "Probiotic",
			isActive: true,
			dosage: 10,
			unit: "billion CFU",
			instructions: [
				"Take before breakfast.",
			],
			days: [
				"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
			],
			timesOfDay: ["06:50"],
			imageUrl: null
		},
		{
			name: "Magnesium Glycinate",
			isActive: false,
			dosage: 200,
			unit: "mg",
			instructions: [
				"Take at bedtime for best absorption.",
			],
			days: [
				"Tuesday","Thursday","Saturday"
			],
			timesOfDay: ["22:55"],
			imageUrl: null
		},
		{
			name: "Zinc",
			isActive: false,
			dosage: 30,
			unit: "mg",
			instructions: [
				"Take two hours after a meal.",
			],
			days: [
				"Tuesday","Thursday"
			],
			timesOfDay: ["14:10"],
			imageUrl: null
		}
	];

	// Insert mock data for 6 users, randomize assignment/use uuids for userId
	const userIds = [
		"00000000-0000-0000-0000-000000000001",
		"00000000-0000-0000-0000-000000000002",
		"00000000-0000-0000-0000-000000000003",
		"00000000-0000-0000-0000-000000000004",
		"00000000-0000-0000-0000-000000000005",
		"00000000-0000-0000-0000-000000000006"
	];

	for (const userId of userIds) {
		for (const supplement of supplementTemplates) {
			await db.supplements.create({
				userId,
				name: supplement.name,
				instructions: supplement.instructions,
				isActive: supplement.isActive,
				dosage: supplement.dosage,
				unit: supplement.unit,
				days: supplement.days,
				timesOfDay: supplement.timesOfDay,
				imageUrl: supplement.imageUrl
			});
		}
	}

	console.info("Supplements seeded successfully!");
}
