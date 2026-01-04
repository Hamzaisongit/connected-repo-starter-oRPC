import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import ComplianceCalendar from "@frontend/modules/user-stack/components/ComplianceCalendar";
import { SupplementCard } from "@frontend/modules/user-stack/components/SupplementCard";
import { orpc } from "@frontend/utils/orpc.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const HomePage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	// Get today's plan
	const { data: todaysPlan, isLoading, error } = useQuery(
		orpc.userStacks.getTodaysPlan.queryOptions()
	);

	// Get user stats for streak display
	const { data: userStats } = useQuery(
		orpc.userStats.getMine.queryOptions()
	);

	// Quick log mutation
	const logMutation = useMutation(orpc.userAdherenceLogs.create.mutationOptions());

	const handleLogTaken = async (supplementId: string, scheduledTime: string) => {
		try {
			// Convert scheduled time to today's date timestamp
			const today = new Date();
			const [hours, minutes] = scheduledTime.split(":");
			const scheduledDate = new Date(today);
			scheduledDate.setHours(parseInt(hours || "0"), parseInt(minutes || "0"), 0, 0);

			await logMutation.mutateAsync({
				supplementId,
				scheduledFor: Math.floor(scheduledDate.getTime()),
				status: "Taken on-time",
				actualAt: Math.floor(Date.now()),
				timeZoneOffset: new Date().getTimezoneOffset(),
			});

			// Invalidate queries to refresh the data
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getTodaysPlan.queryKey() });
			queryClient.invalidateQueries({ queryKey: orpc.userStats.getMine.queryKey() });
		} catch (error) {
			console.error("Failed to log adherence:", error);
			console.error("Failed to log. Please try again.");
		}
	};

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	const getCurrentStreak = () => {
		return userStats?.currentStreak || 0;
	};

	if (isLoading) {
		return (
			<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
				<LoadingSpinner text="Loading today's plan..." />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography color="error">
					Error loading today's plan: {error.message}
				</Typography>
			</Container>
		);
	}

	const hasSupplements = todaysPlan && todaysPlan.supplements.length > 0;
	const takenCount = todaysPlan?.takenCount || 0;
	const totalCount = todaysPlan?.totalCount || 0;

	return (
		<Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
			<Stack spacing={4}>
				{/* Header Section */}
				<Box sx={{ textAlign: "center", mb: 2, backgroundColor: "#FFFFFF", p: 3, border: "3px solid #000000", borderRadius: "24px" }}>
						<Typography
							variant="h3"
							sx={{
								fontFamily: '"Playfair Display", Georgia, serif',
								fontWeight: 700,
								color: "#000000 !important",
								mb: 1,
								fontSize: { xs: "2.5rem", md: "3rem" },
								lineHeight: 1.3,
								textShadow: "0px 2px 4px rgba(0,0,0,0.1)",
							}}
						>
							{getGreeting()}!{" "}
							<span style={{ fontSize: "0.7em" }}>👋</span>
						</Typography>
						<Typography
							variant="h6"
							sx={{
								color: "#333333 !important",
								fontWeight: 500,
								fontSize: "1.2rem",
								mb: 3,
							}}
						>
							Here's your supplement plan for today
						</Typography>

						{/* Streak Display - Pill-shaped Chip */}
						<Box sx={{ display: "inline-flex", mb: 3 }}>
							<Chip
								icon={<span style={{ fontSize: "1.2rem" }}>🔥</span>}
								label={`${getCurrentStreak()} Day Streak`}
								sx={{
									background: "linear-gradient(135deg, #FFB347 0%, #FF6B35 100%)",
									color: "#ffffff",
									fontWeight: 600,
									fontSize: "0.95rem",
									px: 2,
									py: 2.5,
									height: "auto",
									borderRadius: "100px",
									boxShadow: "0px 4px 12px rgba(255, 107, 53, 0.25)",
									"& .MuiChip-icon": {
										color: "#ffffff",
										marginLeft: "8px",
									},
									"& .MuiChip-label": {
										px: 1,
									},
								}}
							/>
						</Box>

						{/* Recent Compliance Calendar */}
						<Box sx={{ mb: 4 }}>
							<ComplianceCalendar />
						</Box>
					</Box>

					{/* Today's Supplements */}
					{hasSupplements ? (
						<>
							{/* Progress Summary */}
							<Box sx={{ textAlign: "center", mb: 2, backgroundColor: "#FFFFFF", p: 2, borderRadius: "16px" }}>
								<Typography
									variant="body1"
									sx={{
										color: "#000000 !important",
										fontSize: "1.2rem",
										fontWeight: 600,
									}}
								>
									{takenCount} of {totalCount} supplements logged today
									{todaysPlan?.compliancePercentage !== undefined && (
										<span style={{ marginLeft: 8, fontWeight: 700, color: "#000000" }}>
											({todaysPlan.compliancePercentage}% complete)
										</span>
									)}
								</Typography>
							</Box>

							{/* Supplements Grid */}
							<Box sx={{ 
								maxWidth: 800, 
								mx: "auto",
								backgroundColor: "rgba(255, 255, 255, 0.5)",
								p: 3,
								borderRadius: "24px",
							}}>
								<Stack spacing={3}>
									{todaysPlan.supplements.map((supplement, index) => (
										<Box key={`${supplement.id}-${supplement.scheduledTime}`}>
											<SupplementCard
												supplement={supplement}
												onLogTaken={handleLogTaken}
												isLogging={logMutation.isPending}
											/>
										</Box>
									))}
								</Stack>
							</Box>

							{/* Completion Message */}
							{takenCount === totalCount && totalCount > 0 && (
								<Box sx={{ textAlign: "center", py: 4, backgroundColor: "#FFFFFF", borderRadius: "24px" }}>
									<Typography
										variant="h6"
										sx={{
											color: "#4F6F52 !important",
											fontWeight: 700,
											mb: 1,
											fontSize: "1.4rem",
										}}
									>
										🎉 All done for today!
									</Typography>
									<Typography variant="body2" sx={{ color: "#333333 !important", fontSize: "1rem" }}>
										Great job maintaining your streak. See you tomorrow!
									</Typography>
								</Box>
							)}
						</>
					) : (
						/* Empty State - Phase 4 Refined */
						<Box
							sx={{
								textAlign: "center",
								py: 6,
								maxWidth: 500,
								mx: "auto",
							}}
						>
								{/* 3D Pill Icon - Reduced size by 30% and opacity 0.5 */}
								<Box
									sx={{
										fontSize: "3.5rem", // Reduced from 5rem (30% smaller)
										mb: 4,
										opacity: 0.5,
										filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))",
									}}
								>
									💊
								</Box>

								{/* CTA Card - More subtle background */}
								<Box
									sx={{
										background: "rgba(240, 249, 255, 0.95)", // More subtle light blue with better opacity
										backdropFilter: "blur(10px)",
										WebkitBackdropFilter: "blur(10px)",
										borderRadius: "32px",
										p: 4,
										boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
										border: "1px solid rgba(255, 255, 255, 0.8)",
									}}
								>
									<Typography
										variant="h5"
										sx={{
											fontFamily: '"Playfair Display", Georgia, serif', // Serif font for brand consistency
											fontWeight: 600,
											color: "primary.main",
											mb: 2,
										}}
									>
										Start your stack
									</Typography>
									<Typography
										variant="body1"
										sx={{
											color: "text.secondary",
											mb: 3,
											lineHeight: 1.6,
										}}
									>
										Build healthy habits by adding your first supplement
									</Typography>
									<Button
										variant="contained"
										size="large"
										onClick={() => navigate("/user-stack/new")}
										sx={{
											px: 4,
											height: "56px", // Exact 56px height for "One-Thumb" action
											fontSize: "1rem",
											fontWeight: 600,
											borderRadius: "100px", // Pill-shaped button
											background: "#1A1C2E", // Deep navy
											color: "#ffffff",
											boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
											transition: "all 0.3s ease-in-out",
											"&:hover": {
												background: "#2D3047",
												transform: "translateY(-2px)",
												boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
											},
										}}
									>
										Add Supplement
									</Button>
								</Box>
							</Box>
					)}

					{/* Quick Actions */}
					{hasSupplements && (
						<Box sx={{ textAlign: "center", pt: 2 }}>
								<Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
									<Button
										variant="outlined"
										onClick={() => navigate("/user-stack")}
										sx={{
											minWidth: 200,
											fontWeight: 500,
											borderRadius: "32px",
											minHeight: "44px",
										}}
									>
										Manage Supplements
									</Button>
									<Button
										variant="outlined"
										onClick={() => navigate("/stats")}
										sx={{
											minWidth: 200,
											fontWeight: 500,
											borderRadius: "32px",
											minHeight: "44px",
										}}
									>
										View Stats
									</Button>
								</Stack>
							</Box>
					)}
				</Stack>
		</Container>
	);
};

export default HomePage;