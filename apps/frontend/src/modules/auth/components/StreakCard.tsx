import { CheckCircleIcon } from "@connected-repo/ui-mui/icons/CheckCircleIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";

const days = ["M", "T", "W", "Th", "F", "Sa", "S"];
const completedDays = [true, true, true, true, true, true, false]; // Example: 6 day streak

export const StreakCard = () => {
	return (
		<Box
			sx={{
				backgroundColor: "#FFFFFF",
				borderColor: "#000000",
				borderWidth: 1,
				borderStyle: "solid",
				borderRadius: 0.5,
				p: 3,
				boxShadow: "-2.38px 1.91px 3.57px 1.43px rgba(0, 0, 0, 0.3)",
				maxWidth: 320,
				mx: "auto",
			}}
		>
			{/* Header */}
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
				<Box
					sx={{
						fontSize: "0.875rem",
						color: "#6B7280",
						fontWeight: 500,
					}}
				>
					Your progress
				</Box>
				<Box
					sx={{
						backgroundColor: "#FBBC05",
						color: "#FFFFFF",
						fontSize: "0.75rem",
						fontWeight: 600,
						px: 1.5,
						py: 0.5,
						borderRadius: 2,
					}}
				>
					6 Day streak
				</Box>
			</Stack>

			{/* Days row */}
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				{days.map((day, index) => (
					<Box
						key={day}
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Box
							sx={{
								fontSize: "0.75rem",
								color: "#9CA3AF",
								fontWeight: 500,
							}}
						>
							{day}
						</Box>
						<Box
							sx={{
								width: 28,
								height: 28,
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: completedDays[index] ? "#10B981" : "#F3F4F6",
								transition: "all 0.2s ease",
							}}
						>
							{completedDays[index] && (
								<CheckCircleIcon sx={{ fontSize: 18, color: "#FFFFFF" }} />
							)}
						</Box>
					</Box>
				))}
			</Stack>
		</Box>
	);
};
