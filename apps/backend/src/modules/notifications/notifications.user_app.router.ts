import { env } from "@backend/configs/env.config";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import {createSigner} from "fast-jwt"
import z from "zod";

/**
 * Generate a signed user token (JWT, ES256) for an entity
 * @input { entityType: "subscriber", entityId: string, exp: number, signingKey: string, signingKeyIsBase64?: boolean }
 * @returns { token: string }
 */
const signSuprSendUserToken = rpcProtectedProcedure
	.output(z.object({ token: z.string() }))
	.handler(async ({ context: {user} },) => {

		const secret_1 = Buffer.from(env.SUPRSEND_SIGNING_BASE_64, "base64").toString("utf-8");

		const signer = createSigner({key:secret_1, algorithm: "ES256"})

		const payload = {
			entity_type: "subscriber",
			entity_id: user.id,
			exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now, as unix timestamp
		};

		const token = signer(payload);

		return { token };
	});

export const notificationsRouter = {
    signSuprSendUserToken
};

