import { db } from "@backend/db/db";
import { DAYS_OF_WEEK_ENUM, type DaysOfWeek } from "@connected-repo/zod-schemas/enums.zod";

export async function seedUserStacks(userId: string) {
  console.info("Seeding user stacks...");

  await db.userStacks.where({ userId }).delete();

  const stacks = [
    {
      userId,
      name: "Vitamin D3",
      instructions: ["Take with food", "Avoid taking at night"],
      isActive: true,
      dosage: 5000,
      unit: "IU",
      reminderDays: [...DAYS_OF_WEEK_ENUM] as DaysOfWeek[],
      reminderTime: "08:00:00",
      imageUrl: null,
    },
    {
      userId,
      name: "Omega-3 Fish Oil",
      instructions: ["Take with meals", "May cause fishy burps"],
      isActive: true,
      dosage: 1000,
      unit: "mg",
      reminderDays: [...DAYS_OF_WEEK_ENUM] as DaysOfWeek[],
      reminderTime: "12:00:00",
      imageUrl: null,
    },
    {
      userId,
      name: "Omega-3 Fish Oil",
      instructions: ["Take with meals", "May cause fishy burps"],
      isActive: true,
      dosage: 1000,
      unit: "mg",
      reminderDays: [...DAYS_OF_WEEK_ENUM] as DaysOfWeek[],
      reminderTime: "18:30:00",
      imageUrl: null,
    },
    {
      userId,
      name: "Magnesium Glycinate",
      instructions: ["Take before bed", "Helps with sleep"],
      isActive: false,
      dosage: 400,
      unit: "mg",
      reminderDays: ["Sunday"] as DaysOfWeek[],
      reminderTime: "21:15:00",
      imageUrl: null,
    },
  ];

  const createdStacks = [];
  for (const stack of stacks) {
    createdStacks.push(await db.userStacks.create(stack));
  }

  console.info(`✓ Seeded ${createdStacks.length} user stacks`);

  return createdStacks;
}