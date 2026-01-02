import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";

interface StreakDisplayProps {
	currentStreak: number;
	longestStreak?: number;
}

export const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				background: "linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ffd93d 100%)",
				color: "white",
				borderRadius: 3,
				transition: "transform 0.2s ease-in-out",
				"&:hover": {
					transform: "scale(1.02)",
				},
			}}
		>
			<Stack spacing={2} alignItems="center">
				<Box
					sx={{
						fontSize: 48,
						lineHeight: 1,
						animation: currentStreak > 0 ? "pulse 2s infinite" : "none",
						"@keyframes pulse": {
							"0%, 100%": {
								transform: "scale(1)",
								opacity: 1,
							},
							"50%": {
								transform: "scale(1.1)",
								opacity: 0.9,
							},
						},
					}}
				>
					🔥
				</Box>

				<Stack spacing={0.5} alignItems="center">
					<Typography
						variant="h3"
						fontWeight={700}
						sx={{
							fontSize: 36,
							lineHeight: 1.2,
						}}
					>
						{currentStreak} days
					</Typography>
					<Typography
						variant="body2"
						fontWeight={500}
						sx={{
							opacity: 0.95,
						}}
					>
						current streak
					</Typography>
				</Stack>

				{longestStreak !== undefined && longestStreak > 0 && (
					<Box
						sx={{
							background: "rgba(255, 255, 255, 0.2)",
							borderRadius: 2,
							py: 0.75,
							px: 1.5,
						}}
					>
						<Typography
							variant="caption"
							fontWeight={500}
							sx={{
								opacity: 0.95,
							}}
						>
							Best: {longestStreak} days
						</Typography>
					</Box>
				)}
			</Stack>
		</Card>
	);
};
