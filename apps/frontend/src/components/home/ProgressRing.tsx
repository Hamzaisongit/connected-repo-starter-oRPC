import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";

interface ProgressRingProps {
	percentage: number;
	size?: number;
	strokeWidth?: number;
}

export const ProgressRing = ({ percentage, size = 120, strokeWidth = 8 }: ProgressRingProps) => {
	const getColor = () => {
		if (percentage >= 80) return "success.main";
		if (percentage >= 50) return "primary.main";
		if (percentage >= 25) return "warning.main";
		return "error.main";
	};

	return (
		<Box
			sx={{
				position: "relative",
				display: "inline-flex",
			}}
		>
			<CircularProgress
				variant="determinate"
				value={percentage}
				size={size}
				thickness={strokeWidth}
				sx={{
					color: getColor(),
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Stack spacing={0.5} alignItems="center">
					<Typography
						variant="h4"
						fontWeight={700}
						sx={{
							fontSize: size * 0.25,
							color: "text.primary",
						}}
					>
						{percentage}%
					</Typography>
					<Typography
						variant="caption"
						fontWeight={500}
						color="text.secondary"
					>
						complete
					</Typography>
				</Stack>
			</Box>
		</Box>
	);
};
