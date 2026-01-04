import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { DailyProgressCard } from "@frontend/components/home/DailyProgressCard";
import { StreakCard } from "@frontend/components/home/StreakCard";
import { SupplementActionDialog } from "@frontend/components/home/SupplementActionDialog";
import { SupplementScheduleList } from "@frontend/components/home/SupplementScheduleList";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

const HomePage = () => {
	const [selectedSupplement, setSelectedSupplement] = useState<{
		id: string;
		name: string;
		dosage: string;
		instructions: string[];
		scheduledTime: number;
	} | null>(null);

	const { data: schedule, isLoading: scheduleLoading, error: scheduleError } = useQuery(
		orpc.supplements.getDailySchedule.queryOptions({
			input: {
				userTimezoneOffset: new Date().getTimezoneOffset()
			}
		}),
	);

	const { data: dailyProgress, isLoading: progressLoading, error: progressError } = useQuery(
		orpc.supplements.getDailyProgress.queryOptions({
			input: {
				userTimezoneOffset: new Date().getTimezoneOffset()
			}
		}),
	);

	const { data: userStats, isLoading: streakLoading, error: streakError } = useQuery(
		orpc.userStats.getUserStats.queryOptions(),
	);

	const recordMutation = useMutation({
		...orpc.supplements.recordAdherence.mutationOptions(),
		onSuccess: () => {
			console.log("[Home] Mutation successful, invalidating queries");
			setSelectedSupplement(null);
			queryClient.invalidateQueries({
				predicate: (query) => {
					const key = query.queryKey;
					return Array.isArray(key) && key[0] === 'supplements';
				},
				refetchType: 'all',
			});
		},
	});

	const handleCloseDialog = () => {
		setSelectedSupplement(null);
	};

	const handleTaken = () => {
		if (!selectedSupplement) return;
		console.log("[Home] Recording as Taken:", selectedSupplement.name, "scheduledTime:", selectedSupplement.scheduledTime);
		recordMutation.mutate({
			supplementId: selectedSupplement.id,
			scheduledFor: selectedSupplement.scheduledTime,
			status: "Taken on-time",
			reason: null,
		});
	};

	const handleSkip = () => {
		if (!selectedSupplement) return;
		console.log("[Home] Recording as Skipped:", selectedSupplement.name, "scheduledTime:", selectedSupplement.scheduledTime);
		recordMutation.mutate({
			supplementId: selectedSupplement.id,
			scheduledFor: selectedSupplement.scheduledTime,
			status: "Skipped",
			reason: null,
		});
	};

	const handleSupplementClick = (supplementId: string, scheduledTime: number) => {
		if (!schedule) return;
		const supplement = schedule.find(
			(item) => item.supplement.id === supplementId && item.scheduledTime === scheduledTime,
		);
		if (supplement) {
			console.log("[Home] Selected supplement:", supplement.supplement.name, "status:", supplement.status);
			setSelectedSupplement({
				id: supplement.supplement.id,
				name: supplement.supplement.name,
				dosage: `${supplement.supplement.dosage} ${supplement.supplement.unit}`,
				instructions: supplement.supplement.instructions,
				scheduledTime: supplement.scheduledTime,
			});
		}
	};

	if (scheduleLoading || progressLoading || streakLoading) {
		return <LoadingSpinner text="Loading today's schedule..." />;
	}

	if (scheduleError) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading schedule: ${scheduleError.message}`} />
			</Container>
		);
	}

	if (progressError) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading progress: ${progressError.message}`} />
			</Container>
		);
	}

	if (streakError) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading streak: ${streakError.message}`} />
			</Container>
		);
	}

	return (
		<Container maxWidth="lg">
			<Stack spacing={4}>
				<Typography variant="h4" fontWeight={600}>
					Today's Schedule
				</Typography>

				<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
					<Box sx={{ flex: 2 }}>
						{dailyProgress && (
							<DailyProgressCard
								totalScheduled={dailyProgress.totalScheduled}
								takenOnTime={dailyProgress.takenOnTime}
								takenLate={dailyProgress.takenLate}
								missed={dailyProgress.missed}
								skipped={dailyProgress.skipped}
								completionPercentage={dailyProgress.completionPercentage}
							/>
						)}
					</Box>
					<Box sx={{ flex: 1 }}>
						{userStats && (
							<StreakCard
								currentStreak={userStats.currentStreak}
								bestStreak={userStats.longestStreak}
							/>
						)}
					</Box>
				</Stack>

				<Typography variant="h5" fontWeight={600}>
					Supplement Schedule
				</Typography>

				{schedule && (
					<SupplementScheduleList
						schedule={schedule}
						onSupplementClick={handleSupplementClick}
					/>
				)}

				{selectedSupplement && (
					<SupplementActionDialog
						open={!!selectedSupplement}
						onClose={handleCloseDialog}
						onTaken={handleTaken}
						onSkip={handleSkip}
						supplementName={selectedSupplement.name}
						supplementDosage={selectedSupplement.dosage}
						supplementInstructions={selectedSupplement.instructions}
					/>
				)}
			</Stack>
		</Container>
	);
};

export default HomePage;
