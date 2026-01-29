import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import type { TodaysPlanSupplement } from "@connected-repo/zod-schemas/user_stack.zod";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { detectUserTimezone } from "@frontend/utils/timezone.utils";
import { alpha, useTheme } from "@mui/material/styles";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface SupplementCardProps {
	supplement: TodaysPlanSupplement;
	onRevert?: (supplementId: string, reminderTime: string) => Promise<void>;
	onCardClick?: (supplementId: string) => void;
}

// Status config is now handled directly in the component

// Helper function to normalize status to component's expected values
const normalizeStatus = (status: string): "pending" | "taken" | "missed" | "overdue" => {
	if (status === "pending" || status === "overdue") return status as "pending" | "overdue";
	if (status === "Taken on-time" || status === "Taken late") return "taken";
	if (status === "Missed" || status === "Skipped") return "missed";
	return "pending"; // fallback
};

export function SupplementCard({ supplement, onRevert, onCardClick }: SupplementCardProps) {
	const theme = useTheme();
	const [isLoading, setIsLoading] = useState(false);
	const [revertDialogOpen, setRevertDialogOpen] = useState(false);
	const { user } = useSessionInfo();

		// Quick log mutation
	const logMutation = useMutation(orpc.userIntakeLogs.create.mutationOptions());

	const isLogging = logMutation.isPending;



	const onLogTaken = async (supplementId: string, scheduledTime: string) => {
		try {
			// Calculate scheduled time in user's timezone
			const userTimezone = user?.timezone|| await detectUserTimezone() || "Etc/UTC";
			const today = dayjs().tz(userTimezone);
			const [hoursStr, minutesStr] = scheduledTime.split(":");
			const hours = parseInt(hoursStr || "0", 10);
			const minutes = parseInt(minutesStr || "0", 10);
			const scheduledDayjs = today.hour(hours).minute(minutes).second(0).millisecond(0);
			const scheduledFor = scheduledDayjs.utc().valueOf();

			// Determine status based on time difference (within 1 hour window)
			const actualAt = Date.now();
			const timeDiffMs = Math.abs(actualAt - scheduledFor);
			const isOnTime = timeDiffMs <= 60 * 60 * 1000; // 1 hour in ms
			const status: "Taken on-time" | "Taken late" = isOnTime ? "Taken on-time" : "Taken late";

			await logMutation.mutateAsync({
				supplementId,
				scheduledFor,
				status,
				actualAt,
				logTimezone: userTimezone,
			});

			// Invalidate queries to refresh the data
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getTodaysPlan.queryKey() });
			queryClient.invalidateQueries({ queryKey: orpc.userStats.getMine.queryKey() });
		} catch (error) {
			console.error("Failed to log adherence:", error);
			console.error("Failed to log. Please try again.");
		}
	};

  	const isTaken = normalizeStatus(supplement.status) === "taken";

 	const handleLogClick = () => {
  		if (isTaken) {
  			// Show revert confirmation dialog
  			setRevertDialogOpen(true);
  		} else {
  			// Log as taken
  			handleLogTaken();
  		}
  	};

   	const handleLogTaken = async () => {
    		setIsLoading(true);
    		try {
    			await onLogTaken(supplement.id, supplement.reminderTime);
    		} catch (error) {
    			throw error;
    		} finally {
    			setIsLoading(false);
    		}
    	};

  	const handleRevertConfirm = async () => {
   		if (!onRevert) return;

   		setRevertDialogOpen(false);
   		setIsLoading(true);
    		try {
    			await onRevert(supplement.id, supplement.reminderTime);
    		} catch (error) {
    			throw error;
    		} finally {
   			setIsLoading(false);
   		}
   	};

 	const handleRevertCancel = () => {
  		setRevertDialogOpen(false);
  	};

 	const formatTime = (time: string) => {
 		// Convert HH:MM to readable format
 		const [hours, minutes] = time.split(":");
 		const hour = parseInt(hours || "0", 10);
 		const ampm = hour >= 12 ? "PM" : "AM";
 		const displayHour = hour % 12 || 12;
 		return `${displayHour}:${minutes || "00"} ${ampm}`;
 	};



   // Calculate status text and color with robust date handling
   const getStatusInfo = () => {
   	const intakeStatus = supplement.todayIntakeLog?.status || supplement.status;
   	if (intakeStatus === "Taken on-time") {
   		return { text: `🌟 Taken on time!`, color: theme.palette.success.main, isWin: true };
   	}
   	if (intakeStatus === "Taken late") {
   		return { text: `⏰ Taken late`, color: theme.palette.warning.main, isWin: false };
   	}

  	// Helper function to create today's date with scheduled time
  	const createScheduledDateTime = (timeString: string) => {
  		try {
  			const parts = timeString.split(':');
  			const hours = parseInt(parts[0] || '0', 10);
  			const minutes = parseInt(parts[1] || '0', 10);

  			if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
  				throw new Error('Invalid time format');
  			}

  			const today = new Date();
  			today.setHours(hours, minutes, 0, 0);
  			return today;
  		} catch {
  			throw new Error('Invalid time format');
  		}
  	};

   	const scheduledDateTime = createScheduledDateTime(supplement.reminderTime);

  	const now = new Date();
  	const isOverdue = supplement.status === "overdue";

   	if (isOverdue) {
  		const timeDiff = now.getTime() - scheduledDateTime.getTime();

  		if (timeDiff < 0) {
  			return { text: `🔔 Due Now`, color: theme.palette.warning.main, isWin: false };
  		}

  		const minutesOverdue = Math.floor(timeDiff / (1000 * 60));
  		if (minutesOverdue < 60) {
  			return { text: `⚠️ Overdue by ${minutesOverdue} mins`, color: theme.palette.error.main, isWin: false };
  		}
  		const hoursOverdue = Math.floor(minutesOverdue / 60);
  		return { text: `⚠️ Overdue by ${hoursOverdue}h`, color: theme.palette.error.main, isWin: false };
  	}

  	const timeDiff = scheduledDateTime.getTime() - now.getTime();

   	if (timeDiff <= 0) {
  		return { text: `🔔 Due Now`, color: theme.palette.warning.main, isWin: false };
  	}

  	const minutesLeft = Math.floor(timeDiff / (1000 * 60));
  	if (minutesLeft <= 60) {
  		return { text: `🕒 Due in ${minutesLeft}m`, color: theme.palette.text.secondary, isWin: false };
  	}
  	const hoursLeft = Math.floor(minutesLeft / 60);
  	return { text: `🕒 Due in ${hoursLeft}h`, color: theme.palette.text.secondary, isWin: false };
  };

  const statusInfo = getStatusInfo();
  const stockIconData = getStockIconAndColor(supplement.name);

  return (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 2,
			py: 2, // Adjusted padding for better density
			px: 2,
			// Airy Compliance: Round borders for list items
			borderRadius: "24px",
			transition: "all 0.2s ease",
			"&:hover": onCardClick ? {
				backgroundColor: alpha(theme.palette.action.hover, 0.04),
				transform: "translateY(-1px)",
			} : {},
		}}
	>
		{/* Clickable area for card navigation */}
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 2,
				flex: 1,
				minWidth: 0,
				cursor: onCardClick ? "pointer" : "default",
			}}
			onClick={() => onCardClick && onCardClick(supplement.id)}
		>
			{/* Left: Circular Thumbnail */}
			<Box
				sx={{
					width: 48,
					height: 48,
					borderRadius: "50%",
					border: "1px solid",
					borderColor: "divider",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: stockIconData.bgColor,
					overflow: "hidden",
					flexShrink: 0,
				}}
			>
				{supplement.imageUrl ? (
					<img
						src={supplement.imageUrl}
						alt={supplement.name}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
						}}
						onError={(e) => {
							const target = e.target as HTMLImageElement;
							target.style.display = "none";
							const parent = target.parentElement;
							if (parent) parent.innerHTML = `<span style="font-size: 1.5rem;">${stockIconData.icon}</span>`;
						}}
					/>
				) : (
					<Box sx={{ fontSize: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
						{stockIconData.icon}
					</Box>
				)}
			</Box>

			{/* Center: Info */}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					sx={{
						fontFamily: '"Playfair Display", Georgia, serif',
						fontWeight: 600,
						fontSize: "1rem",
						lineHeight: 1.3,
						color: "text.primary",
						mb: 0.5,
					}}
				>
					{supplement.name}
				</Typography>

				<Typography
					sx={{
						fontSize: "0.875rem",
						color: "text.secondary",
						fontWeight: 500,
						mb: 0.5,
					}}
				>
					{supplement.dosage} {supplement.unit} • {formatTime(supplement.reminderTime)}
				</Typography>

				<Typography
					sx={{
						fontSize: "0.8rem",
						color: statusInfo.color,
						fontWeight: 600,
					}}
				>
					{statusInfo.text}
				</Typography>
			</Box>
		</Box>

		{/* Right: Circular Action Button */}
		<Button
			variant="outlined"
			onClick={handleLogClick}
			disabled={isLogging || isLoading}
			sx={{
				minWidth: 48,
				width: 48,
				height: 48,
				borderRadius: "50%", // Full circle
				fontSize: "1.4rem",
				fontWeight: 600,
				p: 0,
				// Dynamic Theme Styling
				borderColor: isTaken ? theme.palette.success.main : theme.palette.text.secondary,
				backgroundColor: isTaken ? theme.palette.success.main : "transparent",
				color: isTaken ? theme.palette.success.contrastText : theme.palette.text.secondary,
				"&:hover": {
					backgroundColor: isTaken ? theme.palette.success.dark : theme.palette.action.hover,
					borderColor: isTaken ? theme.palette.success.dark : theme.palette.text.primary,
					color: isTaken ? theme.palette.success.contrastText : theme.palette.text.primary,
				},
				"&:disabled": {
					backgroundColor: isTaken ? theme.palette.success.light : theme.palette.action.disabledBackground,
					borderColor: "transparent",
					color: "white",
				},
			}}
		>
			{isLoading ? "..." : isTaken ? "✓" : "+"}
		</Button>

		{/* Revert Dialog */}
		<Dialog
			open={revertDialogOpen}
			onClose={handleRevertCancel}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: { borderRadius: 1.5 } // Ensure dialog matches theme
			}}
		>
			<DialogTitle sx={{ fontWeight: 600 }}>⚠️ Revert Log?</DialogTitle>
			<DialogContent>
				<DialogContentText color="text.secondary">
					Did you mark <strong>{supplement.name}</strong> as taken by mistake? This will remove today's entry.
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button
					onClick={handleRevertConfirm}
					disabled={isLoading}
					variant="contained"
					disableElevation
					sx={{
						backgroundColor: theme.palette.error.main,
						fontWeight: 600,
					}}
				>
					{isLoading ? "Reverting..." : "Yes, Revert"}
				</Button>
				<Button 
					onClick={handleRevertCancel} 
					variant="text"
					sx={{
						color: theme.palette.secondary.contrastText,
						backgroundColor: theme.palette.secondary.main,
						fontWeight: 600,
					}}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	</Box>
);
 }