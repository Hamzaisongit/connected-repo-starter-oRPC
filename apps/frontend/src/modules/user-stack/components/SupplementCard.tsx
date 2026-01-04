import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";

import type { TodaysPlanSupplement } from "@connected-repo/zod-schemas/user_stack.zod";
import { useState } from "react";

interface SupplementCardProps {
	supplement: TodaysPlanSupplement;
	onLogTaken: (supplementId: string, scheduledTime: string) => Promise<void>;
	isLogging?: boolean;
}

const getStatusConfig = (status: TodaysPlanSupplement["status"]) => {
	switch (status) {
		case "taken":
			return {
				icon: "✅",
				label: "Taken",
				color: "success" as const,
				variant: "filled" as const,
				buttonText: "✓ Logged",
				buttonDisabled: true,
			};
		case "pending":
			return {
				icon: "⏳",
				label: "Pending",
				color: "default" as const,
				variant: "outlined" as const,
				buttonText: "Log Now",
				buttonDisabled: false,
			};
		case "overdue":
			return {
				icon: "⏰",
				label: "Overdue",
				color: "warning" as const,
				variant: "filled" as const,
				buttonText: "Log Now",
				buttonDisabled: false,
			};
		case "missed":
			return {
				icon: "❌",
				label: "Missed",
				color: "error" as const,
				variant: "filled" as const,
				buttonText: "Log Now",
				buttonDisabled: false,
			};
		default:
			return {
				icon: "❓",
				label: "Unknown",
				color: "default" as const,
				variant: "outlined" as const,
				buttonText: "Log Now",
				buttonDisabled: false,
			};
	}
};

export function SupplementCard({ supplement, onLogTaken, isLogging }: SupplementCardProps) {
	const [isLoading, setIsLoading] = useState(false);
	const statusConfig = getStatusConfig(supplement.status);

	const handleLogClick = async () => {
		if (statusConfig.buttonDisabled) return;

		setIsLoading(true);
		try {
			await onLogTaken(supplement.id, supplement.scheduledTime);
		} finally {
			setIsLoading(false);
		}
	};

	const formatTime = (time: string) => {
		// Convert HH:MM to readable format
		const [hours, minutes] = time.split(":");
		const hour = parseInt(hours || "0");
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes || "00"} ${ampm}`;
	};

	return (
		<Card
			sx={{
				backgroundColor: "#FFFFFF !important",
				borderRadius: "32px",
				boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2) !important",
				transition: "all 0.2s ease-in-out",
				border: "2px solid #000000 !important",
				minHeight: "150px",
				"&:hover": {
					borderColor: statusConfig.color === "success" ? "success.main" :
					             statusConfig.color === "warning" ? "warning.main" :
					             statusConfig.color === "error" ? "error.main" : "primary.main",
					boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.3) !important",
					transform: "translateY(-2px)",
				},
			}}
		>
			<CardContent sx={{ p: 3, backgroundColor: "#FFFFFF !important" }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
					{/* Supplement Avatar/Icon */}
					<Avatar
						sx={{
							width: 48,
							height: 48,
							backgroundColor: supplement.imageUrl ? "transparent" : "primary.light",
							color: supplement.imageUrl ? "transparent" : "primary.contrastText",
						}}
						{...(supplement.imageUrl ? { src: supplement.imageUrl } : {})}
					>
						{!supplement.imageUrl && "💊"}
					</Avatar>

					{/* Supplement Info */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								fontSize: "1.2rem",
								lineHeight: 1.3,
								mb: 0.5,
								color: "#000000 !important",
							}}
						>
							{supplement.name}
						</Typography>
						<Typography
							variant="body2"
							sx={{ 
								fontSize: "0.95rem",
								color: "#333333 !important",
								fontWeight: 500,
							}}
						>
							{supplement.dosage} {supplement.unit} • {formatTime(supplement.scheduledTime)}
						</Typography>
					</Box>

					{/* Status Chip */}
					<Chip
						label={`${statusConfig.icon} ${statusConfig.label}`}
						color={statusConfig.color}
						variant={statusConfig.variant}
						size="small"
						sx={{
							fontWeight: 500,
							fontSize: "0.75rem",
							minWidth: 70,
						}}
					/>
				</Box>

				{/* Instructions */}
				{supplement.instructions.length > 0 && (
					<Box sx={{ mb: 2 }}>
						<Typography
							variant="body2"
							sx={{
								fontSize: "0.85rem",
								lineHeight: 1.4,
								color: "#444444 !important",
								fontWeight: 500,
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
								overflow: "hidden",
							}}
						>
							• {supplement.instructions.join(" • ")}
						</Typography>
					</Box>
				)}

				{/* Action Button */}
				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<Button
						variant={statusConfig.buttonDisabled ? "text" : "contained"}
						color={statusConfig.color === "success" ? "success" :
						       statusConfig.color === "warning" ? "warning" :
						       statusConfig.color === "error" ? "error" : "primary"}
						size="small"
						onClick={handleLogClick}
						disabled={statusConfig.buttonDisabled || isLogging || isLoading}
						sx={{
							minWidth: 100,
							fontSize: "0.8rem",
							fontWeight: 600,
							textTransform: "none",
							...(statusConfig.buttonDisabled && {
								color: "success.main",
								fontWeight: 500,
							}),
						}}
					>
						{isLoading ? "Logging..." : statusConfig.buttonText}
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
}