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
		<Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 }, pb: { xs: 10, md: 5 } }}>
			<Fade in timeout={400}>
				<Stack spacing={{ xs: 2, md: 4 }}>
					{/* Header */}
					<Box sx={{ mb: { xs: 1, md: 2 }, textAlign: "center" }}>
						<Typography
							variant="h4"
							component="h1"
							sx={{
								fontFamily: '"Playfair Display", Georgia, serif',
								fontSize: { xs: "1.5rem", md: "1.75rem" },
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
						spacing={{ xs: 2, md: 3 }}
						sx={{ maxWidth: 800, mx: "auto", width: "100%" }}
					>
						{/* Current Streak */}
						<Fade in timeout={500}>
							<Card
								sx={{
									flex: 1,
									textAlign: "center",
									p: { xs: 2.5, md: 4 },
									borderRadius: "32px",
									border: "1px solid",
									borderColor: currentStreakValue > 0 ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 152, 0, 0.08)",
									background: currentStreakValue > 0
										? "linear-gradient(135deg, rgba(255, 243, 224, 0.95) 0%, rgba(255, 236, 209, 0.95) 100%)"
										: "linear-gradient(135deg, rgba(255, 248, 240, 0.6) 0%, rgba(255, 250, 245, 0.6) 100%)",
									backdropFilter: "blur(20px)",
									WebkitBackdropFilter: "blur(20px)",
									boxShadow: currentStreakValue > 0 
										? "0 8px 32px rgba(255, 152, 0, 0.12), 0 2px 8px rgba(255, 152, 0, 0.08)" 
										: "0 4px 20px rgba(0, 0, 0, 0.06)",
									position: "relative",
									transition: "all 0.3s ease-in-out",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: currentStreakValue > 0
											? "0 12px 40px rgba(255, 152, 0, 0.18), 0 4px 12px rgba(255, 152, 0, 0.12)"
											: "0 8px 28px rgba(0, 0, 0, 0.1)",
									},
								}}
							>
								<CardContent>
									{/* Status Badge */}
									<Box
										sx={{
											position: "absolute",
											top: 16,
											left: 16,
											px: 2,
											py: 0.75,
											borderRadius: "100px",
											backgroundColor: currentStreakValue > 0 
												? "rgba(255, 152, 0, 0.15)" 
												: "rgba(100, 116, 139, 0.1)",
											border: "1px solid",
											borderColor: currentStreakValue > 0 
												? "rgba(255, 152, 0, 0.3)" 
												: "rgba(100, 116, 139, 0.2)",
										}}
									>
										<Typography
											sx={{
												fontSize: "0.7rem",
												fontWeight: 700,
												color: currentStreakValue > 0 ? "#E65100" : "#64748B",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											{currentStreakValue > 0 ? "🔥 Active" : "Start Today"}
										</Typography>
									</Box>

									{/* Shields Pill */}
									{currentStreak?.currentStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 16, right: 16 }}>
											<Box
												sx={{
													px: 2,
													py: 0.75,
													borderRadius: "100px",
													backgroundColor: "rgba(79, 111, 82, 0.9)",
													border: "1px solid rgba(255, 255, 255, 0.2)",
													color: "white",
													fontSize: "0.7rem",
													fontWeight: 700,
												}}
											>
												🛡️ {currentStreak.currentStreakShieldsUsed}
											</Box>
										</Box>
									)}

									<Box 
										sx={{ 
											fontSize: { xs: currentStreakValue > 0 ? "3rem" : "2.5rem", md: currentStreakValue > 0 ? "3.5rem" : "3rem" },
											mb: { xs: 1, md: 1.5 }, 
											mt: { xs: 2, md: 2.5 },
											transition: "all 0.3s ease-in-out",
											filter: currentStreakValue > 0 
												? "drop-shadow(0 4px 12px rgba(255, 152, 0, 0.3))" 
												: "none",
										}}
									>
										🔥
									</Box>

									<Typography
										variant="h2"
										sx={{
											fontFamily: '"Playfair Display", Georgia, serif',
											fontWeight: 700,
											color: currentStreakValue > 0 ? "#E65100" : "text.primary",
											mb: 0.5,
											fontSize: { xs: "2.5rem", md: "3rem" },
											lineHeight: 1.1,
											transition: "color 0.3s ease-in-out",
										}}
									>
										{currentStreakValue}
									</Typography>

									<Typography
										variant="body1"
										sx={{
											color: currentStreakValue > 0 ? "#F57C00" : "text.secondary",
											fontWeight: 600,
											fontSize: { xs: "1rem", md: "1.1rem" },
											mb: 0.5,
											transition: "color 0.3s ease-in-out",
										}}
									>
										Current Streak
									</Typography>

									{/* Motivational Subtitle */}
									{currentStreakValue === 0 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#64748B",
												fontStyle: "italic",
												fontWeight: 400,
											}}
										>
											Begin your wellness journey
										</Typography>
									) : currentStreakValue >= 7 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#F57C00",
												fontWeight: 600,
											}}
										>
											🌟 Outstanding consistency!
										</Typography>
									) : currentStreakValue >= 3 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#F57C00",
												fontWeight: 600,
											}}
										>
											💪 Building momentum!
										</Typography>
									) : (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#F57C00",
												fontWeight: 600,
											}}
										>
											🌱 Great start!
										</Typography>
									)}
								</CardContent>
							</Card>
						</Fade>

						{/* Longest Streak */}
						<Fade in timeout={600}>
							<Card
								sx={{
									flex: 1,
									textAlign: "center",
									p: { xs: 2.5, md: 4 },
									borderRadius: "32px",
									border: "1px solid",
									borderColor: longestStreakValue > 0 ? "rgba(79, 111, 82, 0.3)" : "rgba(79, 111, 82, 0.08)",
									background: longestStreakValue > 0
										? "linear-gradient(135deg, rgba(237, 247, 237, 0.95) 0%, rgba(232, 245, 233, 0.95) 100%)"
										: "linear-gradient(135deg, rgba(245, 250, 245, 0.6) 0%, rgba(248, 252, 248, 0.6) 100%)",
									backdropFilter: "blur(20px)",
									WebkitBackdropFilter: "blur(20px)",
									boxShadow: longestStreakValue > 0 
										? "0 8px 32px rgba(79, 111, 82, 0.12), 0 2px 8px rgba(79, 111, 82, 0.08)" 
										: "0 4px 20px rgba(0, 0, 0, 0.06)",
									position: "relative",
									transition: "all 0.3s ease-in-out",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: longestStreakValue > 0
											? "0 12px 40px rgba(79, 111, 82, 0.18), 0 4px 12px rgba(79, 111, 82, 0.12)"
											: "0 8px 28px rgba(0, 0, 0, 0.1)",
									},
								}}
							>
								<CardContent>
									{/* Status Badge */}
									<Box
										sx={{
											position: "absolute",
											top: 16,
											left: 16,
											px: 2,
											py: 0.75,
											borderRadius: "100px",
											backgroundColor: longestStreakValue > 0 
												? "rgba(79, 111, 82, 0.15)" 
												: "rgba(100, 116, 139, 0.1)",
											border: "1px solid",
											borderColor: longestStreakValue > 0 
												? "rgba(79, 111, 82, 0.3)" 
												: "rgba(100, 116, 139, 0.2)",
										}}
									>
										<Typography
											sx={{
												fontSize: "0.7rem",
												fontWeight: 700,
												color: longestStreakValue > 0 ? "#2E7D32" : "#64748B",
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}
										>
											{longestStreakValue > 0 ? "🏆 Record" : "No Record Yet"}
										</Typography>
									</Box>

									{/* Shields Pill */}
									{longestStreak?.longestStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 16, right: 16 }}>
											<Box
												sx={{
													px: 2,
													py: 0.75,
													borderRadius: "100px",
													backgroundColor: "rgba(79, 111, 82, 0.9)",
													border: "1px solid rgba(255, 255, 255, 0.2)",
													color: "white",
													fontSize: "0.7rem",
													fontWeight: 700,
												}}
											>
												🛡️ {longestStreak.longestStreakShieldsUsed}
											</Box>
										</Box>
									)}

									<Box 
										sx={{ 
											fontSize: { xs: longestStreakValue > 0 ? "3rem" : "2.5rem", md: longestStreakValue > 0 ? "3.5rem" : "3rem" },
											mb: { xs: 1, md: 1.5 }, 
											mt: { xs: 2, md: 2.5 },
											transition: "all 0.3s ease-in-out",
											filter: longestStreakValue > 0 
												? "drop-shadow(0 4px 12px rgba(255, 215, 0, 0.4))" 
												: "none",
										}}
									>
										🏆
									</Box>

									<Typography
										variant="h2"
										sx={{
											fontFamily: '"Playfair Display", Georgia, serif',
											fontWeight: 700,
											color: longestStreakValue > 0 ? "#2E7D32" : "text.primary",
											mb: 0.5,
											fontSize: { xs: "2.5rem", md: "3rem" },
											lineHeight: 1.1,
											transition: "color 0.3s ease-in-out",
										}}
									>
										{longestStreakValue}
									</Typography>

									<Typography
										variant="body1"
										sx={{
											color: longestStreakValue > 0 ? "#388E3C" : "text.secondary",
											fontWeight: 600,
											fontSize: { xs: "1rem", md: "1.1rem" },
											mb: 0.5,
											transition: "color 0.3s ease-in-out",
										}}
									>
										Longest Streak
									</Typography>

									{/* Motivational Subtitle */}
									{longestStreakValue === 0 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#64748B",
												fontStyle: "italic",
												fontWeight: 400,
											}}
										>
											Your first milestone awaits
										</Typography>
									) : longestStreakValue >= 30 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#388E3C",
												fontWeight: 600,
											}}
										>
											👑 Legendary achievement!
										</Typography>
									) : longestStreakValue >= 14 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#388E3C",
												fontWeight: 600,
											}}
										>
											⭐ Impressive dedication!
										</Typography>
									) : longestStreakValue >= 7 ? (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#388E3C",
												fontWeight: 600,
											}}
										>
											🎯 One week strong!
										</Typography>
									) : (
										<Typography
											sx={{
												fontSize: { xs: "0.75rem", md: "0.85rem" },
												color: "#388E3C",
												fontWeight: 600,
											}}
										>
											💚 Keep it going!
										</Typography>
									)}
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