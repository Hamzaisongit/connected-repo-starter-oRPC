import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import type { SupplementSchedule } from "@connected-repo/zod-schemas/user_adherence_log.zod";

interface SupplementScheduleCardProps {
	schedule: SupplementSchedule;
	onClick: (schedule: SupplementSchedule) => void;
	isNext?: boolean;
}

const getStatusColor = (status: string, isOverdue: boolean) => {
	if (status === "taken") {
		return "success";
	}
	if (status === "skipped") {
		return "default";
	}
	if (status === "missed") {
		return "error";
	}
	if (isOverdue) {
		return "warning";
	}
	return "primary";
};

const getStatusLabel = (status: string) => {
	if (status === "taken") return "✓ Taken";
	if (status === "skipped") return "⏭️ Skipped";
	if (status === "missed") return "❌ Missed";
	return "⏳ Pending";
};

const formatTime = (timestamp: number) => {
	const date = new Date(timestamp);
	const hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const suffix = hours >= 12 ? "PM" : "AM";
	const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
	return `${displayHour}:${minutes} ${suffix}`;
};

export const SupplementScheduleCard = ({
	schedule,
	onClick,
	isNext = false,
}: SupplementScheduleCardProps) => {
	const { supplement, scheduledTime, status, isOverdue } = schedule;
	const canInteract = status === "pending" || status === "missed";

	return (
		<Card
			onClick={canInteract ? () => onClick(schedule) : undefined}
			sx={{
				p: 2.5,
				transition: "all 0.2s ease-in-out",
				border: isNext ? "2px solid" : "1px solid",
				borderColor: isNext ? "primary.main" : "divider",
				boxShadow: isNext ? 3 : 1,
				cursor: canInteract ? "pointer" : "default",
				position: "relative",
				overflow: "visible",
				bgcolor: isOverdue && status === "pending" ? "warning.lighter" : "background.paper",
				"&:hover": canInteract
					? {
							transform: "translateY(-2px)",
							boxShadow: 4,
					  }
					: {},
			}}
		>
			{isNext && (
				<Box
					sx={{
						position: "absolute",
						top: -10,
						right: -10,
						bgcolor: "primary.main",
						color: "white",
						fontSize: 12,
						fontWeight: 700,
						padding: "4px 10px",
						borderRadius: 20,
						textTransform: "uppercase",
						zIndex: 1,
					}}
				>
					Next
				</Box>
			)}

			<Stack spacing={2}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
					}}
				>
					<Stack spacing={0.5} flex={1}>
						<Typography variant="h6" fontWeight={600} gutterBottom>
							{supplement.name}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 0.5,
							}}
						>
							📦 {supplement.dosage} {supplement.unit}
						</Typography>
					</Stack>

					<Chip
						label={getStatusLabel(status)}
						color={getStatusColor(status, isOverdue)}
						size="small"
						variant="outlined"
						sx={{
							fontWeight: 600,
							minWidth: 90,
							ml: 1,
						}}
					/>
				</Box>

				{supplement.instructions && supplement.instructions.length > 0 && (
					<Box
						sx={{
							bgcolor: "background.default",
							p: 1.5,
							borderRadius: 1.5,
							borderLeft: "3px solid",
							borderLeftColor: "divider",
						}}
					>
						<Typography variant="caption" color="text.secondary">
							{supplement.instructions[0]}
						</Typography>
					</Box>
				)}

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						pt: 0.5,
					}}
				>
					<Typography
						variant="body2"
						fontWeight={500}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
						}}
					>
						🕐 {formatTime(scheduledTime)}
					</Typography>

					{canInteract && (
						<Typography
							variant="caption"
							color="primary"
							fontWeight={600}
							sx={{
								ml: "auto",
							}}
						>
							{status === "pending" ? "Tap to log →" : "Tap to update →"}
						</Typography>
					)}
				</Box>
			</Stack>
		</Card>
	);
};
