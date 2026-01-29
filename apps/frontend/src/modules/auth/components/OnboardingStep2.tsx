import { Button } from "@connected-repo/ui-mui/form/Button";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { ProgressDots } from "./ProgressDots";
import { StreakCard } from "./StreakCard";

interface OnboardingStep2Props {
	onBack: () => void;
	onContinue: () => void;
}

export const OnboardingStep2 = ({ onBack, onContinue }: OnboardingStep2Props) => {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: "#FFFFFF",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2 }}>
				{/* Header */}
				<Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
					<IconButton onClick={onBack} sx={{ color: "#496FB5" }}>
						<ArrowBackIcon />
					</IconButton>
					<Box
						sx={{
							flex: 1,
							textAlign: "center",
							fontSize: "1.125rem",
							fontWeight: 600,
							color: "#496FB5",
							pr: 5,
						}}
					>
						HelioCoach
					</Box>
				</Stack>

				{/* Content */}
				<Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
					{/* Shield illustration */}
					

					{/* Scan Image */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto",
							backgroundColor: "#496FB62E",
							borderRadius: "50%",
							mb: 2,
							p: 3,
						}}
					>
						<Box
							component="img"
							src="/shield-star.png"
							alt="Scan supplement label"
							sx={{
								width: "100%",
								maxWidth: "100px",
								height: "auto",
								borderRadius: 2,
							}}
						/>
					</Box>

					{/* Streak Card */}
					<Box sx={{ mb: 4 }}>
						<StreakCard />
					</Box>

					{/* Title */}
					<Box
						sx={{
							fontSize: { xs: "1.75rem", sm: "2rem" },
							fontWeight: 700,
							color: "#1F2937",
							textAlign: "center",
							mb: 1.5,
							lineHeight: 1.2,
						}}
					>
						Protect your Streak
					</Box>

					{/* Subtitle */}
					<Box
						sx={{
							fontSize: "1rem",
							color: "#6B7280",
							textAlign: "center",
							maxWidth: 280,
							mx: "auto",
						}}
					>
						We'll help you stay consistent and celebrate your progress.
					</Box>
				</Box>

				{/* Progress dots - above footer */}
				<Box sx={{ mt: "auto", mb: 3 }}>
					<ProgressDots totalSteps={3} currentStep={2} variant="dark" />
				</Box>

				{/* Footer */}
				<Box sx={{ height: 140, pb: 4 }}>
					<Button
						variant="contained"
						fullWidth
						onClick={onContinue}
						sx={{
							backgroundColor: "#496FB5",
							color: "#FFFFFF",
							py: 1.75,
							borderRadius: 3,
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							boxShadow: "0 4px 12px rgba(74, 90, 138, 0.3)",
							"&:hover": {
								backgroundColor: "#3d5fa0",
								boxShadow: "0 6px 16px rgba(74, 90, 138, 0.4)",
							},
						}}
					>
						Continue
					</Button>
				</Box>
			</Container>
		</Box>
	);
};
