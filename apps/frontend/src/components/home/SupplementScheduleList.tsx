import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Cancel } from "@connected-repo/ui-mui/icons/CancelIcon";
import { CheckCircle } from "@connected-repo/ui-mui/icons/CheckCircleIcon";
import { Warning } from "@connected-repo/ui-mui/icons/WarningIcon";
import { AccessTime } from "@connected-repo/ui-mui/icons/AccessTimeIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import type { SupplementSchedule } from "@connected-repo/zod-schemas/user_adherence_log.zod";
import { format } from "date-fns";


interface SupplementScheduleListProps {
	schedule: SupplementSchedule[];
	onSupplementClick: (supplementId: string, scheduledTime: number) => void;
}

const getStatusColor = (status: string): "success" | "error" | "default" | "info" => {
	switch (status) {
		case "taken":
			return "success";
		case "missed":
			return "error";
		case "skipped":
			return "default";
		case "pending":
			return "info";
		default:
			return "default";
	}
};

const getStatusIcon = (status: string) => {
	switch (status) {
		case "taken":
			return <CheckCircle fontSize="small" />;
		case "missed":
			return <Warning fontSize="small" />;
		case "skipped":
			return <Cancel fontSize="small" />;
		case "pending":
			return <AccessTime fontSize="small" />;
		default:
			return <AccessTime fontSize="small" />;
	}
};

export const SupplementScheduleList = ({
	schedule,
	onSupplementClick,
}: SupplementScheduleListProps) => {
	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return format(date, "h:mm a");
	};

	if (schedule.length === 0) {
		return (
			<Card
				sx={{
					p: 4,
					textAlign: "center",
					borderRadius: 2,
					border: "1px dashed",
					borderColor: "divider",
				}}
			>
				<Typography variant="body1" color="text.secondary">
					No supplements scheduled for today
				</Typography>
			</Card>
		);
	}

	return (
		<Stack spacing={2}>
			{schedule.map((item) => (
				<Card
					key={`${item.supplement.id}-${item.scheduledTime}`}
					onClick={() =>
						item.status === "pending" &&
						onSupplementClick(item.supplement.id, item.scheduledTime)
					}
					sx={{
						p: { xs: 2, md: 2.5 },
						borderRadius: 2,
						border: "1px solid",
						borderColor: "divider",
						cursor: item.status === "pending" ? "pointer" : "default",
						transition: "all 0.2s ease-in-out",
						"&:hover": item.status === "pending"
							? {
									borderColor: "primary.main",
									boxShadow: 2,
								}
							: {},
					}}
				>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", sm: "center" }}
						spacing={{ xs: 2, sm: 0 }}
					>
						<Stack spacing={1} sx={{ flex: 1 }}>
							<Typography variant="h6" fontWeight={600}>
								{item.supplement.name}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{item.supplement.dosage} {item.supplement.unit}
								{item.supplement.instructions.length > 0 && (
									<> • {item.supplement.instructions[0]}</>
								)}
							</Typography>
						</Stack>

						<Stack direction="row" spacing={1.5} alignItems="center">
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 0.5,
								}}
							>
								<AccessTime fontSize="small" sx={{ color: "text.secondary" }} />
								<Typography variant="body2" fontWeight={500}>
									{formatTime(item.scheduledTime)}
								</Typography>
							</Box>

							<Chip
								icon={getStatusIcon(item.status)}
								label={
									item.status.charAt(0).toUpperCase() +
									item.status.slice(1)
								}
								color={getStatusColor(item.status)}
								size="small"
								sx={{
									fontWeight: 500,
									textTransform: "capitalize",
								}}
							/>
						</Stack>
					</Stack>
				</Card>
			))}
		</Stack>
	);
};
