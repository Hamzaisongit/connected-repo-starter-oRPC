import { Button } from "@connected-repo/ui-mui/form/Button";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton";
import { useState } from "react";
import { ProgressDots } from "./ProgressDots";
import { SupplementSelectionCard } from "./SupplementSelectionCard";

interface OnboardingStep3Props {
	onBack: () => void;
	onFinish: () => void;
}

const supplements = [
	{ id: "multivitamin", name: "Multivitamin", icon: "💊" },
	{ id: "omega3", name: "Omega-3", icon: "🐟" },
	{ id: "vitaminD", name: "Vitamin D", icon: "☀️" },
	{ id: "magnesium", name: "Magnesium", icon: "🧪" },
	{ id: "creatnine", name: "Creatinine", icon: "⚡️" },
	{ id: "vitaminC", name: "Vitamin C", icon: "🍊" },
];

export const OnboardingStep3 = ({ onBack, onFinish }: OnboardingStep3Props) => {
	const [selectedSupplements, setSelectedSupplements] = useState<string[]>(["multivitamin"]);

	const handleToggle = (id: string) => {
		setSelectedSupplements((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const handleFinish = () => {
		// Save selections to localStorage
		localStorage.setItem("onboarding_supplements", JSON.stringify(selectedSupplements));
		onFinish();
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
			<Container maxWidth="sm" sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2 }}>
				{/* Header */}
				<Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
					<IconButton onClick={onBack} sx={{ color: "#FFFFFF" }}>
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
				<Box sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 4 }}>
					{/* Title */}
					<Box
						sx={{
							fontSize: { xs: "1.75rem", sm: "2rem" },
							fontWeight: 700,
							color: "#FFFFFF",
							textAlign: "center",
							mb: 1.5,
							lineHeight: 1.2,
						}}
					>
						What's in your daily stack?
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
						Select your staples to build your routine
					</Box>

					{/* Supplements grid */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: 2,
							margin: "0 auto",
							mb: 4,
						}}
					>
						{supplements.map((supplement) => (
							<SupplementSelectionCard
								key={supplement.id}
								id={supplement.id}
								name={supplement.name}
								icon={supplement.icon}
								selected={selectedSupplements.includes(supplement.id)}
								onToggle={handleToggle}
							/>
						))}
					</Box>
				</Box>

				{/* Progress dots - above footer */}
				<Box sx={{ mt: "auto", mb: 3 }}>
					<ProgressDots totalSteps={3} currentStep={3} variant="light" />
				</Box>

				{/* Footer */}
				<Box sx={{ height: 140, pb: 4 }}>
					<Button
						variant="outlined"
						fullWidth
						onClick={handleFinish}
						sx={{
							backgroundColor: "#FFFFFF",
							color: "#496FB5",
							borderColor: "#FFFFFF",
							borderWidth: 2,
							py: 1.75,
							borderRadius: 3,
							fontSize: "1rem",
							fontWeight: 600,
							textTransform: "none",
							"&:hover": {
								backgroundColor: "rgba(255, 255, 255, 0.1)",
								borderColor: "#FFFFFF",
								borderWidth: 2,
							},
						}}
					>
						Finish setup
					</Button>
				</Box>
			</Container>
		</Box>
	);
};
