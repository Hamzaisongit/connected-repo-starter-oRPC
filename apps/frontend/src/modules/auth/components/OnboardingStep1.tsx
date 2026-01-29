import { Button } from "@connected-repo/ui-mui/form/Button";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { PhotoCameraIcon } from "@connected-repo/ui-mui/icons/PhotoCameraIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { ProgressDots } from "./ProgressDots";

interface OnboardingStep1Props {
	onBack: () => void;
	onContinue: () => void;
}

export const OnboardingStep1 = ({ onBack, onContinue }: OnboardingStep1Props) => {
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
							pr: 5, // Offset for back button
						}}
					>
						HelioCoach
					</Box>
				</Stack>

				{/* Content */}
				<Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
					{/* Title */}
					<Box
						sx={{
							fontSize: { xs: "1.75rem", sm: "2rem" },
							fontWeight: 700,
							color: "#496FB5",
							textAlign: "center",
							mb: 1.5,
							lineHeight: 1.2,
						}}
					>
						Supplement tracking simplified.
					</Box>

					{/* Subtitle */}
					<Box
						sx={{
							fontSize: "1rem",
							color: "#6B7280",
							textAlign: "center",
							mb: 4,
						}}
					>
						Track your supplements, one step at a time
					</Box>

					{/* Scan Image */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Box
							component="img"
							src="/scan-supplement.png"
							alt="Scan supplement label"
							sx={{
								width: "100%",
								maxWidth: 320,
								height: "auto",
								borderRadius: 2,
							}}
						/>
					</Box>

					{/* Feature */}
					<Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
						<Stack
							direction="row"
							alignItems="center"
							spacing={1.5}
							sx={{
								borderRadius: 2,
								py: 1.5,
								px: 2,
							}}
						>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: "50%",
									backgroundColor: "#496FB5",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<PhotoCameraIcon sx={{ color: "#FFFFFF", fontSize: 22 }} />
							</Box>
							<Box
								sx={{
									fontSize: "0.95rem",
									fontWeight: 500,
									color: "#374151",
								}}
							>
								Scan labels instantly
							</Box>
						</Stack>
					</Box>
				</Box>

				{/* Progress dots - above footer */}
				<Box sx={{ mt: "auto", mb: 3 }}>
					<ProgressDots totalSteps={3} currentStep={1} variant="dark" />
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
