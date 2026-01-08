import { db } from "@backend/db/db";
import { logger } from "@backend/utils/logger.utils";
import { createEventHandler, defineEvent, Type } from "pg-tbus";
import { sendReminderEmail, sendWelcomeEmail } from "../services/brevo.service";

const userCreatedEventDef = defineEvent({
	event_name: "user.created",
	schema: Type.Object({
		userId: Type.String({ format: "uuid" }),
		email: Type.String(),
		name: Type.String(),
		createdAt: Type.Number(),
	}),
});

const userStackScheduledEventDef = defineEvent({
	event_name: "userstack.scheduled",
	schema: Type.Object({
		userId: Type.String({ format: "uuid" }),
		supplementName: Type.String(),
		scheduledTime: Type.String(),
		scheduledFor: Type.Number(),
	}),
});

export const userCreatedHandler = createEventHandler({
	task_name: "send_welcome_email",
	eventDef: userCreatedEventDef,
	handler: async (props) => {
		const { userId, email, name } = props.input;

		logger.info(
			{
				userId,
				email,
				eventName: "user.created",
			},
			"Processing user.created event to send welcome email...",
		);

		try {
			const user = await db.users.findBy({ id: userId });

			if (!user) {
				logger.error(
					{
						userId,
						email,
					},
					"User not found in database, cannot send welcome email",
				);
				return;
			}

			const notificationPreferences = typeof user.notificationPreferences === "string"
				? JSON.parse(user.notificationPreferences)
				: user.notificationPreferences;

			if (!notificationPreferences?.emailNotification) {
				logger.info(
					{
						userId,
						email,
						emailNotificationEnabled: false,
					},
					"User has disabled email notifications, skipping welcome email",
				);
				return;
			}

			logger.info(
				{
					userId,
					email,
					emailNotificationEnabled: true,
				},
				"User has enabled email notifications, sending welcome email...",
			);

			const result = await sendWelcomeEmail(email, name);

			if (result.success) {
				logger.info(
					{
						userId,
						email,
						messageId: result.messageId,
					},
					"Welcome email sent successfully via event handler",
				);
			} else {
				logger.error(
					{
						userId,
						email,
						error: result.error,
					},
					"Failed to send welcome email via event handler",
				);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				{
					userId,
					email,
					error: errorMessage,
				},
				"Error processing user.created event handler",
			);
		}
	},
});

export const userStackScheduledHandler = createEventHandler({
	task_name: "send_reminder_email",
	eventDef: userStackScheduledEventDef,
	handler: async (props) => {
		const { userId, supplementName, scheduledTime } = props.input;

		logger.info(
			{
				userId,
				supplementName,
				eventName: "userstack.scheduled",
			},
			"Processing userstack.scheduled event to send reminder email...",
		);

		try {
			const user = await db.users.findBy({ id: userId });

			if (!user) {
				logger.error(
					{
						userId,
					},
					"User not found in database, cannot send reminder email",
				);
				return;
			}

			const notificationPreferences = typeof user.notificationPreferences === "string"
				? JSON.parse(user.notificationPreferences)
				: user.notificationPreferences;

			if (!notificationPreferences?.emailNotification) {
				logger.info(
					{
						userId,
						emailNotificationEnabled: false,
					},
					"User has disabled email notifications, skipping reminder email",
				);
				return;
			}

			logger.info(
				{
					userId,
					emailNotificationEnabled: true,
				},
				"User has enabled email notifications, sending reminder email...",
			);

			const result = await sendReminderEmail({
				email: user.email,
				name: user.name,
				supplementName,
				scheduledTime,
			});

			if (result.success) {
				logger.info(
					{
						userId,
						email: user.email,
						messageId: result.messageId,
					},
					"Reminder email sent successfully via event handler",
				);
			} else {
				logger.error(
					{
						userId,
						email: user.email,
						error: result.error,
					},
					"Failed to send reminder email via event handler",
				);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			logger.error(
				{
					userId,
					error: errorMessage,
				},
				"Error processing userstack.scheduled event handler",
			);
		}
	},
});
