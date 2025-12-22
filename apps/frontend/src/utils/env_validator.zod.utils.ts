import { NODE_ENV_ZOD } from "@connected-repo/zod-schemas/node_env";
import { object, string, url } from "zod";

export const envSchemaZod = object({
	VITE_USER_NODE_ENV: NODE_ENV_ZOD,
	VITE_API_URL: url("API URL must be a valid URL"),
	VITE_USER_APP_URL: url("User App Url is required"),
	VITE_TEST_PASSWORD: string().min(8, "Test password must be at least 8 characters").optional()
});
