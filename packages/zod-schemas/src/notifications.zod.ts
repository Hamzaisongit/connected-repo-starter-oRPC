import z from "zod";
import { zString } from "./zod_utils.js";

// Email service types
export const sendEmailParamsZod = z.object({
	to: z.string().email(),
	templateId: z.number(),
	params: z.record(zString, z.any()),
});

export const reminderEmailParamsZod = z.object({
	email: z.string().email(),
	name: zString,
	supplements: z.array(z.object({
		name: zString,
		dosage: z.number(),
		unit: zString,
		scheduledTime: zString,
	})),
});

// Cron job response types
export const cronJobReminderResponseZod = z.object({
	usersProcessed: z.number().int().nonnegative(),
	eventsPublished: z.number().int().nonnegative(),
});

export const cronJobWebhookResponseZod = z.object({
	processed: z.number().int().nonnegative(),
});

// Brevo API response types
export const brevoEmailResponseZod = z.object({
	messageId: z.string().optional(),
});

export const brevoErrorResponseZod = z.object({
	error: z.string(),
});

export type SendEmailParams = z.infer<typeof sendEmailParamsZod>;
export type ReminderEmailParams = z.infer<typeof reminderEmailParamsZod>;
export type CronJobReminderResponse = z.infer<typeof cronJobReminderResponseZod>;
export type CronJobWebhookResponse = z.infer<typeof cronJobWebhookResponseZod>;
export type BrevoEmailResponse = z.infer<typeof brevoEmailResponseZod>;
export type BrevoErrorResponse = z.infer<typeof brevoErrorResponseZod>;
