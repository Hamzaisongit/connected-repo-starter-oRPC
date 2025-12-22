

import { auth } from "@backend/modules/auth/auth.config";
import { userCreateFixture } from "@connected-repo/zod-schemas/user.fixture";
import type { UserCreateInput } from "@connected-repo/zod-schemas/user.zod";

interface UserLoginCredentials {
  email: string;
  password: string;
}

const userLogin = async (loginCredentials: UserLoginCredentials ) => {
  const response = await auth.api.signInEmail({
    body: loginCredentials,
    asResponse: true, // This gives us the raw response with Set-Cookie headers
  });

  const reqHeaders = new Headers({
    Cookie: response.headers.getSetCookie().join("; ")
  })

  const sessionData = await auth.api.getSession({
    headers: reqHeaders
  });

  if(!sessionData) {
    throw new Error("Login Failed");
  };

  return {
    reqHeaders,
    session: {
      ...sessionData.session,
		userAgent: sessionData.session.userAgent ?? null,
		ipAddress: sessionData.session.ipAddress ?? null,
		browser: sessionData.session.browser ?? null,
		deviceFingerprint: sessionData.session.deviceFingerprint ?? null,
		os: sessionData.session.os ?? null,
		device: sessionData.session.device ?? null,
		createdAt: new Date(sessionData.session.createdAt).getTime(),
		updatedAt: new Date(sessionData.session.expiresAt).getTime(),
		markedInvalidAt: sessionData.session.markedInvalidAt ? new Date(sessionData.session.markedInvalidAt).getTime() : null,
		expiresAt: new Date(sessionData.session.expiresAt).getTime(),
    },
    user: {
      ...sessionData.user,
      image: sessionData.user.image ?? null,
      createdAt: new Date(sessionData.user.createdAt).getTime(),
      updatedAt: new Date(sessionData.user.updatedAt).getTime(),
    }
  }
}
export const createUserAndLogin = async (userInput: Partial<UserCreateInput> = {}) => {
  const password = "password123"
  const fixture = userCreateFixture(userInput);
  const { user } = await auth.api.signUpEmail({
    body: {
      ...fixture,
      password,
      image: fixture.image ?? undefined
    },
  });

  // 2. Sign in to get the session headers
  return userLogin({
    email: user.email,
    password
  });
}