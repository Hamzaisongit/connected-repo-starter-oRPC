import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { alpha, useTheme } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";
import React from "react";

interface DailyProgressBarProps {
	totalCount: number;
	takenCount: number;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({ totalCount, takenCount }) => {
	const theme = useTheme();
	const progress = totalCount > 0 ? Math.min(takenCount / totalCount, 1) * 100 : 0;
	const isComplete = takenCount >= totalCount && totalCount > 0;

	return (
		<Box
			sx={{
				width: "100%",
				p: 3,
				borderRadius: "32px",
				backgroundColor: "background.paper",
				border: "1px solid",
				borderColor: alpha(theme.palette.divider, 0.05),
				boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.03)",
				display: "flex",
				flexDirection: "column",
				gap: 2,
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
				<Box>
					<Typography
						variant="h6"
						sx={{
							fontFamily: '"Playfair Display", Georgia, serif',
							fontWeight: 700,
							fontSize: "1.25rem",
							color: "text.primary",
							mb: 0.5,
						}}
					>
						Daily Progress
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: "text.secondary",
							fontWeight: 500,
						}}
					>
						{isComplete ? "All supplements taken! 🎉" : `${takenCount} of ${totalCount} completed`}
					</Typography>
				</Box>
				<Typography
					sx={{
						fontSize: "1.5rem",
						fontWeight: 800,
						color: theme.palette.primary.light,
					}}
				>
					{Math.round(progress)}%
				</Typography>
			</Box>

			<LinearProgress 
				variant="determinate" 
				value={progress} 
				sx={{
					height: 12,
					borderRadius: 6,
					backgroundColor: alpha(theme.palette.primary.main, 0.08),
					[`& .MuiLinearProgress-bar`]: {
						borderRadius: 6,
						background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
						boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
					},
				}}
			/>

			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Typography
					variant="caption"
					sx={{
						fontWeight: 700,
						color: "text.disabled",
						letterSpacing: "0.1em",
						textTransform: "uppercase",
					}}
				>
					{isComplete ? "Goal reached" : "Keep it up"}
				</Typography>
				{isComplete && (
					<Box
						sx={{
							px: 1.5,
							py: 0.5,
							borderRadius: "100px",
							bgcolor: alpha(theme.palette.success.main, 0.1),
							color: theme.palette.success.main,
							fontSize: "0.75rem",
							fontWeight: 700,
						}}
					>
						PERFECT DAY
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default DailyProgressBar;
