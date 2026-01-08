import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import ComplianceCalendar from "@frontend/modules/user-stack/components/ComplianceCalendar";
import { SupplementCard } from "@frontend/modules/user-stack/components/SupplementCard";
import { orpc } from "@frontend/utils/orpc.client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const HomePage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useSessionInfo();

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
			scheduledDate.setHours(parseInt(hours || "0", 10), parseInt(minutes || "0", 10), 0, 0);

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

	// Delete mutation for reverting logs
	const deleteMutation = useMutation(orpc.userAdherenceLogs.delete.mutationOptions());

	const handleRevert = async (supplementId: string, scheduledTime: string) => {
		try {
			// Find the log for this supplement
			const supplement = todaysPlan?.supplements.find(
				s => s.id === supplementId && s.scheduledTime === scheduledTime
			);

			if (!supplement?.logId) {
				console.error("No log ID found for supplement");
				return;
			}

			// Delete the adherence log
			await deleteMutation.mutateAsync({ id: supplement.logId });

			// Invalidate queries to refresh the data
			queryClient.invalidateQueries({ queryKey: orpc.userStacks.getTodaysPlan.queryKey() });
			queryClient.invalidateQueries({ queryKey: orpc.userStats.getMine.queryKey() });
		} catch (error) {
			console.error("Failed to revert adherence:", error);
		}
	};

	const handleCardClick = (supplementId: string) => {
		navigate(`/user-stack/${supplementId}`);
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

	const getFlavorText = () => {
		const streak = getCurrentStreak();
		const compliance = todaysPlan?.compliancePercentage || 0;
		const userName = user?.name || "there";

		if (compliance === 100 && totalCount > 0) {
			return "Perfect day so far! Keep it up! ⭐";
		}
		if (compliance >= 80) {
			return `Your ${streak}-day streak is looking strong today! 🔥`;
		}
		if (compliance >= 50) {
			return "You're making great progress today! 💪";
		}
		return `Almost there, ${userName}! Let's get those supplements in. 🌱`;
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
  		<Box
  			sx={{
  				py: { xs: 2, md: 3 },
  				background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
  			}}
  		>
  			<Container
  				maxWidth="lg"
  			>
  				<Box sx={{ width: "100%", maxWidth: "100%", m: "auto"}}>
						{/* Profile & Progress Hero Box */}
						<Paper
							sx={{
								borderRadius: "32px",
								backgroundColor: "rgba(255, 255, 255, 0.85)",
								backdropFilter: "blur(10px)",
								WebkitBackdropFilter: "blur(10px)",
								boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
								p: 3,
								mb: 2,
								maxWidth: 600,
								mx: "auto",
								width: "100%",
							}}
						>
							{/* Personalized Greeting */}
							<Typography
								variant="h5"
								sx={{
									fontFamily: '"Playfair Display", Georgia, serif',
									fontWeight: 600,
									color: "#000000",
									mb: 1,
									lineHeight: 1.3,
									textAlign: "center",
								}}
							>
								{getGreeting()}, {user?.name?.split(" ")[0] || "there"}!{" "}
								<span style={{ fontSize: "0.8em" }}>👋</span>
							</Typography>

							{/* Dynamic Flavor Text */}
							<Typography
								variant="body1"
								sx={{
									color: "#666666",
									fontSize: "1rem",
									fontWeight: 500,
									mb: 3,
									textAlign: "center",
								}}
							>
								{getFlavorText()}
							</Typography>

							{/* Today's Progress Bar */}
							{hasSupplements && (
								<Box sx={{ maxWidth: 300, mx: "auto" }}>
									<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
										<Typography variant="caption" sx={{ color: "#666666", fontSize: "0.8rem" }}>
											Today's Progress
										</Typography>
										<Typography variant="caption" sx={{ color: "#000000", fontWeight: 600, fontSize: "0.8rem" }}>
											{takenCount} of {totalCount}
										</Typography>
									</Box>
									<Box sx={{
										width: "100%",
										height: 8,
										backgroundColor: "#f0f0f0",
										borderRadius: 4,
										overflow: "hidden",
									}}>
										<Box sx={{
											width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
											height: "100%",
											background: "linear-gradient(90deg, #87CEEB 0%, #20B2AA 100%)", // Soft blue to teal
											borderRadius: 4,
											transition: "width 0.3s ease",
										}} />
									</Box>
								</Box>
							)}
						</Paper>

						{/* Mini-Calendar Compact Box */}
						<Paper
							sx={{
								borderRadius: "24px",
								backgroundColor: "#F8FAFC",
								boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.04)",
								p: 2,
								mb: 3,
								maxWidth: 600,
								mx: "auto",
								width: "100%",
							}}
						>
							<ComplianceCalendar />
						</Paper>

  					{/* Today's Supplements */}
  					{hasSupplements ? (
  						<>
  							{/* Completion Message - Show above supplements when all done */}
							{takenCount === totalCount && totalCount > 0 && (
								<Box sx={{ textAlign: "center", py: 3, mb: 2, maxWidth: 600, mx: "auto" }}>
 									<Typography
 										variant="h6"
 										sx={{
 											color: "#4F6F52",
 											fontWeight: 700,
 											fontSize: "1.2rem",
 										}}
 									>
 										🎉 All done for today!
 									</Typography>
 									<Typography variant="body2" sx={{ color: "#666666", fontSize: "0.9rem" }}>
 										Great job maintaining your streak. See you tomorrow!
 									</Typography>
 								</Box>
 							)}

  							{/* Supplements List - High-density journal style */}
							<Paper
								sx={{
									borderRadius: "32px",
									backgroundColor: "#FFFFFF",
									boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
									p: 1,
									maxWidth: 600,
									mx: "auto",
									width: "100%",
								}}
							>
 								<Stack spacing={0} divider={<Box sx={{ height: 1, backgroundColor: "#F0F0F0" }} />}>
 									{todaysPlan.supplements.map((supplement) => (
										<SupplementCard
											key={`${supplement.id}-${supplement.scheduledTime}`}
											supplement={supplement}
											onLogTaken={handleLogTaken}
											onRevert={handleRevert}
											onCardClick={handleCardClick}
											isLogging={logMutation.isPending}
										/>
 									))}
 								</Stack>
 							</Paper>
  						</>
  					) : (
 						/* Empty State - Simplified */
 						<Box sx={{ textAlign: "center", py: 8, maxWidth: 400, mx: "auto", width: "100%" }}>
 							<Box sx={{ fontSize: "4rem", mb: 3, opacity: 0.6 }}>
 								💊
 							</Box>
 							<Typography
 								variant="h5"
 								sx={{
 									fontFamily: '"Playfair Display", Georgia, serif',
 									fontWeight: 600,
 									color: "#000000",
 									mb: 2,
 								}}
 							>
 								Start your stack
 							</Typography>
 							<Typography
 								variant="body1"
 								sx={{
 									color: "#666666",
 									mb: 4,
 									lineHeight: 1.6,
 								}}
 							>
 								Build healthy habits by adding your first supplement
 							</Typography>
 							<motion.div
 								whileHover={{ y: -2 }}
 								whileTap={{ scale: 0.95 }}
 							>
 								<Button
 									variant="contained"
 									size="large"
 									onClick={() => navigate("/user-stack/new")}
 									sx={{
 										px: 4,
 										height: "48px",
 										fontSize: "1rem",
 										fontWeight: 600,
 										borderRadius: "24px",
 										background: "linear-gradient(135deg, #1A1C2E 0%, #2D3154 100%)",
 										color: "#ffffff",
 										boxShadow: "0px 4px 16px rgba(26, 28, 46, 0.3)",
 										"&:hover": {
 											background: "linear-gradient(135deg, #2D3047 0%, #3D4166 100%)",
 											boxShadow: "0px 6px 24px rgba(26, 28, 46, 0.4)",
 										},
 									}}
 								>
 									Add Supplement
 								</Button>
 							</motion.div>
 						</Box>
 					)}
  			</Box>
  			</Container>
  		</Box>
 	);
 };

export default HomePage;