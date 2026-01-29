import { LoginPage } from "@frontend/modules/auth/pages/Login.page";
import { LandingPage } from "@frontend/modules/auth/pages/Landing.page";
import { OnboardingPage } from "@frontend/modules/auth/pages/Onboarding.page";
import { Route, Routes, useSearchParams, Navigate } from "react-router";

const AuthErrorRedirect = () => {
	const [searchParams] = useSearchParams();
	const error = searchParams.get("error");

	// Redirect to login page with error parameter
	return <Navigate to={`/auth/login?error=${error || "unknown_error"}`} replace />;
};

const AuthRouter = () => {
	return (
		<Routes>
			<Route path="/">
				<Route index element={<LandingPage />} />
				<Route path="onboarding" element={<OnboardingPage />} />
				<Route path="login" element={<LoginPage />} />
				<Route path="error" element={<AuthErrorRedirect />} />
			</Route>
		</Routes>
	);
};

export default AuthRouter;
