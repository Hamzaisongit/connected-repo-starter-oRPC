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
import { IconButton } from "@connected-repo/ui-mui/navigation/IconButton"
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
            p: 2,
            // Clean Structure
            borderRadius: 3, // ~12px (Standard modern radius, less bubbly)
            border: "1px solid",
            borderColor: "divider", // Crisp border
            backgroundColor: "background.paper",
            transition: "border-color 0.2s, background-color 0.2s",
            
            // Subtle interaction only
            "&:hover": onCardClick ? {
                borderColor: "text.secondary", // Border gets slightly darker
                backgroundColor: "action.hover", // Very faint grey fill
            } : {},
        }}
    >
        {/* Clickable Area */}
        <Box
            onClick={() => onCardClick && onCardClick(supplement.id)}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
                minWidth: 0,
                cursor: onCardClick ? "pointer" : "default",
            }}
        >
            {/* Image/Icon: Clean Circle with subtle border */}
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: stockIconData.bgColor, // Keep the soft background
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.primary",
                    fontSize: "1.5rem",
                    flexShrink: 0,
                }}
            >
                {supplement.imageUrl ? (
                     <Box component="img" src={supplement.imageUrl} sx={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                ) : stockIconData.icon}
            </Box>

            {/* Info Section: Better Hierarchy */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}>
                    {supplement.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {supplement.dosage}{supplement.unit}
                    </Typography>
                    {/* Small separator dot */}
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                         {formatTime(supplement.reminderTime)}
                    </Typography>
                </Box>
            </Box>
        </Box>

        {/* Action Button: Solid, reliable feel */}
        <IconButton
            onClick={handleLogClick}
            disabled={isLogging || isLoading}
            sx={{
                width: 44,
                height: 44,
                border: "1px solid",
                // If taken: Solid color. If not: Outline only.
                borderColor: isTaken ? "transparent" : "divider",
                backgroundColor: isTaken ? "success.main" : alpha(theme.palette.success.main, 0.3),
                color: isTaken ? "white" : "text.secondary",
                transition: "all 0.2s",
                "&:hover": {
                    backgroundColor: isTaken ? "success.dark" : "action.hover",
                    borderColor: isTaken ? "transparent" : "text.primary",
                },
                "&:disabled": {
                    backgroundColor: isTaken ? "success.light" : "action.disabledBackground",
                }
            }}
        >
            {isLoading ? "..." : isTaken ? "✓" : "+"}
        </IconButton>

        {/* Revert Dialog (Standard) */}
        <Dialog open={revertDialogOpen} onClose={handleRevertCancel} maxWidth="xs" fullWidth>
            <DialogTitle>Undo Log?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Remove log for <strong>{supplement.name}</strong>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRevertCancel} color="inherit">Cancel</Button>
                <Button onClick={handleRevertConfirm} color="error" variant="contained" disableElevation>Remove</Button>
            </DialogActions>
        </Dialog>
    </Box>
);
 }