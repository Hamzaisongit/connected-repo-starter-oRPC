import { GoogleIcon } from "@connected-repo/ui-mui/components/GoogleIcon";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { userCreateFixture } from "@connected-repo/zod-schemas/user.fixture";
import { env, isTest } from "@frontend/configs/env.config";
import { authClient } from "@frontend/utils/auth.client";
import { logSessionEvent } from "@frontend/utils/session-logger.utils";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export const LoginPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const error = searchParams.get("error");

	// Track OAuth errors in Sentry when they occur
	useEffect(() => {
		if (error) {
			const errorMessage = decodeURIComponent(error);

			// Log OAuth error for monitoring
			logSessionEvent("warn", `OAuth Error: ${errorMessage}`, {
				error_type: "oauth_error_frontend",
				error_code: error,
				error_message: errorMessage,
				location: "login_page",
			});
		}
	}, [error]);

	const handleBack = () => {
		navigate("/auth");
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		let data: { url?: string } | undefined;
		const callbackURL = `${env.VITE_USER_APP_URL}/dashboard`;

		try {
			if (isTest) {
				const dummyUser = userCreateFixture();
				const password = env.VITE_TEST_PASSWORD;
				if (!password) {
					throw new Error("Test password is not set in environment variables");
				}

				await authClient.signUp.email(
					{
						...dummyUser,
						image: dummyUser.image ?? undefined,
						password,
						callbackURL,
					},
					{
						throw: true,
					}
				);

				data = await authClient.signIn.email(
					{
						email: dummyUser.email,
						password,
						rememberMe: true,
						callbackURL,
					},
					{
						throw: true,
					}
				);
			} else {
				data = await authClient.signIn.social(
					{
						provider: "google",
						callbackURL,
						errorCallbackURL: `${env.VITE_USER_APP_URL}/auth/error`,
						newUserCallbackURL: `${env.VITE_USER_APP_URL}/dashboard`,
					},
					{
						throw: true,
					}
				);
			}
			if (data?.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("OAuth initiation failed:", error);
			setIsLoading(false);
		}
	};

	const handleAppleLogin = async () => {
		// Apple login placeholder - can be implemented similar to Google
		setIsLoading(true);
		let data: { url?: string } | undefined;
		const callbackURL = `${env.VITE_USER_APP_URL}/dashboard`;

		try {
			data = await authClient.signIn.social(
				{
					provider: "apple",
					callbackURL,
					errorCallbackURL: `${env.VITE_USER_APP_URL}/auth/error`,
					newUserCallbackURL: `${env.VITE_USER_APP_URL}/dashboard`,
				},
				{
					throw: true,
				}
			);
			if (data?.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Apple OAuth initiation failed:", error);
			setIsLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(180deg, #496FB5 0%, #345082 50%, #20304F 100%)",
				display: "flex",
				flexDirection: "column",
				px: { xs: 2, sm: 3 },
				py: 2,
			}}
		>
			<Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
				{/* Header */}
				<Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
					<IconButton onClick={handleBack} sx={{ color: "#FFFFFF" }}>
						<ArrowBackIcon />
					</IconButton>
					<Box
						sx={{
							flex: 1,
							textAlign: "center",
							fontSize: "1.125rem",
							fontWeight: 600,
							color: "#FFFFFF",
							pr: 5,
						}}
					>
						HelioCoach
					</Box>
				</Stack>

				{/* Content */}
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					{/* Title */}
					<Box sx={{ textAlign: "center", mb: 3 }}>
						<Box
							sx={{
								fontSize: { xs: "2rem", sm: "2.5rem" },
								fontWeight: 700,
								color: "#FFFFFF",
								lineHeight: 1.2,
							}}
						>
							Secure your
						</Box>
						<Box
							sx={{
								fontSize: { xs: "2rem", sm: "2.5rem" },
								fontWeight: 700,
								color: "#FBBC05",
								lineHeight: 1.2,
							}}
						>
							Progress.
						</Box>
					</Box>

					{/* Subtitle */}
					<Box
						sx={{
							fontSize: "1rem",
							color: "rgba(255, 255, 255, 0.8)",
							textAlign: "center",
							mb: 4,
						}}
					>
						Join our community of wellness seekers.
					</Box>

					{/* Yellow card with graph illustration */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto",
							backgroundColor: "#FBBC05",
							borderRadius: 1,
							mb: 2,
							p: 3,
							width: "80%"
						}}
					>
						<Box
							component="img"
							src="/line-chart-graph.png"
							alt="Scan supplement label"
							sx={{
								maxWidth: "120px",
								height: "auto",
							}}
						/>
					</Box>

					{/* Error Alert */}
					{error && (
						<Fade in>
							<Alert
								severity="error"
								sx={{
									width: "100%",
									maxWidth: 360,
									borderRadius: 2,
									mb: 3,
								}}
							>
								{error === "oauth_failed"
									? "Authentication failed. Please try again."
									: error === "state_mismatch"
										? "Session expired. Please try signing in again."
										: error === "callback_error"
											? "OAuth callback error. Please try again."
											: `An error occurred: ${decodeURIComponent(error)}`}
							</Alert>
						</Fade>
					)}

				</Box>

				{/* Footer */}
				<Box sx={{ mt: "auto", height: 140, pb: 4 }}>
					{/* Continue with Google */}
					<Button
						variant="contained"
						fullWidth
						onClick={handleGoogleLogin}
						disabled={isLoading}
						sx={{
							backgroundColor: "#FFFFFF",
							color: "#1F2937",
							py: 1.75,
							borderRadius: 3,
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.9)",
							},
							"&.Mui-disabled": {
								backgroundColor: "rgba(255, 255, 255, 0.5)",
								color: "rgba(31, 41, 55, 0.5)",
							},
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 1.5,
							}}
						>
							<GoogleIcon width={20} height={20} />
							<span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
						</Box>
					</Button>

					{/* Terms text */}
					<Box
						sx={{
							mt: 3,
							textAlign: "center",
							fontSize: "0.75rem",
							color: "rgba(255, 255, 255, 0.6)",
						}}
					>
						By continuing, you agree to our{" "}
						<Box
							component="a"
							href="https://heliocoach.com/terms-of-service/"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								color: "rgba(255, 255, 255, 0.8)",
								textDecoration: "underline",
								"&:hover": {
									color: "#FFFFFF",
								},
							}}
						>
							Terms of Service
						</Box>
						{" "}and{" "}
						<Box
							component="a"
							href="https://heliocoach.com/privacy-policy/"
							target="_blank"
							rel="noopener noreferrer"
							sx={{
								color: "rgba(255, 255, 255, 0.8)",
								textDecoration: "underline",
								"&:hover": {
									color: "#FFFFFF",
								},
							}}
						>
							Privacy Policy
						</Box>
					</Box>
				</Box>
			</Container>
		</Box>
	);
};
