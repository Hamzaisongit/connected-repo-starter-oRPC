import { Box } from "@connected-repo/ui-mui/layout/Box";

interface ProgressDotsProps {
	totalSteps: number;
	currentStep: number;
	variant?: "light" | "dark";
}

export const ProgressDots = ({ totalSteps, currentStep, variant = "dark" }: ProgressDotsProps) => {
	const activeColor = variant === "light" ? "#FFFFFF" : "#496FB5";
	const inactiveColor = variant === "light" ? "rgba(255, 255, 255, 0.3)" : "rgba(74, 90, 138, 0.3)";

	return (
		<Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
			{Array.from({ length: totalSteps }, (_, index) => {
				const isActive = index + 1 === currentStep;
				return (
					<Box
						key={index}
						sx={{
							width: isActive ? 24 : 8,
							height: 8,
							borderRadius: 4,
							backgroundColor: isActive ? activeColor : inactiveColor,
							transition: "all 0.3s ease",
						}}
					/>
				);
			})}
		</Box>
	);
};

export type { ProgressDotsProps };
