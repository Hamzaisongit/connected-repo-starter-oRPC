import z from "zod";
import { userAdherenceStatusZod } from "./enums.zod";

export const userAdherenceLogZod = z.object({
	id: z.string(),
	userId: z.string(),
	supplementId: z.string(),
	reason: z.string().nullable(),
	status: userAdherenceStatusZod,
	scheduledFor: z.number(),
	actualAt: z.number(),
	timeZoneOffset: z.number(),
	createdAt: z.number(),
	updatedAt: z.number(),
});

export type UserAdherenceLog = z.infer<typeof userAdherenceLogZod>;

export const createUserAdherenceLogZod = userAdherenceLogZod.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateUserAdherenceLog = z.infer<typeof createUserAdherenceLogZod>;

export const supplementScheduleZod = z.object({
	supplement: z.object({
		id: z.string(),
		name: z.string(),
		dosage: z.number(),
		unit: z.string(),
		instructions: z.array(z.string()),
		imageUrl: z.string().nullable(),
	}),
	scheduledTime: z.number(),
	adherenceLog: userAdherenceLogZod.nullable(),
	status: z.enum(["pending", "taken", "missed", "skipped"]),
	isOverdue: z.boolean(),
});

export type SupplementSchedule = z.infer<typeof supplementScheduleZod>;

export const dailyProgressZod = z.object({
	date: z.string(),
	totalScheduled: z.number(),
	takenOnTime: z.number(),
	takenLate: z.number(),
	missed: z.number(),
	skipped: z.number(),
	completionPercentage: z.number(),
});

export type DailyProgress = z.infer<typeof dailyProgressZod>;