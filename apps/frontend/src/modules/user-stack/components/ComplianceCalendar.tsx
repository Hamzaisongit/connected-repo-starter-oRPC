import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@frontend/utils/orpc.client";

const ComplianceCalendar = () => {
	const { data: todaysPlan } = useQuery(orpc.userStacks.getTodaysPlan.queryOptions());

	// Generate a simple 7-day calendar view
	const today = new Date();
	const days = [];

	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		days.push({
			date,
			day: date.getDate(),
			dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
			isToday: i === 0,
			// Mock compliance data - in real app this would come from dailyCompliances endpoint
			compliance: i === 0 ? (todaysPlan?.compliancePercentage || 0) : Math.floor(Math.random() * 100),
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
		<Card
			sx={{
				borderRadius: "32px",
				background: "rgba(255, 255, 255, 0.95)",
				backdropFilter: "blur(10px)",
				WebkitBackdropFilter: "blur(10px)",
				border: "1px solid rgba(255, 255, 255, 0.8)",
				boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
			}}
		>
			<CardContent sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{
						mb: 3,
						fontWeight: 600,
						color: "text.primary",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<span style={{ fontSize: "1.2rem" }}>📅</span>
					Recent Compliance
				</Typography>

				<Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, justifyContent: "space-between" }}>
					{days.map((day) => {
						const { bg, dot, color } = getComplianceColor(day.compliance);
						return (
							<Box
								key={day.date.toISOString()}
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									minWidth: 60,
									p: 2,
									borderRadius: "20px",
									backgroundColor: bg,
									border: day.isToday ? `2px solid ${dot}` : "none",
									transition: "all 0.2s ease-in-out",
									"&:hover": {
										transform: "translateY(-2px)",
										boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
									},
								}}
							>
								<Typography variant="caption" sx={{ fontSize: "0.7rem", color, fontWeight: 600, mb: 0.5 }}>
									{day.dayName}
								</Typography>
								<Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1, mb: 1 }}>
									{day.day}
								</Typography>
								{/* Solid colored dot */}
								<Box
									sx={{
										width: 8,
										height: 8,
										borderRadius: "50%",
										backgroundColor: dot,
										mb: 0.5,
									}}
								/>
								<Typography variant="caption" sx={{ fontSize: "0.65rem", color, fontWeight: 600 }}>
									{day.compliance}%
								</Typography>
							</Box>
						);
					})}
				</Box>

				{/* Legend at the very bottom with smaller, muted text */}
				<Box sx={{ display: "flex", gap: 2.5, mt: 3, pt: 2, borderTop: "1px solid rgba(0, 0, 0, 0.05)", flexWrap: "wrap", justifyContent: "center" }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4CAF50" }} />
						<Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", opacity: 0.7 }}>
							80-100%
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#FFEB3B" }} />
						<Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", opacity: 0.7 }}>
							50-79%
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#FF9800" }} />
						<Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", opacity: 0.7 }}>
							1-49%
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#9E9E9E" }} />
						<Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem", opacity: 0.7 }}>
							0%
						</Typography>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
};

export default ComplianceCalendar;