import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { alpha, Divider, Grid, Tooltip, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// --- Custom Components for Data Viz ---

const CustomBarChart = ({ data, color }: { data: number[]; color: string }) => {
	const maxVal = Math.max(...data, 100);
	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 0.5, pt: 2, width: '100%' }}>
			{data.map((value, index) => (
				<Tooltip key={index} title={`${value}%`} placement="top">
					<Box
						sx={{
							flex: 1,
							bgcolor: alpha(color, 0.1),
							borderRadius: 1,
							position: 'relative',
							height: '100%',
							transition: 'all 0.3s',
							'&:hover': { bgcolor: alpha(color, 0.2) }
						}}
					>
						<Box
							sx={{
								position: 'absolute',
								bottom: 0,
								left: 0,
								right: 0,
								height: `${(value / maxVal) * 100}%`,
								bgcolor: color,
								borderRadius: 1,
							}}
						/>
					</Box>
				</Tooltip>
			))}
		</Box>
	);
};

const SimpleDonutChart = ({
	data,
	size = 140
}: {
	data: { value: number; color: string; label: string }[];
	size?: number;
}) => {
	const total = data.reduce((acc, curr) => acc + curr.value, 0);
	let currentAngle = 0;
	const radius = 40;
	const circumference = 2 * Math.PI * radius;

	return (
		<Box sx={{ position: 'relative', width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: 'rotate(-90deg)' }}>
				{data.map((item, index) => {
					if (item.value === 0) return null;
					const strokeDashoffset = circumference - ((item.value / total) * circumference);
					const angle = currentAngle;
					currentAngle += (item.value / total) * 360;

					return (
						<circle
							key={index}
							cx="50"
							cy="50"
							r={radius}
							fill="transparent"
							stroke={item.color}
							strokeWidth="16"
							strokeDasharray={circumference}
							strokeDashoffset={strokeDashoffset}
							style={{
								transformOrigin: 'center',
								transform: `rotate(${angle * (Math.PI / 180) * (100/360)}deg)`,
								transition: 'all 1s ease-out'
							}}
						/>
					);
				})}
			</svg>
			<Box sx={{ position: 'absolute', textAlign: 'center' }}>
				<Typography variant="h5" fontWeight={700}>
					{total}
				</Typography>
				<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
					DOSES
				</Typography>
			</Box>
		</Box>
	);
};

// --- New Component: Single Consolidated Stat Card ---
const StatItem = ({ label, value, subLabel, color }: { label: string, value: string | number, subLabel?: string, color?: string }) => (
	<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
		 <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>
			{label}
		</Typography>
		<Typography variant="h4" fontWeight={800} sx={{ color: color || 'text.primary', my: 0.5 }}>
			{value}
		</Typography>
		{subLabel && (
			 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
				{subLabel}
				</Typography>
		)}
	</Box>
);

const InsightsPage = () => {
	const theme = useTheme();

	const { data: insights, isLoading, error } = useQuery(
		orpc.userStats.getInsights.queryOptions({
			input: { userTimezoneOffset: new Date().getTimezoneOffset() }
		})
	);

	if (isLoading) {
		return <LoadingSpinner text="Loading insights..." />;
	}

	if (error) {
		return <ErrorAlert message={`Error loading insights: ${error.message}`} />;
	}

	if (!insights) {
		return <ErrorAlert message="No insights data available" />;
	}

	const weeklyComplianceValues = insights.weeklyCompliance.map(dc => Number(dc.adherencePercentage) || 0);
	const monthlyComplianceValues = insights.monthlyCompliance.map(dc => Number(dc.adherencePercentage) || 0);

	const breakdownData = [
		{ label: 'On Time', value: insights.adherenceBreakdown.takenOnTime, color: '#10b981', icon: <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} /> },
		{ label: 'Late', value: insights.adherenceBreakdown.takenLate, color: '#f59e0b', icon: <AccessTimeIcon fontSize="small" sx={{ color: '#f59e0b' }} /> },
		{ label: 'Missed', value: insights.adherenceBreakdown.missed, color: '#ef4444', icon: <CancelIcon fontSize="small" sx={{ color: '#ef4444' }} /> },
		{ label: 'Skipped', value: insights.adherenceBreakdown.skipped, color: '#6b7280', icon: <SkipNextIcon fontSize="small" sx={{ color: '#6b7280' }} /> },
	];

	return (
		<Box sx={{ minHeight: "100vh", py: 3 }}>
			<Container maxWidth="md" disableGutters sx={{ px: 2 }}>
				<Stack spacing={3} sx={{ width: '100%' }}>

					{/* Header */}
					<Box>
						<Typography variant="h5" fontWeight={800}>
							Health Insights
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Your performance overview
						</Typography>
					</Box>

					{/* Alert */}
					<Alert
						icon={<CheckCircleIcon fontSize="inherit" />}
						severity="success"
						sx={{
							width: '100%',
							borderRadius: 3,
							bgcolor: theme => alpha(theme.palette.success.light,0.2),
							color: theme => theme.palette.success.dark,
							border: '1px solid',
							borderColor: alpha('#10b981', 0.2)
						}}
					>
						<Typography variant="subtitle2" fontWeight={700}>
							Excellent! {insights.overallComplianceRate}% Adherence
						</Typography>
					</Alert>

					{/* CONSOLIDATED SUMMARY CARD */}
					<Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
						<Grid container spacing={3} alignItems="center">
							<Grid xs={6} sm={3}>
								<StatItem label="Active Stack" value={insights.totalSupplements} subLabel="Daily items" />
							</Grid>
							<Grid xs={6} sm={3}>
								<StatItem label="Streak" value={insights.userStats?.currentStreak ?? 0} subLabel={`Best: ${insights.userStats?.longestStreak ?? 0}`} color="#f59e0b" />
							</Grid>

							{/* Force break on mobile, separate on desktop if needed, or just let Grid wrap */}
							<Grid xs={12} sx={{ display: { xs: 'block', sm: 'none' }, my: -1 }}><Divider /></Grid>

							<Grid xs={6} sm={3}>
								<StatItem label="Total Doses" value={insights.totalSupplementsTaken} subLabel="Lifetime" color="#3b82f6" />
							</Grid>
							<Grid xs={6} sm={3}>
								<StatItem label="Overall Score" value={`${insights.overallComplianceRate}%`} subLabel="Consistency" color="#8b5cf6" />
							</Grid>
						</Grid>
					</Card>

					{/* Weekly Chart */}
					<Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6" fontWeight={700}>Weekly Trend</Typography>
							<Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2, color: '#3b82f6', fontWeight: 700, fontSize: '0.75rem' }}>
								Avg: {insights.weeklyAvgCompliance}%
							</Box>
						</Box>
						<CustomBarChart data={weeklyComplianceValues} color="#3b82f6" />
						 <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
							{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
								<Typography key={i} variant="caption" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>{d}</Typography>
							))}
						</Box>
					</Card>

					{/* Breakdown Donut & List */}
					<Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
						<Typography variant="h6" fontWeight={700} gutterBottom>Adherence Split</Typography>

						<Grid container spacing={4} alignItems="center">
							<Grid xs={5} sx={{ display: 'flex', justifyContent: 'center' }}>
								<SimpleDonutChart data={breakdownData} />
							</Grid>
							<Grid xs={7}>
								<Stack spacing={2}>
									{breakdownData.map((item, idx) => (
										<Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<Box sx={{ p: 0.5, borderRadius: 1, bgcolor: alpha(item.color, 0.1), display: 'flex', color: item.color }}>
													{item.icon}
												</Box>
												<Typography variant="caption" fontWeight={600} color="text.secondary">
													{item.label}
												</Typography>
											</Box>
											<Typography variant="body2" fontWeight={700}>
												{item.value}
											</Typography>
										</Box>
									))}
								</Stack>
							</Grid>
						</Grid>
					</Card>

					{/* Monthly Chart */}
					<Card sx={{ p: 3, borderRadius: 4, width: '100%', boxShadow: '0px 2px 12px rgba(0,0,0,0.04)' }}>
						 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6" fontWeight={700}>Monthly View</Typography>
								<Typography variant="caption" color="text.secondary">Last 30 days</Typography>
						</Box>
						<CustomBarChart data={monthlyComplianceValues} color="#8b5cf6" />
					</Card>

				</Stack>
			</Container>
		</Box>
	);
};

export default InsightsPage;
