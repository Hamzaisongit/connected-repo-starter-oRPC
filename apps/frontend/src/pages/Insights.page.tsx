import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MedicationIcon from "@mui/icons-material/Medication";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { LinearProgress } from "@mui/material";
import { orpc } from "@frontend/utils/orpc.client";
import { useQuery } from "@tanstack/react-query";

const InsightsPage = () => {
	const { data: insights, isLoading, error } = useQuery(orpc.userStats.getInsights.queryOptions());

	if (isLoading) {
		return <LoadingSpinner text="Loading insights..." />;
	}

	if (error) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading insights: ${error.message}`} />
			</Container>
		);
	}

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
				{insights && (
					<Stack spacing={4}>
						<Typography variant="h4" fontWeight={600}>
							Your Health Insights
						</Typography>

						{insights.overallComplianceRate >= 80 && (
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

						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={3}
						>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<MedicationIcon />}
									title="Active Supplements"
									value={insights.totalSupplements}
									subtitle="Currently tracking"
									color="#3b82f6"
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<CheckCircleIcon />}
									title="Total Supplements Taken"
									value={insights.totalSupplementsTaken}
									subtitle="All time"
									color="#10b981"
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<TrendingUpIcon />}
									title="Overall Compliance"
									value={`${insights.overallComplianceRate}%`}
									subtitle="Across all supplements"
									color="#8b5cf6"
								/>
							</Box>
						</Stack>

						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={3}
						>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<CalendarTodayIcon />}
									title="Current Streak"
									value={insights.userStats?.currentStreak ?? 0}
									subtitle={`Best: ${insights.userStats?.longestStreak ?? 0} days`}
									color="#f59e0b"
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<AccessTimeIcon />}
									title="Weekly Supplements"
									value={insights.weeklySupplementsTaken}
									subtitle="Last 7 days"
									color="#ec4899"
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<StatCard
									icon={<TrendingUpIcon />}
									title="Weekly Average"
									value={`${insights.weeklyAvgCompliance}%`}
									subtitle="Compliance rate"
									color="#06b6d4"
								/>
							</Box>
						</Stack>

						<Typography variant="h5" fontWeight={600}>
							Progress Overview
						</Typography>

						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={3}
						>
							<Box sx={{ flex: 1 }}>
								<ProgressCard
									title="Weekly Progress"
									percentage={insights.weeklyAvgCompliance}
									entries={insights.weeklyCompliance}
									color="#3b82f6"
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<ProgressCard
									title="Monthly Progress"
									percentage={insights.monthlyAvgCompliance}
									entries={insights.monthlyCompliance}
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
											{insights.adherenceBreakdown.takenOnTime}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={
											insights.totalSupplementsTaken > 0
												? (insights.adherenceBreakdown.takenOnTime / insights.totalSupplementsTaken) * 100
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
											{insights.adherenceBreakdown.takenLate}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={
											insights.totalSupplementsTaken > 0
												? (insights.adherenceBreakdown.takenLate / insights.totalSupplementsTaken) * 100
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
											{insights.adherenceBreakdown.missed}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={
											insights.totalSupplementsTaken + insights.adherenceBreakdown.missed > 0
												? (insights.adherenceBreakdown.missed / (insights.totalSupplementsTaken + insights.adherenceBreakdown.missed)) * 100
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
											{insights.adherenceBreakdown.skipped}
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={
											insights.totalSupplementsTaken + insights.adherenceBreakdown.skipped > 0
												? (insights.adherenceBreakdown.skipped / (insights.totalSupplementsTaken + insights.adherenceBreakdown.skipped)) * 100
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
				)}
			</Container>
		</Box>
	);
};

export default InsightsPage;