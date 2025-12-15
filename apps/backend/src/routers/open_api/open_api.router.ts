import { publicProcedure } from "@backend/procedures/public.procedure";
import * as z from "zod";

// Health check endpoint for OpenAPI
export const healthCheck = publicProcedure
	.route({ method: "GET", path: "/health" })
	.output(
		z.object({
			status: z.string(),
			timestamp: z.string(),
		})
	)
	.handler(async () => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	});

export const openApiRouter = {
	health: healthCheck,
};
