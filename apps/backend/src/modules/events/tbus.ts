import { env } from "@backend/configs/env.config";
import createTBus, { type Bus } from 'pg-tbus';

const SERVICE_NAME = "heliocoach-backend";

export const tbus = createTBus(SERVICE_NAME, {
	db: {
		host: env.DB_HOST,
		port: Number(env.DB_PORT),
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
	},
	schema: "public"
});

export type TBus = Bus;