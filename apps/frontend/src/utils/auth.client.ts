 import { env } from "@frontend/configs/env.config";
import { getBrowserTimezone } from "@frontend/utils/timezone.utils";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

 export const authClient = createAuthClient({
   baseURL: env.VITE_API_URL,
   plugins: [inferAdditionalFields({
   user: {
      timezone: {
        defaultValue: getBrowserTimezone() || "Etc/UTC",
        required: true,
        type: "string",
      },
      themeSetting: {
        type: "string",
        required: true,
        defaultValue: "system",
      },
   }}),]
 });