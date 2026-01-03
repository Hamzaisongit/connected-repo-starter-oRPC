import { db } from "@backend/db/db";

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
      days: "Monday" as const,
      timesOfDay: ["morning"],
      imageUrl: "https://example.com/vitamin-d.jpg",
    },
    {
      userId,
      name: "Omega-3 Fish Oil",
      instructions: ["Take with meals", "May cause fishy burps"],
      isActive: true,
      dosage: 1000,
      unit: "mg",
      days: "Tuesday" as const,
      timesOfDay: ["evening"],
      imageUrl: "https://example.com/omega3.jpg",
    },
    {
      userId,
      name: "Magnesium Glycinate",
      instructions: ["Take before bed", "Helps with sleep"],
      isActive: false,
      dosage: 400,
      unit: "mg",
      days: "Sunday" as const,
      timesOfDay: ["night"],
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