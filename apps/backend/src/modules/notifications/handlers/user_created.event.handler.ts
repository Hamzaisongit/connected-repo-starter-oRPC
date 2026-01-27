import type { userCreatedEventDef } from "@backend/modules/events/events.schema";
import { logger } from "@backend/utils/logger.utils";
import { Event } from "@suprsend/node-sdk";
import type { Static } from "pg-tbus";
import { suprClient } from "../suprsend.config";

export const userCreatedEventHandler = async (props: { input: Static<typeof userCreatedEventDef.schema> }) => {
	const { userId, name } = props.input;

	try {	
		const eventProps = {
			name
		} 

		const event_name = "USER CREATED"

		// Trigger novu workflow for welcome email
		const event = new Event(userId, event_name, eventProps)
		const trigger = await suprClient.track_event(event)

		if (!trigger.success) {
			logger.error(
				{
					userId,
					error: trigger.message
				},
				"Failed to trigger user.created event to suprsend",
			);
		}

	} catch (error) {
		logger.error(
			{
				userId,
				error
			},
			"Error processing user.created event handler",
		);
	}
}
