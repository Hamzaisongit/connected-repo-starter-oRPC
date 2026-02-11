import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import ComplianceCalendar from "@frontend/components/home/ComplianceCalendar";
import DailyProgressBar from "@frontend/components/home/DailyProgressBar";
import Hero from "@frontend/components/home/Hero";
import { SupplementCard } from "@frontend/components/home/SupplementCard";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import { orpc } from "@frontend/utils/orpc.client";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const HomePage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useSessionInfo();
	const theme = useTheme();

	// Get today's plan
	const { data: todaysPlan, isLoading, error } = useQuery(
		orpc.userStacks.getTodaysPlan.queryOptions()
	);

	// Get user stats for streak display
	const { data: userStats } = useQuery(
		orpc.userStats.getMine.queryOptions()
	);

	// Delete mutation for reverting logs
	const deleteMutation = useMutation(orpc.userIntakeLogs.delete.mutationOptions());

  const handleRevert = async (supplementId: string, reminderTime: string) => {
		try {
			// Find the log for this supplement
			const supplement = todaysPlan?.supplements.find(
				s => s.id === supplementId && s.reminderTime === reminderTime
			);

			if (!supplement?.todayIntakeLog?.id) {
				console.error("No log ID found for supplement");
				return;
			}

			await deleteMutation.mutateAsync({
				id: supplement.todayIntakeLog.id,
				logTimezone: supplement.todayIntakeLog.logTimezone,
				scheduledFor: supplement.todayIntakeLog.scheduledFor,
			});

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

	const hasSupplements = todaysPlan && todaysPlan.supplements.length > 0;
	const takenCount = todaysPlan?.takenCount || 0;
	const totalCount = todaysPlan?.totalCount || 0;

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
        <Paper
          sx={{
            p: 3,
            backgroundColor: theme.palette.error.light,
            border: `1px solid ${theme.palette.error.main}`,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              mb: 1
            }}
          >
            ⚠️ Unable to Load Today's Plan
          </Typography>
          <Typography sx={{ color: theme.palette.error.main }}>
            {error.message || 'Something went wrong. Please try refreshing the page.'}
          </Typography>
        </Paper>
      </Container>
    );
  }

	return (
		<Box sx={{
			py: { xs: 2, md: 4 },
			minHeight: "100vh",
			bgcolor: "background.default"
		}}>
			<Container maxWidth="sm">
				
				{/* Profile & Progress Hero */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: { xs: 0, sm: 3 }, mb: 3 }}>
					<Hero 
						userName={user?.name} 
						greeting={getGreeting()} 
						flavorText={getFlavorText()}
					/>
						{hasSupplements && (
							<DailyProgressBar totalCount={totalCount} takenCount={takenCount} />
						)}

						<ComplianceCalendar todaysTakenCount={takenCount} todaysTotalCount={totalCount}/>
				</Box>
	
				{/* Supplements Section */}
				<Box sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: 1 }}>
					{hasSupplements ? (
						<>
							{takenCount !== totalCount && totalCount > 0 && (
								<Box sx={{textAlign: "center"}}>
									<Typography 
										variant="overline" 
										sx={{ 
											color: "text.secondary", 
											fontWeight: 700,
											letterSpacing: 1.2
										}}
									>
										Today's Supplements
									</Typography>
								</Box>
							)}
							{takenCount === totalCount && totalCount > 0 && (
								<Box sx={{ textAlign: "center"}}>
									<Typography variant="h6" color="success.main" fontWeight={700}>
										🎉 All done for today!
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Great job maintaining your streak. See you tomorrow!
									</Typography>
								</Box>
							)}

								<Stack spacing={0.5} divider={<Box sx={{ height: 1, bgcolor: "divider" }} />}>
									{todaysPlan.supplements.map((supplement) => (
										<SupplementCard
											key={`${supplement.id}-${supplement.reminderTime}`}
											supplement={supplement}
											onRevert={handleRevert}
											onCardClick={handleCardClick}
										/>
									))}
								</Stack>
						</>
					) : (
						/* Empty State */
						<Box sx={{ textAlign: "center", py: 8 }}>
							<Typography sx={{ fontSize: "4rem", mb: 2, opacity: 0.5 }}>💊</Typography>
							<Typography variant="h5" sx={{ fontFamily: 'serif', fontWeight: 600, mb: 2 }}>
								Start your stack
							</Typography>
							<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
								Build healthy habits by adding your first supplement
							</Typography>
							
							<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
								<Button
									variant="contained"
									size="large"
									onClick={() => navigate("/user-stack/new")}
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