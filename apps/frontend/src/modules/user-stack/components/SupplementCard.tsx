import { Avatar } from "@connected-repo/ui-mui/data-display/Avatar";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";

import type { TodaysPlanSupplement } from "@connected-repo/zod-schemas/user_stack.zod";
import { useState } from "react";

interface SupplementCardProps {
	supplement: TodaysPlanSupplement;
	onLogTaken: (supplementId: string, scheduledTime: string) => Promise<void>;
	isLogging?: boolean;
}

// Status config is now handled directly in the component

export function SupplementCard({ supplement, onLogTaken, isLogging }: SupplementCardProps) {
 	const [isLoading, setIsLoading] = useState(false);

 	const handleLogClick = async () => {
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
		const hour = parseInt(hours || "0", 10);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes || "00"} ${ampm}`;
	};

  const isTaken = supplement.status === "taken";
  const isOverdue = supplement.status === "overdue";

  // Get themed stock icon and background color based on supplement name
  const getStockIconAndColor = (name: string) => {
  	const lowerName = name.toLowerCase();
  	if (lowerName.includes("vitamin d") || lowerName.includes("d3")) {
  		return { icon: "☀️", bgColor: "#FFF8DC" }; // Light yellow for sun
  	}
  	if (lowerName.includes("vitamin c")) {
  		return { icon: "🍊", bgColor: "#FFE4B5" }; // Light orange
  	}
  	if (lowerName.includes("omega") || lowerName.includes("fish")) {
  		return { icon: "🐟", bgColor: "#E0F2FE" }; // Light blue for fish
  	}
  	if (lowerName.includes("protein") || lowerName.includes("collagen")) {
  		return { icon: "🥩", bgColor: "#FFE6E6" }; // Light pink for meat
  	}
  	if (lowerName.includes("magnesium") || lowerName.includes("calcium")) {
  		return { icon: "🪨", bgColor: "#F5F5DC" }; // Light beige for rock
  	}
  	if (lowerName.includes("probiotic")) {
  		return { icon: "🦠", bgColor: "#E8F5E8" }; // Light green
  	}
  	if (lowerName.includes("herb") || lowerName.includes("ashwagandha") || lowerName.includes("ginseng")) {
  		return { icon: "🌿", bgColor: "#F0FFF0" }; // Light mint
  	}
  	if (lowerName.includes("oil") || lowerName.includes("cbd")) {
  		return { icon: "💧", bgColor: "#F0F8FF" }; // Light blue for oil
  	}
  	return { icon: "💊", bgColor: "#F8F9FA" }; // Default light grey
  };

  // Calculate status text and color
  const getStatusInfo = () => {
  	if (isTaken) {
  		return { text: `✅ Taken`, color: "#4CAF50" };
  	}
  	if (isOverdue) {
  		const scheduledTime = new Date(supplement.scheduledTime);
  		const now = new Date();
  		const timeDiff = now.getTime() - scheduledTime.getTime();

  		if (timeDiff < 0) {
  			return { text: `🕒 Due Now`, color: "#666666" };
  		}

  		const minutesOverdue = Math.floor(timeDiff / (1000 * 60));
  		if (minutesOverdue < 60) {
  			return { text: `⚠️ Overdue by ${minutesOverdue} mins`, color: "#FA8072" };
  		}
  		const hoursOverdue = Math.floor(minutesOverdue / 60);
  		return { text: `⚠️ Overdue by ${hoursOverdue}h`, color: "#FA8072" };
  	}

  	const scheduledTime = new Date(supplement.scheduledTime);
  	const now = new Date();
  	const timeDiff = scheduledTime.getTime() - now.getTime();

  	if (timeDiff <= 0) {
  		return { text: `🕒 Due Now`, color: "#666666" };
  	}

  	const minutesLeft = Math.floor(timeDiff / (1000 * 60));
  	if (minutesLeft <= 60) {
  		return { text: `🕒 Due in ${minutesLeft}m`, color: "#666666" };
  	}
  	const hoursLeft = Math.floor(minutesLeft / 60);
  	return { text: `🕒 Due in ${hoursLeft}h`, color: "#666666" };
  };

  const statusInfo = getStatusInfo();
  const stockIconData = getStockIconAndColor(supplement.name);

  return (
 		<Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 3, px: 1 }}>
 			{/* Left: Circular Thumbnail - 40px with themed background */}
 			<Avatar
 				sx={{
 					width: 40,
 					height: 40,
 					backgroundColor: supplement.imageUrl ? "transparent" : stockIconData.bgColor,
 					color: supplement.imageUrl ? "transparent" : "#666666",
 					borderRadius: "50%",
 					border: "1px solid #e0e0e0",
 				}}
 				{...(supplement.imageUrl ? { src: supplement.imageUrl } : {})}
 			>
 				{!supplement.imageUrl && (
 					<span style={{ fontSize: "1.2rem" }}>
 						{stockIconData.icon}
 					</span>
 				)}
 			</Avatar>

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
 				onClick={handleLogClick}
 				disabled={isTaken || isLogging || isLoading}
 				sx={{
 					minWidth: 48,
 					width: 48,
 					height: 48,
 					borderRadius: "50%",
 					border: `2px solid ${isTaken ? "#9CAF88" : "#000000"}`, // Sage green when taken
 					color: isTaken ? "#9CAF88" : "#000000",
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
 		</Box>
 	);
}