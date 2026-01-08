import z from "zod";
import { zTimestamps } from "./zod_utils.js";

export const userCreatedEventZod = z.object({
	userId: z.uuid(),
	email: z.string().email(),
	name: z.string(),
	createdAt: zTimestamps.createdAt,
});

export type UserCreatedEvent = z.infer<typeof userCreatedEventZod>;

export const userStackScheduledEventZod = z.object({
	userId: z.uuid(),
	supplements: z.array(z.object({
		name: z.string(),
		dosage: z.number(),
		unit: z.string(),
		scheduledTime: z.string(),
	})),
	scheduledFor: zTimestamps.createdAt,
});

export type UserStackScheduledEvent = z.infer<typeof userStackScheduledEventZod>;
