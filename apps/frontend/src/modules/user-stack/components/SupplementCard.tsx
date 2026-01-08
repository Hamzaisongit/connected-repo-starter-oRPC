import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import type { TodaysPlanSupplement } from "@connected-repo/zod-schemas/user_stack.zod";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { useEffect, useState } from "react";

interface SupplementCardProps {
	supplement: TodaysPlanSupplement;
	onLogTaken: (supplementId: string, scheduledTime: string) => Promise<void>;
	onRevert?: (supplementId: string, scheduledTime: string) => Promise<void>;
	onCardClick?: (supplementId: string) => void;
	isLogging?: boolean;
}

// Status config is now handled directly in the component

export function SupplementCard({ supplement, onLogTaken, onRevert, onCardClick, isLogging }: SupplementCardProps) {
 	const [isLoading, setIsLoading] = useState(false);
 	const [revertDialogOpen, setRevertDialogOpen] = useState(false);
 	// Optimistic status state - starts with prop value and updates immediately on user action
 	const [optimisticStatus, setOptimisticStatus] = useState<"pending" | "taken" | "missed" | "overdue">(supplement.status);

 	// Sync optimistic status with actual supplement status when it changes from parent
 	useEffect(() => {
 		setOptimisticStatus(supplement.status);
 	}, [supplement.status]);

 	const isTaken = optimisticStatus === "taken";

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
  		// Optimistically update the status
  		setOptimisticStatus("taken");
  		try {
  			await onLogTaken(supplement.id, supplement.scheduledTime);
  		} catch (error) {
  			// Revert optimistic update on error
  			setOptimisticStatus(supplement.status);
  			throw error;
  		} finally {
  			setIsLoading(false);
  		}
  	};

 	const handleRevertConfirm = async () => {
  		if (!onRevert) return;

  		setRevertDialogOpen(false);
  		setIsLoading(true);
  		// Optimistically revert to pending status
  		const previousStatus = optimisticStatus;
  		setOptimisticStatus("pending");
  		try {
  			await onRevert(supplement.id, supplement.scheduledTime);
  		} catch (error) {
  			// Revert optimistic update on error
  			setOptimisticStatus(previousStatus);
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
  	if (isTaken) {
  		return { text: `🌟 Taken on time!`, color: "#4CAF50", isWin: true };
  	}

  	// Helper function to create today's date with scheduled time
  	const createScheduledDateTime = (timeString: string) => {
  		try {
  			const parts = timeString.split(':');
  			const hours = parseInt(parts[0] || '0', 10);
  			const minutes = parseInt(parts[1] || '0', 10);

  			if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
  				return null;
  			}

  			const today = new Date();
  			today.setHours(hours, minutes, 0, 0);
  			return today;
  		} catch {
  			return null;
  		}
  	};

  	const scheduledDateTime = createScheduledDateTime(supplement.scheduledTime);
  	if (!scheduledDateTime) {
  		return { text: `🕒 Check Schedule`, color: "#666666", isWin: false };
  	}

  	const now = new Date();
  	const isOverdue = supplement.status === "overdue";

  	if (isOverdue) {
  		const timeDiff = now.getTime() - scheduledDateTime.getTime();

  		if (timeDiff < 0) {
  			return { text: `🔔 Due Now`, color: "#FF9800", isWin: false };
  		}

  		const minutesOverdue = Math.floor(timeDiff / (1000 * 60));
  		if (minutesOverdue < 60) {
  			return { text: `⚠️ Overdue by ${minutesOverdue} mins`, color: "#FA8072", isWin: false };
  		}
  		const hoursOverdue = Math.floor(minutesOverdue / 60);
  		return { text: `⚠️ Overdue by ${hoursOverdue}h`, color: "#FA8072", isWin: false };
  	}

  	const timeDiff = scheduledDateTime.getTime() - now.getTime();

  	if (timeDiff <= 0) {
  		return { text: `🔔 Due Now`, color: "#FF9800", isWin: false };
  	}

  	const minutesLeft = Math.floor(timeDiff / (1000 * 60));
  	if (minutesLeft <= 60) {
  		return { text: `🕒 Due in ${minutesLeft}m`, color: "#666666", isWin: false };
  	}
  	const hoursLeft = Math.floor(minutesLeft / 60);
  	return { text: `🕒 Due in ${hoursLeft}h`, color: "#666666", isWin: false };
  };

  const statusInfo = getStatusInfo();
  const stockIconData = getStockIconAndColor(supplement.name);

  return (
  		<Box
  			sx={{
  				display: "flex",
  				alignItems: "center",
  				gap: 2,
  				py: 3,
  				px: 1,
  				cursor: onCardClick ? "pointer" : "default",
  				borderRadius: 2,
  				transition: "background-color 0.2s ease",
  				"&:hover": onCardClick ? {
  					backgroundColor: "rgba(0, 0, 0, 0.02)",
  				} : {},
  			}}
  			onClick={() => onCardClick && onCardClick(supplement.id)}
  		>
  			{/* Left: Circular Thumbnail - 40px with themed background */}
  			<Box
  				sx={{
  					width: 40,
  					height: 40,
  					borderRadius: "50%",
  					border: "1px solid #e0e0e0",
  					display: "flex",
  					alignItems: "center",
  					justifyContent: "center",
  					backgroundColor: stockIconData.bgColor,
  					overflow: "hidden",
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
  							borderRadius: "50%",
  						}}
  						onError={(e) => {
  							// Fallback to emoji if image fails to load
  							const target = e.target as HTMLImageElement;
  							target.style.display = "none";
  							const parent = target.parentElement;
  							if (parent) {
  								parent.innerHTML = `<span style="font-size: 1.2rem;">${stockIconData.icon}</span>`;
  							}
  						}}
  					/>
  				) : (
  					<span style={{ fontSize: "1.2rem" }}>
  						{stockIconData.icon}
  					</span>
  				)}
  			</Box>

 			{/* Center: 3-Line Info */}
 			<Box sx={{ flex: 1, minWidth: 0 }}>
 				{/* Line 1: Name - Serif font */}
 				<Typography
 					sx={{
 						fontFamily: '"Playfair Display", Georgia, serif',
 						fontWeight: 600,
 						fontSize: "1rem",
 						lineHeight: 1.3,
 						color: "#000000",
 						mb: 0.5,
 					}}
 				>
 					{supplement.name}
 				</Typography>

 				{/* Line 2: Dosage + Time */}
 				<Typography
 					sx={{
 						fontSize: "0.875rem",
 						color: "#666666",
 						fontWeight: 500,
 						mb: 0.5,
 					}}
 				>
 					{supplement.dosage} {supplement.unit} • {formatTime(supplement.scheduledTime)}
 				</Typography>

 				{/* Line 3: Status */}
 				<Typography
 					sx={{
 						fontSize: "0.8rem",
 						color: statusInfo.color,
 						fontWeight: 500,
 					}}
 				>
 					{statusInfo.text}
 				</Typography>
 			</Box>

 			{/* Right: Circular Outline Button */}
  			<Button
  				variant="outlined"
  				onClick={(e) => {
  					e.stopPropagation();
  					handleLogClick();
  				}}
  				disabled={isLogging || isLoading}
  				sx={{
  					minWidth: 48,
  					width: 48,
  					height: 48,
  					borderRadius: "50%",
  					border: `2px solid ${isTaken ? "#9CAF88" : "#000000"}`, // Sage green when taken
  					color: isTaken ? "#ffffff" : "#000000", // White text on green background when taken
  					fontSize: "1.4rem",
  					fontWeight: 600,
  					backgroundColor: isTaken ? "#9CAF88" : "transparent",
  					"&:hover": {
  						backgroundColor: isTaken ? "#8BAF77" : "rgba(0, 0, 0, 0.04)",
  						borderColor: isTaken ? "#8BAF77" : "#333333",
  					},
  					"&:disabled": {
  						backgroundColor: "#9CAF88",
  						borderColor: "#9CAF88",
  						color: "#ffffff",
  					},
  				}}
 			>
 				{isLoading ? "..." : isTaken ? "✓" : "+"}
  			</Button>

  			{/* Revert Confirmation Dialog */}
  			<Dialog
  				open={revertDialogOpen}
  				onClose={handleRevertCancel}
  				maxWidth="sm"
  				fullWidth
  			>
  				<DialogTitle>⚠️ Revert Supplement Log?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>
						Did you mark <strong>{supplement.name}</strong> as taken by mistake? This will remove today's log entry.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleRevertConfirm}
						disabled={isLoading}
						sx={{
							color: "#d32f2f", // Red text color
						}}
					>
						{isLoading ? "Reverting..." : "Yes, Revert"}
					</Button>
					<Button 
						onClick={handleRevertCancel} 
						color="secondary"
						variant="contained"
					>
						Cancel
					</Button>
				</DialogActions>
  			</Dialog>
  		</Box>
  	);
 }