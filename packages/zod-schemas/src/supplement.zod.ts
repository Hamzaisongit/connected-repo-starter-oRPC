import z from "zod";
import { daysOfWeekZod } from "./enums.zod.js";

export const supplementZod = z.object({
	id: z.string(),
	userId: z.string(),
	name: z.string(),
	instructions: z.array(z.string()),
	isActive: z.boolean(),
	dosage: z.number(),
	unit: z.string(),
	days: z.array(daysOfWeekZod),
	timesOfDay: z.array(z.number()),
	imageUrl: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export type Supplement = z.infer<typeof supplementZod>;

export const createSupplementZod = supplementZod.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateSupplement = z.infer<typeof createSupplementZod>;

export const updateSupplementZod = createSupplementZod.partial();

export type UpdateSupplement = z.infer<typeof updateSupplementZod>;