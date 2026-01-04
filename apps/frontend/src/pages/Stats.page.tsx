import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
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
		<Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
			<Fade in timeout={400}>
				<Stack spacing={4}>
					{/* Header */}
					<Box sx={{ mb: 3, textAlign: "center" }}>
						<Typography
							variant="h4"
							component="h1"
							sx={{
								fontFamily: '"Playfair Display", Georgia, serif',
								fontSize: "1.75rem",
								fontWeight: 700,
								color: "#1A1C2E",
								mb: 0.5,
							}}
						>
							Your Progress
						</Typography>
						<Typography
							sx={{
								fontSize: "0.875rem",
								color: "#64748B",
								lineHeight: 1.5,
							}}
						>
							Track your supplement consistency journey
						</Typography>
					</Box>

					{/* Momentum Cards */}
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={3}
						sx={{ maxWidth: 800, mx: "auto" }}
					>
						{/* Current Streak */}
						<Fade in timeout={500}>
							<Card
								sx={{
									flex: 1,
									textAlign: "center",
									p: 3,
									borderRadius: 1,
									border: "1px solid",
									borderColor: currentStreakValue > 0 ? "warning.main" : "divider",
									background: currentStreakValue > 0
										? "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.15) 100%)"
										: "rgba(255, 255, 255, 0.05)",
									backdropFilter: "blur(10px)",
									boxShadow: currentStreakValue > 0 ? "0 8px 32px rgba(255, 165, 0, 0.1)" : "none",
									position: "relative",
								}}
							>
								<CardContent>
									{/* Shields Pill */}
									{currentStreak?.currentStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 12, right: 12 }}>
											<Box
												sx={{
													px: 1.5,
													py: 0.5,
													borderRadius: 1,
													backgroundColor: "rgba(0, 0, 0, 0.7)",
													color: "white",
													fontSize: "0.7rem",
													fontWeight: 600,
												}}
											>
												🛡️ {currentStreak.currentStreakShieldsUsed}
											</Box>
										</Box>
									)}
									<Box sx={{ fontSize: "3rem", mb: 2 }}>🔥</Box>
									<Typography
										variant="h2"
										sx={{
											fontWeight: 800,
											color: "text.primary",
											mb: 1,
											fontSize: { xs: "2.5rem", md: "3rem" },
										}}
									>
										{currentStreakValue}
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											fontWeight: 500,
											fontSize: "1rem",
										}}
									>
										Current Streak
									</Typography>
								</CardContent>
							</Card>
						</Fade>

						{/* Longest Streak */}
						<Fade in timeout={600}>
							<Card
								sx={{
									flex: 1,
									textAlign: "center",
									p: 3,
									borderRadius: 1,
									border: "1px solid",
									borderColor: longestStreakValue > 0 ? "success.main" : "divider",
									background: longestStreakValue > 0
										? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)"
										: "rgba(255, 255, 255, 0.05)",
									backdropFilter: "blur(10px)",
									boxShadow: longestStreakValue > 0 ? "0 8px 32px rgba(34, 197, 94, 0.1)" : "none",
									position: "relative",
								}}
							>
								<CardContent>
									{/* Shields Pill */}
									{longestStreak?.longestStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 12, right: 12 }}>
											<Box
												sx={{
													px: 1.5,
													py: 0.5,
													borderRadius: 1,
													backgroundColor: "rgba(0, 0, 0, 0.7)",
													color: "white",
													fontSize: "0.7rem",
													fontWeight: 600,
												}}
											>
												🛡️ {longestStreak.longestStreakShieldsUsed}
											</Box>
										</Box>
									)}
									<Box sx={{ fontSize: "3rem", mb: 2 }}>🏆</Box>
									<Typography
										variant="h2"
										sx={{
											fontWeight: 800,
											color: "text.primary",
											mb: 1,
											fontSize: { xs: "2.5rem", md: "3rem" },
										}}
									>
										{longestStreakValue}
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											fontWeight: 500,
											fontSize: "1rem",
										}}
									>
										Longest Streak
									</Typography>
								</CardContent>
							</Card>
						</Fade>
					</Stack>

					{/* Deep Dive Stats */}
					<Fade in timeout={700}>
						<Box sx={{ maxWidth: 1200, mx: "auto", mt: 8 }}>
							<Typography
								variant="h4"
								component="h2"
								sx={{
									fontFamily: '"Playfair Display", Georgia, serif',
									fontSize: "1.75rem",
									fontWeight: 700,
									color: "#1A1C2E",
									mb: 1,
									textAlign: "center",
								}}
							>
								Deep Dive
							</Typography>
							<Typography
								sx={{
									fontSize: "0.875rem",
									color: "#64748B",
									textAlign: "center",
									mb: 4,
								}}
							>
								Detailed insights into your progress
							</Typography>

							<Stack
								direction={{ xs: "column", md: "row" }}
								spacing={4}
								sx={{ justifyContent: "center", alignItems: "center" }}
							>
								{/* Total Intake */}
								<Card
									sx={{
										flex: 1,
										height: "100%",
										minWidth: 240,
										maxWidth: 320,
										borderRadius: "32px",
										backgroundColor: "rgba(255, 255, 255, 0.5)",
										backdropFilter: "blur(15px)",
										WebkitBackdropFilter: "blur(15px)",
										border: "none",
										boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
										transition: "all 0.3s ease-in-out",
										"&:hover": {
											transform: "translateY(-5px) scale(1.02)",
											boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.15)",
										},
									}}
								>
									<CardContent sx={{ textAlign: "center", p: 4, pt: 5 }}>
										<Typography
											variant="h3"
											sx={{
												fontFamily: '"Playfair Display", Georgia, serif',
												fontWeight: 700,
												color: "#000000",
												fontSize: "2.5rem",
												mb: 1,
												lineHeight: 1.2,
											}}
										>
											{adherenceLogs?.filter(log =>
												log.status === "Taken on-time" || log.status === "Taken late"
											).length || 0}
										</Typography>
										<Typography
											sx={{
												fontSize: "1.1rem",
												fontWeight: 600,
												color: "#333333",
											}}
										>
											Total Intake
										</Typography>
									</CardContent>
								</Card>

								{/* Compliance % */}
								<Card
									sx={{
										flex: 1,
										height: "100%",
										minWidth: 240,
										maxWidth: 320,
										borderRadius: "32px",
										backgroundColor: "rgba(255, 255, 255, 0.5)",
										backdropFilter: "blur(15px)",
										WebkitBackdropFilter: "blur(15px)",
										border: "none",
										boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
										transition: "all 0.3s ease-in-out",
										"&:hover": {
											transform: "translateY(-5px) scale(1.02)",
											boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.15)",
										},
									}}
								>
									<CardContent sx={{ textAlign: "center", p: 4, pt: 5 }}>
										<Box sx={{ mb: 3 }}>
											{/* Enhanced progress circle */}
											<Box
												sx={{
													width: 100,
													height: 100,
													borderRadius: "50%",
													border: "6px solid rgba(74, 222, 128, 0.2)",
													borderTop: "6px solid #4ade80",
													margin: "0 auto",
													animation: "spin 2s linear infinite",
													"@keyframes spin": {
														"0%": { transform: "rotate(0deg)" },
														"100%": { transform: "rotate(360deg)" },
													},
												}}
											/>
										</Box>
										<Typography
											variant="h3"
											sx={{
												fontFamily: '"Playfair Display", Georgia, serif',
												fontWeight: 700,
												color: "#000000",
												fontSize: "2.5rem",
												mb: 1,
												lineHeight: 1.2,
											}}
										>
											{complianceStats?.averageAdherence || "0"}%
										</Typography>
										<Typography
											sx={{
												fontSize: "1.1rem",
												fontWeight: 600,
												color: "#333333",
											}}
										>
											Compliance
										</Typography>
									</CardContent>
								</Card>

								{/* Perfect Days */}
								<Card
									sx={{
										flex: 1,
										height: "100%",
										minWidth: 240,
										maxWidth: 320,
										borderRadius: "32px",
										backgroundColor: "rgba(255, 255, 255, 0.5)",
										backdropFilter: "blur(15px)",
										WebkitBackdropFilter: "blur(15px)",
										border: "none",
										boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1)",
										transition: "all 0.3s ease-in-out",
										"&:hover": {
											transform: "translateY(-5px) scale(1.02)",
											boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.15)",
										},
									}}
								>
									<CardContent sx={{ textAlign: "center", p: 4, pt: 5 }}>
										<Box sx={{ fontSize: "3rem", mb: 3 }}>👑</Box>
										<Typography
											variant="h3"
											sx={{
												fontFamily: '"Playfair Display", Georgia, serif',
												fontWeight: 700,
												color: "#000000",
												fontSize: "2.5rem",
												mb: 1,
												lineHeight: 1.2,
											}}
										>
											{complianceStats?.perfectDays || 0}
										</Typography>
										<Typography
											sx={{
												fontSize: "1.1rem",
												fontWeight: 600,
												color: "#333333",
											}}
										>
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
							<Typography
								variant="h5"
								sx={{
									fontWeight: 600,
									color: "text.primary",
									mb: 3,
									textAlign: "center",
								}}
							>
								Wellness Heatmap
							</Typography>

							{/* Month Selector - Placeholder */}
							<Box sx={{ textAlign: "center", mb: 3 }}>
								<Typography
									variant="h6"
									sx={{
										color: "text.secondary",
										fontFamily: "serif",
									}}
								>
									January 2026
								</Typography>
							</Box>

							{/* Heatmap Grid */}
							<Box
								sx={{
									display: "flex",
									flexWrap: "wrap",
									gap: 0.5,
									justifyContent: "center",
									maxWidth: 800,
									mx: "auto",
								}}
							>
								{dailyCompliances?.slice(0, 100).map((compliance, index) => {
									const percentage = Number.parseFloat(compliance.adherencePercentage);
									let color = "#ebedf0"; // Grey for no data
									if (percentage === 100) color = "#4ade80"; // Sage Green
									else if (percentage > 0) color = "#86efac"; // Soft Mint
									else if (percentage === 0) color = "#fca5a5"; // Muted Salmon

									return (
										<Box
											key={compliance.id}
											sx={{
												width: 12,
												height: 12,
												borderRadius: 1,
												backgroundColor: color,
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
								<Typography
									variant="body1"
									sx={{
										color: "text.secondary",
										fontStyle: "italic",
										fontSize: "1.1rem",
									}}
								>
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