import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { getBrowserTimezone } from "@frontend/utils/timezone.utils";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";

const ComplianceCalendar = () => {
	const theme = useTheme();
	const { user } = useSessionInfo();

	// Generate a simple 7-day calendar view
	const today = new Date();
	const days = [];

	const { data: dailyCompliances } = useQuery(
		orpc.dailyCompliances.getLast7.queryOptions()
	);

	for (let i = 7; i >= 1; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
		const dailyCompliance = dailyCompliances?.find(dc => dc.date === dateString);
		const compliance = dailyCompliance ? Number.parseFloat(dailyCompliance.intakePercentage) : 0;
		days.push({
			date,
			day: date.getDate(),
			dayName: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: user?.timezone || getBrowserTimezone() || 'Etc/UTC' }),
			isToday: false,
			compliance,
		});
	}

	const getComplianceColor = (percentage: number) => {
		// Soft pastel backgrounds with solid colored dots
		if (percentage >= 80) return { bg: '#E8F5E9', dot: '#4CAF50', color: '#2E7D32', label: '80-100%' }; // Pale mint green
		if (percentage >= 50) return { bg: '#FFF9C4', dot: '#FFEB3B', color: '#F57F17', label: '50-79%' }; // Pale yellow
		if (percentage > 0) return { bg: '#FFE0B2', dot: '#FF9800', color: '#E65100', label: '1-49%' }; // Pale orange
		return { bg: '#F5F5F5', dot: '#9E9E9E', color: '#616161', label: '0%' }; // Light grey
	};

  return (
 		<Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
 			{days.map((day) => {
 				const { dot } = getComplianceColor(day.compliance);
 				const dayAbbrev = day.dayName.charAt(0); // Single letter: M, T, W, etc.
 				return (
 					<Box
 						key={day.date.toISOString()}
 						sx={{
 							display: "flex",
 							flexDirection: "column",
 							alignItems: "center",
 							minWidth: 32,
 						}}
 					>
 						{/* Day abbreviation */}
  						<Typography variant="caption" sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary, fontWeight: 500, mb: 0.5 }}>
 							{dayAbbrev}
 						</Typography>
 						{/* Solid colored dot */}
 						<Box
 							sx={{
 								width: 8,
 								height: 8,
 								borderRadius: "50%",
 								backgroundColor: dot,
 								border: day.isToday ? "2px solid #000000" : "none",
 							}}
 						/>
 					</Box>
 				);
 			})}
 		</Box>
 	);
};

export default ComplianceCalendar;