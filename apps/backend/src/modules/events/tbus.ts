import { env } from "@backend/configs/env.config";
import createTBus, { type Bus } from 'pg-tbus';

const SERVICE_NAME = "heliocoach-backend";

export const tbus = createTBus(SERVICE_NAME, {
	db: {
		host: env.DB_HOST ?? "localhost",
		port: Number(env.DB_PORT ?? 5432),
		user: env.DB_USER ?? "postgres",
		password: env.DB_PASSWORD ?? "postgres",
		database: env.DB_NAME ?? "heliocoach_db",
	},
	schema: "public"
});

export type TBus = Bus;