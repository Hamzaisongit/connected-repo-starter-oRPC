import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { LocalFireDepartment } from "@connected-repo/ui-mui/icons/LocalFireDepartmentIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";

interface StreakCardProps {
	currentStreak: number;
	bestStreak: number;
}

export const StreakCard = ({ currentStreak, bestStreak }: StreakCardProps) => {
	return (
		<Card
			sx={{
				p: { xs: 2, md: 3 },
				background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
				color: "white",
				borderRadius: 2,
				boxShadow: "0 4px 20px rgba(238, 90, 36, 0.3)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					position: "absolute",
					right: -20,
					top: -20,
					opacity: 0.1,
				}}
			>
				<LocalFireDepartment sx={{ fontSize: 120 }} />
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Box
					sx={{
						background: "rgba(255, 255, 255, 0.2)",
						borderRadius: "50%",
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backdropFilter: "blur(10px)",
					}}
				>
					<LocalFireDepartment sx={{ fontSize: 40 }} />
				</Box>

				<Box>
					<Typography variant="h6" fontWeight={600} gutterBottom>
						Current Streak
					</Typography>
					<Typography variant="h3" fontWeight={700}>
						{currentStreak}{" "}
						<Typography
							variant="h6"
							component="span"
							fontWeight={400}
							sx={{ opacity: 0.9 }}
						>
							days
						</Typography>
					</Typography>
					{bestStreak > currentStreak && (
						<Typography
							variant="body2"
							sx={{ opacity: 0.9, mt: 0.5 }}
						>
							Best: {bestStreak} days
						</Typography>
					)}
				</Box>
			</Box>
		</Card>
	);
};
