import { db } from "@backend/db/db";
import { rpcProtectedProcedure } from "@backend/procedures/protected.procedure";
import { userSelectAllZod, userUpdateInputZod } from "@connected-repo/zod-schemas/user.zod";

// Get user by ID - requires authentication
const getProfile = rpcProtectedProcedure
	.output(userSelectAllZod)
	.handler(async ({ context: { user } }) => {
		const dbUser = await db.users.find(user.id).selectAll();
		return dbUser;
	});

// Update user profile - requires authentication
const updateProfile = rpcProtectedProcedure
	.input(userUpdateInputZod)
	.output(userSelectAllZod)
	.handler(async ({ input, context: { user } }) => {
		// Update user in database
		const updatedUser = await db.users.find(user.id).selectAll().updateOrThrow(input);
		return updatedUser;
	});

export const ProfileRouter = {
	getProfile,
	updateProfile,
};
