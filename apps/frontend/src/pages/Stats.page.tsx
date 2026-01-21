import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip"
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";

const StatsPage = () => {
	const { data: currentStreak, isLoading, error } = useQuery(
		orpc.userStats.getCurrentStreak.queryOptions()
	);

	const { data: longestStreak } = useQuery(
		orpc.userStats.getLongestStreak.queryOptions()
	);

	const { data: dailyCompliances } = useQuery(
		orpc.dailyCompliances.getAll.queryOptions()
	);

	const { data: complianceStats } = useQuery(
		orpc.dailyCompliances.getStats.queryOptions()
	);

	const { data: adherenceLogs } = useQuery(
		orpc.userAdherenceLogs.getAll.queryOptions()
	);

	if (isLoading) {
		return (
			<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<LoadingSpinner text="Loading your stats..." />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography color="error">
					Error loading stats: {error.message}
				</Typography>
			</Container>
		);
	}

	const currentStreakValue = currentStreak?.currentStreak || 0;
	const longestStreakValue = longestStreak?.longestStreak || 0;

	return (
		<Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 }, pb: { xs: 10, md: 5 }, bgcolor: "background.default", minHeight: "100vh" }}>
			<Fade in timeout={400}>
				<Stack spacing={{ xs: 2, md: 4 }}>
					{/* Header */}
					<Box sx={{ mb: { xs: 1, md: 2 }, textAlign: "center" }}>
						<Typography
							variant="h4"
							component="h1"
							sx={{
								fontFamily: 'serif',
								fontWeight: 700,
								color: "text.primary",
								mb: 0.5,
							}}
						>
							Your Progress
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Track your supplement consistency journey
						</Typography>
					</Box>
	
					{/* Momentum Cards */}
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={{ xs: 2, md: 3 }}
						sx={{ maxWidth: 800, mx: "auto", width: "100%" }}
					>
						{/* Current Streak */}
						<Fade in timeout={500}>
							<Card
								sx={theme => ({
									flex: 1,
									textAlign: "center",
									p: { xs: 2, md: 3 },
									position: "relative",
									bgcolor: currentStreakValue > 0 ? alpha(theme.palette.warning.main, 0.15) : "background.paper",
									borderColor: currentStreakValue > 0 ? alpha(theme.palette.warning.main, 0.3) : "divider",
									borderWidth: 1,
									borderStyle: "solid",
								})}
							>
								<CardContent>
									<Box sx={{ position: "absolute", top: 16, left: 16 }}>
										<Chip 
											label={currentStreakValue > 0 ? "🔥 Active" : "Start Today"} 
											size="small"
											color={currentStreakValue > 0 ? "warning" : "default"}
											variant={currentStreakValue > 0 ? "filled" : "outlined"}
											sx={{ fontWeight: 700, fontSize: "0.7rem" }}
										/>
									</Box>
	
									{currentStreak?.currentStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 16, right: 16 }}>
											<Chip 
												label={`🛡️ ${currentStreak.currentStreakShieldsUsed}`}
												size="small"
												sx={{ bgcolor: "success.dark", color: "white", fontWeight: 700, fontSize: "0.7rem" }}
											/>
										</Box>
									)}
	
									<Box sx={{ 
										fontSize: { xs: "3rem", md: "3.5rem" }, 
										mb: 1.5, mt: 2.5,
										opacity: currentStreakValue > 0 ? 1 : 0.5
									}}>
										🔥
									</Box>
	
									<Typography
										variant="h2"
										sx={{
											fontFamily: 'serif',
											fontWeight: 700,
											color: currentStreakValue > 0 ? "warning.dark" : "text.primary",
											mb: 0.5,
											fontSize: { xs: "2.5rem", md: "3rem" },
										}}
									>
										{currentStreakValue}
									</Typography>
	
									<Typography variant="body1" sx={{ color: currentStreakValue > 0 ? "warning.main" : "text.secondary", fontWeight: 600, mb: 0.5 }}>
										Current Streak
									</Typography>
	
									<Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
										{currentStreakValue === 0 ? "Begin your wellness journey" :
										 currentStreakValue >= 7 ? "🌟 Outstanding consistency!" :
										 currentStreakValue >= 3 ? "💪 Building momentum!" :
										 "🌱 Great start!"}
									</Typography>
								</CardContent>
							</Card>
						</Fade>
	
						{/* Longest Streak */}
						<Fade in timeout={600}>
							<Card
								sx={theme => ({
									flex: 1,
									textAlign: "center",
									p: { xs: 2, md: 3 },
									position: "relative",
									bgcolor: longestStreakValue > 0 ? alpha(theme.palette.success.main, 0.08) : "background.paper",
									borderColor: longestStreakValue > 0 ? alpha(theme.palette.success.main, 0.3) : "divider",
									borderWidth: 1,
									borderStyle: "solid",
								})}
							>
								<CardContent>
									<Box sx={{ position: "absolute", top: 16, left: 16 }}>
										<Chip 
											label={longestStreakValue > 0 ? "🏆 Record" : "No Record Yet"} 
											size="small"
											color={longestStreakValue > 0 ? "success" : "default"}
											variant={longestStreakValue > 0 ? "filled" : "outlined"}
											sx={{ fontWeight: 700, fontSize: "0.7rem" }}
										/>
									</Box>
	
									{longestStreak?.longestStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 16, right: 16 }}>
												<Chip 
												label={`🛡️ ${longestStreak.longestStreakShieldsUsed}`}
												size="small"
												sx={{ bgcolor: "success.dark", color: "white", fontWeight: 700, fontSize: "0.7rem" }}
											/>
										</Box>
									)}
	
									<Box sx={{ fontSize: { xs: "3rem", md: "3.5rem" }, mb: 1.5, mt: 2.5 }}>
										🏆
									</Box>
	
									<Typography
										variant="h2"
										sx={{
											fontFamily: 'serif',
											fontWeight: 700,
											color: longestStreakValue > 0 ? "success.dark" : "text.primary",
											mb: 0.5,
											fontSize: { xs: "2.5rem", md: "3rem" },
										}}
									>
										{longestStreakValue}
									</Typography>
	
									<Typography variant="body1" sx={{ color: longestStreakValue > 0 ? "success.main" : "text.secondary", fontWeight: 600, mb: 0.5 }}>
										Longest Streak
									</Typography>
	
									<Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
										{longestStreakValue === 0 ? "Your first milestone awaits" :
										 longestStreakValue >= 30 ? "👑 Legendary achievement!" :
										 longestStreakValue >= 14 ? "⭐ Impressive dedication!" :
										 longestStreakValue >= 7 ? "🎯 One week strong!" :
										 "💚 Keep it going!"}
									</Typography>
								</CardContent>
							</Card>
						</Fade>
					</Stack>
	
					{/* Deep Dive Stats */}
					<Fade in timeout={700}>
						<Box sx={{ maxWidth: 1200, mx: "auto", mt: 8 }}>
							<Typography variant="h4" component="h2" sx={{ fontFamily: 'serif', fontWeight: 700, color: "text.primary", textAlign: "center", mb: 1 }}>
								Deep Dive
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
								Detailed insights into your progress
							</Typography>
	
							<Stack
								direction={{ xs: "column", md: "row" }}
								spacing={4}
								sx={{ justifyContent: "center", alignItems: "center" }}
							>
								{/* Total Intake */}
								<Card sx={{ flex: 1, height: "100%", minWidth: 240, maxWidth: 320, width: "100%" }}>
									<CardContent sx={{ textAlign: "center", p: 4 }}>
										<Typography variant="h3" sx={{ fontFamily: 'serif', fontWeight: 700, color: "text.primary", mb: 1 }}>
											{adherenceLogs?.filter(log =>
												log.status === "Taken on-time" || log.status === "Taken late"
											).length || 0}
										</Typography>
										<Typography variant="body1" color="text.secondary" fontWeight={600}>
											Total Intake
										</Typography>
									</CardContent>
								</Card>
	
								{/* Compliance % */}
								<Card sx={{ flex: 1, height: "100%", minWidth: 240, maxWidth: 320, width: "100%" }}>
									<CardContent sx={{ textAlign: "center", p: 4, pt: 5 }}>
										<Box sx={{ mb: 3 }}>
											<Box
												sx={{
													width: 100,
													height: 100,
													borderRadius: "50%",
													border: (theme) => `6px solid ${alpha(theme.palette.success.main, 0.2)}`,
													borderTop: (theme) => `6px solid ${theme.palette.success.main}`,
													margin: "0 auto",
													animation: "spin 2s linear infinite",
													"@keyframes spin": {
														"0%": { transform: "rotate(0deg)" },
														"100%": { transform: "rotate(360deg)" },
													},
												}}
											/>
										</Box>
										<Typography variant="h3" sx={{ fontFamily: 'serif', fontWeight: 700, color: "text.primary", mb: 1 }}>
											{complianceStats?.averageAdherence || "0"}%
										</Typography>
										<Typography variant="body1" color="text.secondary" fontWeight={600}>
											Compliance
										</Typography>
									</CardContent>
								</Card>
	
								{/* Perfect Days */}
								<Card sx={{ flex: 1, height: "100%", minWidth: 240, maxWidth: 320, width: "100%" }}>
									<CardContent sx={{ textAlign: "center", p: 4 }}>
										<Box sx={{ fontSize: "3rem", mb: 3 }}>👑</Box>
										<Typography variant="h3" sx={{ fontFamily: 'serif', fontWeight: 700, color: "text.primary", mb: 1 }}>
											{complianceStats?.perfectDays || 0}
										</Typography>
										<Typography variant="body1" color="text.secondary" fontWeight={600}>
											Perfect Days
										</Typography>
									</CardContent>
								</Card>
							</Stack>
						</Box>
					</Fade>
	
					{/* Wellness Heatmap */}
					<Fade in timeout={700}>
						<Box sx={{ maxWidth: 1000, mx: "auto", mt: 6 }}>
							<Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 3, textAlign: "center" }}>
								Wellness Heatmap
							</Typography>
	
							<Box sx={{ textAlign: "center", mb: 3 }}>
								<Typography variant="h6" sx={{ color: "text.secondary", fontFamily: "serif" }}>
									January 2026
								</Typography>
							</Box>
	
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center", maxWidth: 800, mx: "auto" }}>
								{dailyCompliances?.slice(0, 100).map((compliance) => {
									const percentage = Number.parseFloat(compliance.adherencePercentage);
									// Theme-aware colors
									let bgcolor = "action.selected"; 
									if (percentage === 100) bgcolor = "success.main";
									else if (percentage > 0) bgcolor = "success.light";
									else if (percentage === 0) bgcolor = "error.light";
	
									return (
										<Box
											key={compliance.id}
											sx={{
												width: 12,
												height: 12,
												borderRadius: 1,
												bgcolor: bgcolor,
												cursor: "pointer",
												transition: "all 0.2s",
												"&:hover": {
													opacity: 0.8,
													transform: "scale(1.2)",
												},
											}}
											title={`${new Date(compliance.date).toLocaleDateString()}: ${percentage}% compliance`}
										/>
									);
								})}
							</Box>
						</Box>
					</Fade>
	
					{/* Motivational Message */}
					{currentStreakValue > 0 && (
						<Fade in timeout={800}>
							<Box sx={{ textAlign: "center", py: 2 }}>
								<Typography variant="body1" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "1.1rem" }}>
									{currentStreakValue >= 7
										? "🔥 You're on fire! Keep up the amazing work!"
										: currentStreakValue >= 3
										? "🚀 Great momentum! You're building healthy habits!"
										: "🌱 Every day counts. You're doing great!"
									}
								</Typography>
							</Box>
						</Fade>
					)}
				</Stack>
			</Fade>
		</Container>
	);
};

export default StatsPage;