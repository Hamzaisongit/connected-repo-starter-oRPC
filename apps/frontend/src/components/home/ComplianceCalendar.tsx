import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { dayJsTz, getBrowserTimezone } from "@frontend/utils/timezone.utils";
import { CircularProgress } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";

interface ComplianceCalendarProps {
	todaysTakenCount: number;
	todaysTotalCount: number;
}

const ComplianceCalendar = ({todaysTakenCount, todaysTotalCount}: ComplianceCalendarProps) => {
	const theme = useTheme();
	const { user } = useSessionInfo();

	// User's current timezone and start of today
	const userTimezone = user?.timezone || getBrowserTimezone() || "Etc/UTC";
	const userToday = dayJsTz(userTimezone).startOf("day");

	const { data: dailyCompliances, isLoading } = useQuery(
		orpc.dailyCompliances.getLast7.queryOptions()
	);

	const sortedDailyCompliances = [...(dailyCompliances || [])].sort((a, b) => dayJsTz(userTimezone, a.date).valueOf() - dayJsTz(userTimezone, b.date).valueOf());

	// 1. Map existing server data (excluding today)
	let mappedDays = (sortedDailyCompliances || [])
		.filter((dc) => !dayJsTz(userTimezone, dc.date).isSame(userToday, "day"))
		.map((dc) => {
			const date = dayJsTz(userTimezone, dc.date);
			return {
				date: date.toDate(),
				dayNum: date.date(),
				dayName: date.format("ddd"),
				isToday: false,
				compliance: Number.parseFloat(dc.intakePercentage),
			};
		})

	// 2. Add padding days if less than 6 days available
	while (mappedDays.length < 6) {
		const firstDayDate = mappedDays.length > 0 ? dayJsTz(userTimezone, mappedDays[0]?.date) : userToday;
		const paddingDate = firstDayDate.subtract(1, "day");
		mappedDays.unshift({
			date: paddingDate.toDate(),
			dayNum: paddingDate.date(),
			dayName: paddingDate.format("ddd"),
			isToday: false,
			compliance: 0,
		});
	}

	// 3. Ensure we only show the last 6 past days
	const days = mappedDays.slice(0, 6)
	days.push({
		date: userToday.toDate(),
		dayNum: userToday.date(),
		dayName: userToday.format("ddd"),
		isToday: true,
		compliance: (todaysTakenCount / todaysTotalCount) * 100,
	});

	const getComplianceColor = (percentage: number) => {
		if (percentage >= 80) return theme.palette.success.main;
		if (percentage >= 50) return theme.palette.warning.main;
		if (percentage > 0) return theme.palette.error.main;
		return theme.palette.divider;
	};

  if(isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
 		<Box sx={{ 
			display: "flex", 
			gap: 1, 
			justifyContent: "space-between", 
			alignItems: "center", 
			backgroundColor: "background.paper", 
			p: 2.5, 
			borderRadius: "32px",
			width: "100%",
			boxSizing: "border-box"
		}}>
 			{days.map((day) => {
 				const complianceColor = getComplianceColor(day.compliance);
 				return (
 					<Box
 						key={day.date.toISOString()}
 						sx={{
 							display: "flex",
 							flexDirection: "column",
 							alignItems: "center",
 							gap: 1,
 						}}
 					>
 						{/* Weekday Name */}
  						<Typography 
							variant="caption" 
							sx={{ 
								fontSize: "0.75rem", 
								color: theme.palette.text.secondary, 
								fontWeight: day.isToday ? 700 : 500,
							}}
						>
 							{day.dayName}
 						</Typography>

 						{/* Circular Progress with Date */}
						<Box sx={{ position: "relative", display: "inline-flex" }}>
							<CircularProgress
								variant="determinate"
								value={100}
								size={40}
								thickness={4}
								sx={{
									color: alpha(theme.palette.divider, 0.1),
								}}
							/>
							<CircularProgress
								variant="determinate"
								value={day.compliance}
								size={40}
								thickness={4}
								sx={{
									color: complianceColor,
									position: "absolute",
									left: 0,
									[`& .MuiCircularProgress-circle`]: {
										strokeLinecap: "round",
									},
								}}
							/>
							<Box
								sx={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									position: "absolute",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography
									variant="caption"
									component="div"
									sx={{ 
										fontSize: "0.80rem", 
										fontWeight: 700, 
										color: theme.palette.text.primary 
									}}
								>
									{day.dayNum}
								</Typography>
							</Box>
						</Box>
 					</Box>
 				);
 			})}
 		</Box>
 	);
};

export default ComplianceCalendar;