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
      days: [...DAYS_OF_WEEK_ENUM] as DaysOfWeek[],
      timesOfDay: ["08:00"],
       imageUrl: null,
    },
    {
      userId,
      name: "Omega-3 Fish Oil",
      instructions: ["Take with meals", "May cause fishy burps"],
      isActive: true,
      dosage: 1000,
      unit: "mg",
      days: [...DAYS_OF_WEEK_ENUM] as DaysOfWeek[],
      timesOfDay: ["12:00", "18:00"],
       imageUrl: null,
    },
    {
      userId,
      name: "Magnesium Glycinate",
      instructions: ["Take before bed", "Helps with sleep"],
      isActive: false,
      dosage: 400,
      unit: "mg",
      days: ["Sunday"] as DaysOfWeek[],
      timesOfDay: ["21:00"],
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