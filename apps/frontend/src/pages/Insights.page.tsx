import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MedicationIcon from "@mui/icons-material/Medication";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LinearProgress } from "@mui/material";

const InsightsPage = () => {
	const now = Date.now();
	const dayInMs = 24 * 60 * 60 * 1000;

	const weeklyComplianceValues = [92, 88, 95, 90, 85, 97, 93];
	const mockWeeklyCompliance = Array.from({ length: 7 }, (_, i) => ({
		date: now - (6 - i) * dayInMs,
		adherencePercentage: weeklyComplianceValues[i] ?? 90,
		dailyShieldOpeningBalance: 3,
		dailyShieldClosingBalance: 3,
		dailyShieldUsed: false,
	}));

	const monthlyComplianceValues = [75, 80, 85, 70, 72, 88, 90, 92, 85, 78, 82, 87, 90, 88, 86, 89, 92, 94, 88, 85, 83, 87, 90, 88, 85, 82, 89, 91, 88, 86];
	const mockMonthlyCompliance = Array.from({ length: 30 }, (_, i) => ({
		date: now - (29 - i) * dayInMs,
		adherencePercentage: monthlyComplianceValues[i] ?? 80,
		dailyShieldOpeningBalance: 3,
		dailyShieldClosingBalance: 3,
		dailyShieldUsed: false,
	}));

	const mockInsights = {
		userStats: {
			currentStreak: 12,
			longestStreak: 18,
			currentStreakShieldsUsed: 1,
			longestStreakShieldsUsed: 3,
		},
		weeklyCompliance: mockWeeklyCompliance,
		monthlyCompliance: mockMonthlyCompliance,
		weeklyAvgCompliance: 91,
		monthlyAvgCompliance: 86,
		totalSupplements: 5,
		totalSupplementsTaken: 156,
		weeklySupplementsTaken: 35,
		overallComplianceRate: 89,
		adherenceBreakdown: {
			takenOnTime: 124,
			takenLate: 32,
			missed: 8,
			skipped: 12,
		},
	};

	const StatCard = ({
		icon,
		title,
		value,
		subtitle,
		color,
	}: {
		icon: React.ReactNode;
		title: string;
		value: string | number;
		subtitle?: string;
		color: string;
	}) => (
		<Card
			sx={{
				p: 3,
				height: "100%",
				borderRadius: 3,
				transition: "all 0.3s ease-in-out",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 4,
				},
			}}
		>
			<Stack direction="row" spacing={2} alignItems="flex-start">
				<Box
					sx={{
						p: 1.5,
						borderRadius: 2,
						background: `${color}15`,
						color,
					}}
				>
					{icon}
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography variant="body2" color="text.secondary" gutterBottom>
						{title}
					</Typography>
					<Typography variant="h4" fontWeight={600}>
						{value}
					</Typography>
					{subtitle && (
						<Typography variant="body2" color="text.secondary" mt={0.5}>
							{subtitle}
						</Typography>
					)}
				</Box>
			</Stack>
		</Card>
	);

	const ProgressCard = ({
		title,
		percentage,
		entries,
		color,
	}: {
		title: string;
		percentage: number;
		entries: Array<{ date: number; adherencePercentage: string | number }>;
		color: string;
	}) => (
		<Card
			sx={{
				p: 3,
				borderRadius: 3,
			}}
		>
			<Typography variant="h6" fontWeight={600} gutterBottom>
				{title}
			</Typography>
			<Stack spacing={2} mt={2}>
				<Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Average Compliance
						</Typography>
						<Typography variant="body2" fontWeight={600} sx={{ color }}>
							{percentage}%
						</Typography>
					</Box>
					<LinearProgress
						variant="determinate"
						value={percentage}
						sx={{
							height: 10,
							borderRadius: 5,
							backgroundColor: `${color}20`,
							"& .MuiLinearProgress-bar": {
								borderRadius: 5,
								backgroundColor: color,
							},
						}}
					/>
				</Box>
				<Box
					sx={{
						maxHeight: 200,
						overflowY: "auto",
						"&::-webkit-scrollbar": {
							width: 6,
						},
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: `${color}30`,
							borderRadius: 3,
						},
					}}
				>
					<Stack spacing={1}>
						{entries.slice(0, 7).map((entry) => (
							<Box
								key={entry.date}
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									py: 0.5,
									borderBottom: "1px solid",
									borderColor: "divider",
								}}
							>
								<Typography variant="body2" color="text.secondary">
									{new Date(entry.date).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})}
								</Typography>
								<Typography
									variant="body2"
									fontWeight={600}
									sx={{
										color: Number(entry.adherencePercentage) >= 80
											? "success.main"
											: Number(entry.adherencePercentage) >= 60
												? "warning.main"
												: "error.main",
									}}
								>
									{Number(entry.adherencePercentage)}%
								</Typography>
							</Box>
						))}
					</Stack>
				</Box>
			</Stack>
		</Card>
	);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "background.default",
				py: { xs: 3, md: 4 },
			}}
		>
			<Container maxWidth="lg">
				<Stack spacing={4}>
					<Typography variant="h4" fontWeight={600}>
						Your Health Insights
					</Typography>

					{mockInsights.overallComplianceRate >= 80 && (
						<Alert
							severity="success"
							sx={{
								borderRadius: 2,
								boxShadow: 1,
							}}
						>
							<Typography variant="body1" fontWeight={500}>
								Great job! You're maintaining excellent compliance.
							</Typography>
						</Alert>
					)}

					<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<MedicationIcon />}
								title="Active Supplements"
								value={mockInsights.totalSupplements}
								subtitle="Currently tracking"
								color="#3b82f6"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<CheckCircleIcon />}
								title="Total Supplements Taken"
								value={mockInsights.totalSupplementsTaken}
								subtitle="All time"
								color="#10b981"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<TrendingUpIcon />}
								title="Overall Compliance"
								value={`${mockInsights.overallComplianceRate}%`}
								subtitle="Across all supplements"
								color="#8b5cf6"
							/>
						</Box>
					</Stack>

					<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<CalendarTodayIcon />}
								title="Current Streak"
								value={mockInsights.userStats?.currentStreak ?? 0}
								subtitle={`Best: ${mockInsights.userStats?.longestStreak ?? 0} days`}
								color="#f59e0b"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<AccessTimeIcon />}
								title="Weekly Supplements"
								value={mockInsights.weeklySupplementsTaken}
								subtitle="Last 7 days"
								color="#ec4899"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<StatCard
								icon={<TrendingUpIcon />}
								title="Weekly Average"
								value={`${mockInsights.weeklyAvgCompliance}%`}
								subtitle="Compliance rate"
								color="#06b6d4"
							/>
						</Box>
					</Stack>

					<Typography variant="h5" fontWeight={600}>
						Progress Overview
					</Typography>

					<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
						<Box sx={{ flex: 1 }}>
							<ProgressCard
								title="Weekly Progress"
								percentage={mockInsights.weeklyAvgCompliance}
								entries={mockInsights.weeklyCompliance}
								color="#3b82f6"
							/>
						</Box>
						<Box sx={{ flex: 1 }}>
							<ProgressCard
								title="Monthly Progress"
								percentage={mockInsights.monthlyAvgCompliance}
								entries={mockInsights.monthlyCompliance}
								color="#8b5cf6"
							/>
						</Box>
					</Stack>

					<Typography variant="h5" fontWeight={600}>
						Adherence Breakdown
					</Typography>

					<Card
						sx={{
							p: 3,
							borderRadius: 3,
						}}
					>
						<Stack spacing={2}>
							<Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: 1,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<CheckCircleIcon sx={{ color: "#10b981" }} />
										<Typography variant="body2">Taken On-Time</Typography>
									</Box>
									<Typography variant="body2" fontWeight={600}>
										{mockInsights.adherenceBreakdown.takenOnTime}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										mockInsights.totalSupplementsTaken > 0
											? (mockInsights.adherenceBreakdown.takenOnTime / mockInsights.totalSupplementsTaken) * 100
											: 0
									}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "#10b98120",
										"& .MuiLinearProgress-bar": {
											borderRadius: 4,
											backgroundColor: "#10b981",
										},
									}}
								/>
							</Box>

							<Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: 1,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<AccessTimeIcon sx={{ color: "#f59e0b" }} />
										<Typography variant="body2">Taken Late</Typography>
									</Box>
									<Typography variant="body2" fontWeight={600}>
										{mockInsights.adherenceBreakdown.takenLate}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										mockInsights.totalSupplementsTaken > 0
											? (mockInsights.adherenceBreakdown.takenLate / mockInsights.totalSupplementsTaken) * 100
											: 0
									}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "#f59e0b20",
										"& .MuiLinearProgress-bar": {
											borderRadius: 4,
											backgroundColor: "#f59e0b",
										},
									}}
								/>
							</Box>

							<Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: 1,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<CancelIcon sx={{ color: "#ef4444" }} />
										<Typography variant="body2">Missed</Typography>
									</Box>
									<Typography variant="body2" fontWeight={600}>
										{mockInsights.adherenceBreakdown.missed}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										mockInsights.totalSupplementsTaken + mockInsights.adherenceBreakdown.missed > 0
											? (mockInsights.adherenceBreakdown.missed / (mockInsights.totalSupplementsTaken + mockInsights.adherenceBreakdown.missed)) * 100
											: 0
									}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "#ef444420",
										"& .MuiLinearProgress-bar": {
											borderRadius: 4,
											backgroundColor: "#ef4444",
										},
									}}
								/>
							</Box>

							<Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mb: 1,
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
										<SkipNextIcon sx={{ color: "#6b7280" }} />
										<Typography variant="body2">Skipped</Typography>
									</Box>
									<Typography variant="body2" fontWeight={600}>
										{mockInsights.adherenceBreakdown.skipped}
									</Typography>
								</Box>
								<LinearProgress
									variant="determinate"
									value={
										mockInsights.totalSupplementsTaken + mockInsights.adherenceBreakdown.skipped > 0
											? (mockInsights.adherenceBreakdown.skipped / (mockInsights.totalSupplementsTaken + mockInsights.adherenceBreakdown.skipped)) * 100
											: 0
									}
									sx={{
										height: 8,
										borderRadius: 4,
										backgroundColor: "#6b728020",
										"& .MuiLinearProgress-bar": {
											borderRadius: 4,
											backgroundColor: "#6b7280",
										},
									}}
								/>
							</Box>
						</Stack>
					</Card>
				</Stack>
			</Container>
		</Box>
	);
};

export default InsightsPage;