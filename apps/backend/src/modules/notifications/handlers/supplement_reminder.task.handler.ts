import type { userStackReminderTaskDef } from "@backend/modules/events/events.schema";
import { logger } from "@backend/utils/logger.utils";
import { Event } from "@suprsend/node-sdk";
import type { Static } from "pg-tbus";
import { suprClient } from "../suprsend.config";

export const userStackReminderTaskHandler = async (
	{ input }: { input: Static<typeof userStackReminderTaskDef.schema> }
) => {
	const { userId, supplements, reminderTime } = input;

	try {
		// Trigger suprsend event for supplement reminder
		const eventProps = {
			supplements,
			reminderTime
		};

		const event_name = "USER REMINDER SCHEDULED"

		// Create and send the event via suprClient
		const event = new Event(userId, event_name, eventProps);
		const trigger = await suprClient.track_event(event);

		if (!trigger.success) {
			logger.error(
				{
					userId,
					error: trigger.message
				},
				"Failed to trigger user.supplement_reminder event to suprsend",
			);
		}

	} catch (error) {
		logger.error(
			{
				userId,
				error
			},
			"Error processing userStackReminder task handler",
		);
	}
};