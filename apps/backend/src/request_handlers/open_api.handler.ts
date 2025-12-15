import { env } from "@backend/configs/env.config";
import { openApiRouter } from "@backend/routers/open_api/open_api.router";
import { logger } from "@backend/utils/logger.utils";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

export const allowedOrigins = [...(env.ALLOWED_ORIGINS?.split(",") || [])];

export const openApiHandler = new OpenAPIHandler(openApiRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			docsProvider: "scalar",
			docsPath: "/",
			specPath: "/spec.json",
			schemaConverters: [new ZodToJsonSchemaConverter()],
			specGenerateOptions: {
				info: {
					title: "API Documentation",
					version: "1.0.0",
					description: "OpenAPI documentation for the application",
				},
				servers: [{ url: "/api" }],
			},
		}),
	],
	interceptors: [
		// Server-side error logging
		onError((error) => {
			logger.error(error, "OpenAPI error");
		}),
	],
});
