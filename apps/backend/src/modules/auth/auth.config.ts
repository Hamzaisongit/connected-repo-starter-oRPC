import { allowedOrigins } from "@backend/configs/allowed_origins.config";
import { env, isDev, isProd, isTest } from "@backend/configs/env.config";
import { db } from "@backend/db/db";
import { logger } from "@backend/utils/logger.utils";
import { recordErrorOtel } from "@backend/utils/record-message.otel.utils";
import { themeSettingZod } from "@connected-repo/zod-schemas/enums.zod";
import { betterAuth } from "better-auth";
import { CoercedCanonicalTimezoneSchema } from "zod-timezone-validation";
import { orchidAdapter } from "./orchid-adapter/factory.orchid_adapter";
import { tbus } from "@backend/modules/events/tbus";
import { userCreatedEventZod } from "@connected-repo/zod-schemas/event.zod";

// TODO: Instrument Better Auth with OpenTelemetry for automatic tracing
// This will automatically create spans for all auth operations including:
// - OAuth flows (initiate, callback) with user IDs
// - Email signin/signup with user IDs
// - Session management (get, list, revoke)
// - Account management (link, unlink, update, delete)
// - Password management (change, set, reset)
// - Email verification

export const auth = betterAuth({
	account: {
		modelName: "accounts",
	},
	advanced: {
		cookies: {
			state: {
				attributes: {
					sameSite: isProd ? "none" : "lax",
					secure: !isDev,
				}
			}
		},
		database: {
			// Setting generateId to false allows your database handle all ID generation
			generateId: false,
		},
	},
	baseURL: env.VITE_API_URL,
	basePath: "/api/auth",
	database: orchidAdapter(db),
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					try {
						logger.info(
							{
								userId: user.id,
								email: user.email,
								name: user.name,
							},
							"User created via better-auth, publishing user.created event...",
						);

						const eventData = userCreatedEventZod.parse({
							userId: user.id,
							email: user.email,
							name: user.name,
							createdAt: new Date(user.createdAt).getTime(),
						});

						await tbus.publish({
							event_name: "user.created",
							data: eventData,
						});

						logger.info(
							{
								userId: user.id,
								eventName: "user.created",
							},
							"Successfully published user.created event to pg-tbus",
						);
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : String(error);
						logger.error(
							{
								userId: user.id,
								error: errorMessage,
							},
							"Failed to publish user.created event to pg-tbus",
						);

						recordErrorOtel({
							spanName: "auth.user.created.event.publish",
							error: error instanceof Error ? error : new Error(errorMessage),
							level: "error",
							tags: {
								error_type: "event_publish_failed",
							},
							attributes: {
								"user.id": user.id,
								"event.name": "user.created",
							},
						});
					}
				},
			},
		},
	},
	// Increase timeout for OAuth token exchange
	defaultCookieAttributes: {
		httpOnly: true,
		secure: isProd,
		path: "/",
	},
	emailAndPassword: {
		enabled: isTest,
	},
	logger: {
		disabled: false,
		disableColors: !isDev,
		// Level is handled in logger utility.
		level: "debug",
		log: (level, message, ...args) => {
			// Map Better Auth log levels to Pino log levels
			switch (level) {
				case "debug":
					logger.debug({ module: "better-auth", ...args }, message);
					break;
				case "info":
					logger.info({ module: "better-auth", ...args }, message);
					break;
				case "warn":
					logger.warn({ module: "better-auth", ...args }, message);
					break;
				case "error":
					logger.error({ module: "better-auth", ...args }, message);
					break;
				default:
					logger.info({ module: "better-auth", ...args }, message);
			}
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24, // 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
		modelName: "sessions",
		additionalFields: {
			browser: {
				type: "string",
				required: false,
				input: false,
			},
			os: {
				type: "string",
				required: false,
				input: false,
			},
			device: {
				type: "string",
				required: false,
				input: false,
			},
			deviceFingerprint: {
				type: "string",
				required: false,
				input: false,
			},
			markedInvalidAt: {
				type: "date",
				required: false,
				defaultValue: null,
				input: false, // Don't allow user input for soft delete timestamp
			},
		},
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			redirectURI: `${env.VITE_API_URL}/api/auth/callback/google`,
		},
	},
	trustedOrigins: allowedOrigins,
	user: {
		changeEmail: {
			enabled: false, // Disable email changes for simplicity
		},
		additionalFields: {
			timezone: {
				type: "string",
				required: false,
				input: true,
				validator: {
					input: CoercedCanonicalTimezoneSchema.nullish(),
					output: CoercedCanonicalTimezoneSchema.nullish()
				}
			},
			themeSetting: {
				type: "string",
				required: true,
				defaultValue: "system",
				input: true,
				validator: {
					input: themeSettingZod,
					output: themeSettingZod
				}
			}
		},
		modelName: "users",
	},
	verification: {
		modelName: "verifications",
	},
	experimental: {
		joins: true,
	},
	plugins: [
		// Custom plugin to capture OAuth state_mismatch and other errors before redirect
		{
			id: "oauth-error-telemetry",
			onResponse: async (response) => {
				try {
					// Check if this is an OAuth error redirect
					if (response.status === 302 && response.headers) {
						const location = response.headers.get?.("location") || response.headers.get?.("Location");
						if (location?.includes("error=")) {
							const url = new URL(location, env.WEBAPP_URL);
							const error = url.searchParams.get("error");
							const errorDescription = url.searchParams.get("error_description");

							if (error) {
								const errorMessage = errorDescription
									? `OAuth error: ${error} - ${decodeURIComponent(errorDescription)}`
									: `OAuth error: ${error}`;

								// Log with all available context
								logger.error({
									module: "oauth-error",
									error,
									errorDescription,
									redirectUrl: location,
									responseUrl: response.url || "",
								}, errorMessage);

								// Record the error in OpenTelemetry/Sentry
								recordErrorOtel({
									spanName: "oauth.error.callback",
									error: new Error(errorMessage),
									level: "error",
									tags: {
										error_type: "oauth_callback_error",
									},
									attributes: {
										"error.code": error,
										"error.description": errorDescription || "",
										"oauth.redirect_url": location,
										"response.url": response.url || "",
									},
								});
							}
						}
					}
				} catch (err) {
					// Don't let telemetry errors break the auth flow
					console.error("[oauth-error-telemetry] Error capturing OAuth error:", err);
				}
			},
		},
	],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
