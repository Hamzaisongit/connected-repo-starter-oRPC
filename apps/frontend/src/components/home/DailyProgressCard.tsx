import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";

interface DailyProgressCardProps {
	totalScheduled: number;
	takenOnTime: number;
	takenLate: number;
	missed: number;
	skipped: number;
	completionPercentage: number;
}

export const DailyProgressCard = ({
	totalScheduled,
	takenOnTime,
	takenLate,
	missed,
	skipped,
	completionPercentage,
}: DailyProgressCardProps) => {
	const completed = takenOnTime + takenLate;
	const remaining = totalScheduled - completed - missed - skipped;

	return (
		<Card
			sx={{
				p: { xs: 2, md: 3 },
				background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
				color: "white",
				borderRadius: 2,
				boxShadow: "0 4px 20px rgba(0, 123, 255, 0.3)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={3}
				alignItems="center"
			>
				<Box
					sx={{
						position: "relative",
						display: "inline-flex",
					}}
				>
					<CircularProgress
						variant="determinate"
						value={completionPercentage}
						size={100}
						sx={{
							color: "white",
							".MuiCircularProgress-circle": {
								strokeLinecap: "round",
							},
						}}
						thickness={5}
					/>
					<Box
						sx={{
							top: 0,
							left: 0,
							bottom: 0,
							right: 0,
							position: "absolute",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography variant="h4" fontWeight={700}>
							{Math.round(completionPercentage)}%
						</Typography>
					</Box>
				</Box>

				<Box sx={{ flex: 1, width: "100%" }}>
					<Typography
						variant="h5"
						fontWeight={600}
						gutterBottom
						sx={{ mb: 2 }}
					>
						Today's Progress
					</Typography>
					<Stack direction="row" spacing={3} flexWrap="wrap">
						<Box>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								Completed
							</Typography>
							<Typography variant="h6" fontWeight={600}>
								{completed}/{totalScheduled}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								On Time
							</Typography>
							<Typography variant="h6" fontWeight={600}>
								{takenOnTime}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								Late
							</Typography>
							<Typography variant="h6" fontWeight={600}>
								{takenLate}
							</Typography>
						</Box>
						{missed > 0 && (
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Missed
								</Typography>
								<Typography variant="h6" fontWeight={600}>
									{missed}
								</Typography>
							</Box>
						)}
						{skipped > 0 && (
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Skipped
								</Typography>
								<Typography variant="h6" fontWeight={600}>
									{skipped}
								</Typography>
							</Box>
						)}
						{remaining > 0 && (
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Remaining
								</Typography>
								<Typography variant="h6" fontWeight={600}>
									{remaining}
								</Typography>
							</Box>
						)}
					</Stack>
				</Box>
			</Stack>
		</Card>
	);
};
