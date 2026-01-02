import { db } from "@backend/db/db";
import { DAYS_OF_WEEK_ENUM } from "@connected-repo/zod-schemas/enums.zod";

const supplementTemplates = [
	{
		name: "Vitamin D3",
		isActive: true,
		dosage: 50,
		unit: "mcg",
		instructions: [
			"Take one capsule in the morning with food.",
		],
		days: [...DAYS_OF_WEEK_ENUM] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: ["Monday", "Wednesday", "Friday", "Sunday"] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: ["Monday", "Wednesday", "Friday"] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: [...DAYS_OF_WEEK_ENUM] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: ["Tuesday", "Thursday", "Saturday"] as (typeof DAYS_OF_WEEK_ENUM)[number][],
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
		days: ["Tuesday", "Thursday"] as (typeof DAYS_OF_WEEK_ENUM)[number][],
		timesOfDay: ["14:10"],
		imageUrl: null
	}
];

export async function seedSupplementsForUser(userId: string) {
	console.info(`Seeding supplements for user: ${userId}`);

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

	console.info(`Supplements seeded successfully for user: ${userId}!`);
}


