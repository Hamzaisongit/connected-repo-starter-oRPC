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
					<Box sx={{ textAlign: "center", mb: 2 }}>
						<Typography
							variant="h3"
							sx={{
								fontWeight: 700,
								color: "text.primary",
								mb: 2,
								fontSize: { xs: "2rem", md: "2.5rem" },
							}}
						>
							Your Progress 📊
						</Typography>
						<Typography
							variant="body1"
							sx={{
								color: "text.secondary",
								fontSize: "1.1rem",
							}}
						>
							Track your supplement consistency journey
						</Typography>
					</Box>

					{/* Stats Cards */}
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
									borderRadius: 3,
									border: "2px solid",
									borderColor: currentStreakValue > 0 ? "warning.main" : "divider",
									background: currentStreakValue > 0
										? "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)"
										: "background.paper",
								}}
							>
								<CardContent>
									<Box sx={{ fontSize: "3rem", mb: 2 }}>🔥</Box>
									<Typography
										variant="h3"
										sx={{
											fontWeight: 700,
											color: "text.primary",
											mb: 1,
										}}
									>
										{currentStreakValue}
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											fontWeight: 500,
										}}
									>
										Current Streak
									</Typography>
									{currentStreak?.currentStreakShieldsUsed && (
										<Typography
											variant="caption"
											sx={{
												color: "text.secondary",
												mt: 1,
												display: "block",
											}}
										>
											🛡️ {currentStreak.currentStreakShieldsUsed} shields used
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
									p: 3,
									borderRadius: 3,
									border: "2px solid",
									borderColor: longestStreakValue > 0 ? "success.main" : "divider",
									background: longestStreakValue > 0
										? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)"
										: "background.paper",
								}}
							>
								<CardContent>
									<Box sx={{ fontSize: "3rem", mb: 2 }}>🏆</Box>
									<Typography
										variant="h3"
										sx={{
											fontWeight: 700,
											color: "text.primary",
											mb: 1,
										}}
									>
										{longestStreakValue}
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											fontWeight: 500,
										}}
									>
										Longest Streak
									</Typography>
									{longestStreak?.longestStreakShieldsUsed && (
										<Typography
											variant="caption"
											sx={{
												color: "text.secondary",
												mt: 1,
												display: "block",
											}}
										>
											🛡️ {longestStreak.longestStreakShieldsUsed} shields used
										</Typography>
									)}
								</CardContent>
							</Card>
						</Fade>
					</Stack>

					{/* Additional Stats */}
					<Fade in timeout={700}>
						<Stack spacing={2} sx={{ maxWidth: 600, mx: "auto" }}>
							<Card sx={{ p: 3, borderRadius: 3 }}>
								<CardContent sx={{ textAlign: "center" }}>
									<Typography
										variant="h6"
										sx={{
											fontWeight: 600,
											color: "text.primary",
											mb: 2,
										}}
									>
										Consistency Stats
									</Typography>

									<Stack spacing={2}>
										<Box>
											<Typography variant="body1" color="text.secondary">
												Total supplements tracked: Coming soon
											</Typography>
										</Box>
										<Box>
											<Typography variant="body1" color="text.secondary">
												Average compliance: Coming soon
											</Typography>
										</Box>
										<Box>
											<Typography variant="body1" color="text.secondary">
												Days with perfect compliance: Coming soon
											</Typography>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						</Stack>
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