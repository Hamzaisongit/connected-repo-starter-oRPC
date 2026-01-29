import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { useNavigate } from "react-router";
import { HelioCoachLogo } from "../components/HelioCoachLogo";

export const LandingPage = () => {
	const navigate = useNavigate();

	const handleStartJourney = () => {
		navigate("/auth/onboarding?step=1");
	};

	const handleSignIn = () => {
		navigate("/auth/login");
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(180deg, #496FB5 0%, #345082 50%, #20304F 100%)",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column", py: 4 }}>
				{/* Header - Logo at top */}
				<Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
					<HelioCoachLogo variant="light" size="md" />
				</Box>

				{/* Content - centered vertically */}
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{/* Large Title */}
					<Box
						sx={{
							fontSize: { xs: "2.5rem", sm: "3rem" },
							fontWeight: 300,
							color: "#FFFFFF",
							textAlign: "center",
							mb: 2,
							fontStyle: "italic",
						}}
					>
						HelioCoach
					</Box>

					{/* Subtitle */}
					<Box
						sx={{
							fontSize: { xs: "1rem", sm: "1.125rem" },
							color: "rgba(255, 255, 255, 0.8)",
							textAlign: "center",
							maxWidth: 320,
							lineHeight: 1.6,
						}}
					>
						Premium supplement tracking and personalized vitality coaching for the modern
						professionals
					</Box>
				</Box>

				{/* Footer - pinned to bottom */}
				<Box sx={{ mt: "auto", height: 140, pb: 4 }}>
					<Button
						variant="contained"
						fullWidth
						onClick={handleStartJourney}
						sx={{
							backgroundColor: "#496FB5",
							color: "#FFFFFF",
							py: 1.75,
							borderRadius: 3,
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							"&:hover": {
								backgroundColor: "#3d5fa0",
							},
							transition: "all 0.2s ease-in-out",
						}}
					>
						Start your journey
					</Button>

					<Box
						sx={{
							textAlign: "center",
							mt: 3,
						}}
					>
						<Box
							component="span"
							sx={{
								fontSize: "0.9rem",
								color: "rgba(255, 255, 255, 0.7)",
							}}
						>
							Already have account?{" "}
						</Box>
						<Box
							component="span"
							onClick={handleSignIn}
							sx={{
								fontSize: "0.9rem",
								color: "#FBBC05",
								fontWeight: 600,
								cursor: "pointer",
								"&:hover": {
									textDecoration: "underline",
								},
							}}
						>
							Sign in here
						</Box>
					</Box>
				</Box>
			</Container>
		</Box>
	);
};
