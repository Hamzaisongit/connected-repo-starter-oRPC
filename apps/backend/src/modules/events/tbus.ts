import { env } from "@backend/configs/env.config";
import { userCreatedHandler, userStackScheduledHandler } from "@backend/modules/notifications/handlers/email.handlers";
import { logger } from "@backend/utils/logger.utils";
import createTBus, { type Bus } from "pg-tbus";

const SERVICE_NAME = "heliocoach-backend";
const SCHEMA = "public";

export const tbus = createTBus(SERVICE_NAME, {
	db: {
		host: env.DB_HOST ?? "localhost",
		port: Number(env.DB_PORT ?? 5432),
		user: env.DB_USER ?? "postgres",
		password: env.DB_PASSWORD ?? "postgres",
		database: env.DB_NAME ?? "heliocoach_db",
	},
	schema: SCHEMA,
	worker: {
		concurrency: 25,
		intervalInMs: 1500,
		refillPct: 0.33,
	},
});

export const startTBus = async () => {
	logger.info(
		{
			serviceName: SERVICE_NAME,
			schema: SCHEMA,
		},
		"Starting pg-tbus event bus...",
	);

	try {
		tbus.registerHandler(userCreatedHandler);
		tbus.registerHandler(userStackScheduledHandler);

		logger.info(
			{
				handlers: ["send_welcome_email", "send_reminder_email"],
			},
			"Registered email event handlers with pg-tbus",
		);

		await tbus.start();

		logger.info("pg-tbus event bus started successfully");

		const state = tbus.getState();

		logger.info(
			{
				queue: state.queue,
				eventHandlers: state.events.length,
				taskHandlers: state.tasks.length,
			},
			"pg-tbus state",
		);
	} catch (error) {
		logger.error(error, "Failed to start pg-tbus event bus");
		throw error;
	}
};

export const stopTBus = async () => {
	logger.info("Stopping pg-tbus event bus...");

	try {
		await tbus.stop();

		logger.info("pg-tbus event bus stopped successfully");
	} catch (error) {
		logger.error(error, "Failed to stop pg-tbus event bus");
		throw error;
	}
};

export type TBus = Bus;
