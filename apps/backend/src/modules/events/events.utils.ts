import { userStackReminderTaskHandler } from "@backend/modules/notifications/handlers/supplement_reminder.task.handler";
import { userCreatedEventHandler } from "@backend/modules/notifications/handlers/user_created.event.handler";
import { logger } from "@backend/utils/logger.utils";
import type { Query } from "orchid-orm";
import { createEventHandler, createTaskHandler } from "pg-tbus";
import { userCreatedEventDef, userStackReminderTaskDef } from "./events.schema";
import { tbus } from "./tbus";


/**
 * Adapter for running pg-tbus queries within an Orchid ORM transaction context
 */
export const orchidToTbusQueryAdapter = (queryCtx: Query) => {
	return async <T = any>(
		props: { text: string; values: any[]; name?: string }
	): Promise<{ rows: T[]; rowCount: number }> => {
		const result = await queryCtx.q.adapter.query(props.text, props.values);
		return { rows: result.rows as T[], rowCount: result.rowCount };
	};
};

/**
 * Start the event-bus
 */
export const startEventBus = async () => {
	logger.info("Starting pg-tbus event bus...");

	try {
		//All subscription and task-registrations go here.. 
		tbus.registerHandler(
			createEventHandler({
				task_name: "user.created",
				eventDef: userCreatedEventDef,
				handler: userCreatedEventHandler,
			})
		);
		tbus.registerTask(
			createTaskHandler({
				taskDef: userStackReminderTaskDef,
				handler: userStackReminderTaskHandler,
			})
		);

		await tbus.start();

	} catch (error) {
		logger.error(error, "Failed to start pg-tbus event bus");
	}
};