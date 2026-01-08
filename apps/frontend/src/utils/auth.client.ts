 import { env } from "@frontend/configs/env.config";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

 export const authClient = createAuthClient({
   baseURL: env.VITE_API_URL,
   plugins: [inferAdditionalFields({
   user: {
      timezone: {
        type: "string",
        required: false,
      },
      themeSetting: {
        type: "string",
        required: true,
        defaultValue: "system",
      },
   }}),]
 });