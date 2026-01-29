import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useSessionInfo } from "@frontend/contexts/UserContext";
import ComplianceCalendar from "@frontend/modules/user-stack/components/ComplianceCalendar";
import { SupplementCard } from "@frontend/modules/user-stack/components/SupplementCard";
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
				<Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
					<Typography variant="h5" sx={{ fontFamily: 'serif', fontWeight: 600, textAlign: "center", mb: 1 }}>
						{getGreeting()}, {user?.name?.split(" ")[0] || "there"}!
						<Typography component="span" sx={{ fontSize: "0.8em" }}>
							👋
						</Typography>
					</Typography>
	
					<Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
						{getFlavorText()}
					</Typography>
	
					{hasSupplements && (
						<Box sx={{ maxWidth: 300, mx: "auto" }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
								<Typography variant="caption" color="text.secondary">Today's Progress</Typography>
								<Typography variant="caption" fontWeight={600} color="text.primary">{takenCount} of {totalCount}</Typography>
							</Box>
							{/* Progress Track */}
							<Box sx={{ width: "100%", height: 8, bgcolor: "action.selected", borderRadius: 4, overflow: "hidden" }}>
								{/* Progress Indicator */}
								<Box sx={{
									width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
									height: "100%",
									bgcolor: "primary.main",
									borderRadius: 4,
									transition: "width 0.3s ease",
								}} />
							</Box>
						</Box>
					)}
				</Card>
	
				{/* Calendar Section */}
				<Card sx={{ p: 2, mb: 3 }}>
					<ComplianceCalendar />
				</Card>
	
				{/* Supplements Section */}
				{hasSupplements ? (
					<>
						{takenCount === totalCount && totalCount > 0 && (
							<Box sx={{ textAlign: "center", py: 2, mb: 2 }}>
								<Typography variant="h6" color="success.main" fontWeight={700}>
									🎉 All done for today!
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Great job maintaining your streak. See you tomorrow!
								</Typography>
							</Box>
						)}
	
						<Card sx={{ p: 0 }}>
							<Stack spacing={0} divider={<Box sx={{ height: 1, bgcolor: "divider" }} />}>
								{todaysPlan.supplements.map((supplement) => (
									<SupplementCard
										key={`${supplement.id}-${supplement.reminderTime}`}
										supplement={supplement}
										onRevert={handleRevert}
										onCardClick={handleCardClick}
									/>
								))}
							</Stack>
						</Card>
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
			</Container>
		</Box>
	);
 };

export default HomePage;