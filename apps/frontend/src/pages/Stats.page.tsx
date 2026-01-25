import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Fade } from "@connected-repo/ui-mui/feedback/Fade";
import { AddIcon } from "@connected-repo/ui-mui/icons/AddIcon";
import { MonetizationOnIcon } from "@connected-repo/ui-mui/icons/MonetizationOnIcon";
import { ShieldIcon } from "@connected-repo/ui-mui/icons/ShieldIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { BuyShieldsDialog } from "@frontend/components/BuyShieldsDialog";
import { RewardsLedgerDialog } from "@frontend/components/RewardsLedgerDialog";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { getBrowserTimezone } from "@frontend/utils/timezone.utils";
import { alpha, useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const StatsPage = () => {
	const { user } = useSessionInfo();
	const theme = useTheme();
	const [rewardsDialogType, setRewardsDialogType] = useState<"coins" | "shields" | null>(null);
	const [buyShieldsDialogOpen, setBuyShieldsDialogOpen] = useState(false);
	
	const { data: currentStreak, isLoading, error } = useQuery(
		orpc.userStats.getCurrentStreak.queryOptions()
	);

	const { data: userStats } = useQuery(
		orpc.userStats.getMine.queryOptions()
	);

	const { data: dailyCompliances } = useQuery(
		orpc.dailyCompliances.getAll.queryOptions()
	);

	const { data: complianceStats } = useQuery(
		orpc.dailyCompliances.getStats.queryOptions()
	);

	const { data: intakeLogs } = useQuery(
		orpc.userIntakeLogs.getAll.queryOptions()
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

	const currentStreakValue = userStats?.currentStreak || 0;
	const longestStreakValue = userStats?.longestStreak || 0;

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
								fontSize: { xs: "1.75rem", md: "2.125rem" },
							}}
						>
							Your Progress
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Track your supplement consistency journey
						</Typography>
					</Box>

					{/* Rewards Section */}
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={{ xs: 2, md: 3 }}
						sx={{ maxWidth: 600, mx: "auto", width: "100%", mb: 2 }}
					>
						{/* Coin Balance */}
						<Box
							onClick={() => {
								setRewardsDialogType("coins");
							}}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								py: 1.5,
								px: 2,
								borderRadius: 1.5,
								backgroundColor: alpha("#FFD700", 0.15),
								cursor: "pointer",
								transition: "all 0.2s ease-in-out",
								flex: 1,
								"&:hover": {
									backgroundColor: alpha("#FFD700", 0.25),
									transform: "translateY(-2px)",
									boxShadow: theme.shadows[2],
								},
							}}
						>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 40,
									height: 40,
									borderRadius: 1.5,
									backgroundColor: alpha("#FFD700", 0.3),
								}}
							>
								<MonetizationOnIcon sx={{ color: "#FFD700", fontSize: "1.5rem" }} />
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography
									variant="caption"
									sx={{
										color: theme.palette.text.secondary,
										fontSize: "0.75rem",
										display: "block",
										mb: 0.25,
									}}
								>
									Coin Balance
								</Typography>
								<Typography
									variant="body2"
									sx={{
										color: theme.palette.text.primary,
										fontWeight: 600,
										fontSize: "1.1rem",
									}}
								>
									{userStats?.coinsBalance.toLocaleString() ?? 0} coins
								</Typography>
							</Box>
						</Box>

						{/* Shield Balance with Buy Button Inside */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								py: 1.5,
								px: 2,
								borderRadius: 1.5,
								backgroundColor: alpha(theme.palette.primary.main, 0.15),
								transition: "all 0.2s ease-in-out",
								flex: 1,
							}}
						>
							<Box
								onClick={() => {
									setRewardsDialogType("shields");
								}}
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 2,
									cursor: "pointer",
									flex: 1,
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: 40,
										height: 40,
										borderRadius: 1.5,
										backgroundColor: alpha(theme.palette.primary.main, 0.3),
									}}
								>
									<ShieldIcon sx={{ color: theme.palette.primary.main, fontSize: "1.5rem" }} />
								</Box>
								<Box sx={{ flex: 1 }}>
									<Typography
										variant="caption"
										sx={{
											color: theme.palette.text.secondary,
											fontSize: "0.75rem",
											display: "block",
											mb: 0.25,
										}}
									>
										Shield Balance
									</Typography>
									<Typography
										variant="body2"
										sx={{
											color: theme.palette.text.primary,
											fontWeight: 600,
											fontSize: "1.1rem",
										}}
									>
										{userStats?.shieldsBalance.toLocaleString() ?? 5} shields
									</Typography>
								</Box>
							</Box>

							{/* Beautiful Buy Button */}
							<Box
								onClick={(e) => {
									e.stopPropagation();
									setBuyShieldsDialogOpen(true);
								}}
								sx={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 0.5,
									px: 1.75,
									py: 0.625,
									borderRadius: 3,
									border: `1.5px solid ${theme.palette.primary.main}`,
									backgroundColor: alpha(theme.palette.primary.main, 0.08),
									cursor: "pointer",
									transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
									minWidth: 70,
									"&:hover": {
										backgroundColor: alpha(theme.palette.primary.main, 0.2),
										borderColor: theme.palette.primary.light,
										transform: "translateY(-1px) scale(1.02)",
										boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
										"& .buy-icon": {
											transform: "rotate(90deg)",
										},
									},
									"&:active": {
										transform: "translateY(0) scale(0.98)",
										backgroundColor: alpha(theme.palette.primary.main, 0.15),
									},
								}}
							>
								<AddIcon
									className="buy-icon"
									sx={{
										fontSize: "0.95rem",
										color: theme.palette.primary.main,
										transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
									}}
								/>
								<Typography
									variant="button"
									sx={{
										fontSize: "0.75rem",
										fontWeight: 600,
										color: theme.palette.primary.main,
										letterSpacing: "0.03em",
										textTransform: "uppercase",
									}}
								>
									Buy
								</Typography>
							</Box>
						</Box>
					</Stack>
	
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
	
									{userStats?.longestStreakShieldsUsed && (
										<Box sx={{ position: "absolute", top: 16, right: 16 }}>
												<Chip 
												label={`🛡️ ${userStats.longestStreakShieldsUsed}`}
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
											{intakeLogs?.filter(log =>
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
											{complianceStats?.averageIntake || "0"}%
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
									const percentage = Number.parseFloat(compliance.intakePercentage);
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
											title={`${new Date(compliance.date).toLocaleDateString('en-US', { timeZone: user?.timezone || getBrowserTimezone() || 'Etc/UTC' })}: ${percentage}% compliance`}
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

			{/* Rewards Ledger Dialog */}
			{rewardsDialogType 
				? <RewardsLedgerDialog
						open={rewardsDialogType !== null}
						onClose={() => setRewardsDialogType(null)}
						itemType={rewardsDialogType}
					/>
				: null
			}

			{/* Buy Shields Dialog */}
			<BuyShieldsDialog
				open={buyShieldsDialogOpen}
				onClose={() => setBuyShieldsDialogOpen(false)}
			/>
		</Container>
	);
};

export default StatsPage;