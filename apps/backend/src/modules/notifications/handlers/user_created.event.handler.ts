import type { userCreatedEventDef } from "@backend/modules/events/events.schema";
import { logger } from "@backend/utils/logger.utils";
import { Event } from "@suprsend/node-sdk";
import type { Static } from "pg-tbus";
import { suprClient } from "../suprsend.config";

export const userCreatedEventHandler = async (props: { input: Static<typeof userCreatedEventDef.schema> }) => {
	const { userId, name, email } = props.input;

	try {	
		// create a suprsend user instance for each user
		const suprUser = suprClient.user.get_instance(userId)
		suprUser.add_email(email)
		suprUser.set("name", name)
		await suprUser.save()


		const eventProps = {
			name
		} 

		const event_name = "USER CREATED"

		// Trigger user created event
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
