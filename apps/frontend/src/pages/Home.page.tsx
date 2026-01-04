import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { CircularProgress } from "@connected-repo/ui-mui/feedback/CircularProgress";
import { Dialog, DialogActions, DialogContent } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { AccessTime } from "@connected-repo/ui-mui/icons/AccessTimeIcon";
import { Cancel } from "@connected-repo/ui-mui/icons/CancelIcon";
import { CheckCircle } from "@connected-repo/ui-mui/icons/CheckCircleIcon";
import { LocalFireDepartment } from "@connected-repo/ui-mui/icons/LocalFireDepartmentIcon";
import { Warning } from "@connected-repo/ui-mui/icons/WarningIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import type { SupplementSchedule } from "@connected-repo/zod-schemas/user_adherence_log.zod";
import { orpc } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MedicationLiquidIcon from "@mui/icons-material/MedicationLiquid";
import { IconButton } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
			userTimezoneOffset: new Date().getTimezoneOffset()
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
			userTimezoneOffset: new Date().getTimezoneOffset()
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

	const completed = dailyProgress?.takenOnTime ? dailyProgress.takenOnTime + (dailyProgress.takenLate || 0) : 0;
	const totalScheduled = dailyProgress?.totalScheduled || 0;
	const remaining = totalScheduled - completed - (dailyProgress?.missed || 0) - (dailyProgress?.skipped || 0);

	const getStatusColor = (status: string): "success" | "error" | "default" | "info" => {
		switch (status) {
			case "taken":
				return "success";
			case "missed":
				return "error";
			case "skipped":
				return "default";
			case "pending":
				return "info";
			default:
				return "default";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "taken":
				return <CheckCircle fontSize="small" />;
			case "missed":
				return <Warning fontSize="small" />;
			case "skipped":
				return <Cancel fontSize="small" />;
			case "pending":
				return <AccessTime fontSize="small" />;
			default:
				return <AccessTime fontSize="small" />;
		}
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return format(date, "h:mm a");
	};

	return (
		<Container maxWidth="lg">
			<Stack spacing={4}>
				<Typography variant="h4" fontWeight={600}>
					Today's Schedule
				</Typography>

				<Stack direction={{ xs: "column", md: "row" }} spacing={3}>
					<Box sx={{ flex: 2 }}>
						{dailyProgress && (
							<Card
								sx={{
									p: { xs: 2, md: 3 },
									background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
									color: "white",
									borderRadius: 2,
									boxShadow: "0 4px 20px rgba(0, 123, 255, 0.3)",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<Stack
									direction={{ xs: "column", md: "row" }}
									spacing={3}
									alignItems="center"
								>
									<Box
										sx={{
											position: "relative",
											display: "inline-flex",
										}}
									>
										<CircularProgress
											variant="determinate"
											value={dailyProgress.completionPercentage}
											size={100}
											sx={{
												color: "white",
												".MuiCircularProgress-circle": {
													strokeLinecap: "round",
												},
											}}
											thickness={5}
										/>
										<Box
											sx={{
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
												position: "absolute",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Typography variant="h4" fontWeight={700}>
												{Math.round(dailyProgress.completionPercentage)}%
											</Typography>
										</Box>
									</Box>

									<Box sx={{ flex: 1, width: "100%" }}>
										<Typography
											variant="h5"
											fontWeight={600}
											gutterBottom
											sx={{ mb: 2 }}
										>
											Today's Progress
										</Typography>
										<Stack direction="row" spacing={3} flexWrap="wrap">
											<Box>
												<Typography variant="body2" sx={{ opacity: 0.9 }}>
													Completed
												</Typography>
												<Typography variant="h6" fontWeight={600}>
													{completed}/{totalScheduled}
												</Typography>
											</Box>
											<Box>
												<Typography variant="body2" sx={{ opacity: 0.9 }}>
													On Time
												</Typography>
												<Typography variant="h6" fontWeight={600}>
													{dailyProgress.takenOnTime}
												</Typography>
											</Box>
											<Box>
												<Typography variant="body2" sx={{ opacity: 0.9 }}>
													Late
												</Typography>
												<Typography variant="h6" fontWeight={600}>
													{dailyProgress.takenLate}
												</Typography>
											</Box>
											{dailyProgress.missed > 0 && (
												<Box>
													<Typography variant="body2" sx={{ opacity: 0.9 }}>
														Missed
													</Typography>
													<Typography variant="h6" fontWeight={600}>
														{dailyProgress.missed}
													</Typography>
												</Box>
											)}
											{dailyProgress.skipped > 0 && (
												<Box>
													<Typography variant="body2" sx={{ opacity: 0.9 }}>
														Skipped
													</Typography>
													<Typography variant="h6" fontWeight={600}>
														{dailyProgress.skipped}
													</Typography>
												</Box>
											)}
											{remaining > 0 && (
												<Box>
													<Typography variant="body2" sx={{ opacity: 0.9 }}>
														Remaining
													</Typography>
													<Typography variant="h6" fontWeight={600}>
														{remaining}
													</Typography>
												</Box>
											)}
										</Stack>
									</Box>
								</Stack>
							</Card>
						)}
					</Box>
					<Box sx={{ flex: 1 }}>
						{userStats && (
							<Card
								sx={{
									p: { xs: 2, md: 3 },
									background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
									color: "white",
									borderRadius: 2,
									boxShadow: "0 4px 20px rgba(238, 90, 36, 0.3)",
									position: "relative",
									overflow: "hidden",
								}}
							>
								<Box
									sx={{
										position: "absolute",
										right: -20,
										top: -20,
										opacity: 0.1,
									}}
								>
									<LocalFireDepartment sx={{ fontSize: 120 }} />
								</Box>

								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<Box
										sx={{
											background: "rgba(255, 255, 255, 0.2)",
											borderRadius: "50%",
											p: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											backdropFilter: "blur(10px)",
										}}
									>
										<LocalFireDepartment sx={{ fontSize: 40 }} />
									</Box>

									<Box>
										<Typography variant="h6" fontWeight={600} gutterBottom>
											Current Streak
										</Typography>
										<Typography variant="h3" fontWeight={700}>
											{userStats.currentStreak}{" "}
											<Typography
												variant="h6"
												component="span"
												fontWeight={400}
												sx={{ opacity: 0.9 }}
											>
												days
											</Typography>
										</Typography>
										{userStats.longestStreak > userStats.currentStreak && (
											<Typography
												variant="body2"
												sx={{ opacity: 0.9, mt: 0.5 }}
											>
												Best: {userStats.longestStreak} days
											</Typography>
										)}
									</Box>
								</Box>
							</Card>
						)}
					</Box>
				</Stack>

				<Typography variant="h5" fontWeight={600}>
					Supplement Schedule
				</Typography>

				{schedule && schedule.length === 0 ? (
					<Card
						sx={{
							p: 4,
							textAlign: "center",
							borderRadius: 2,
							border: "1px dashed",
							borderColor: "divider",
						}}
					>
						<Typography variant="body1" color="text.secondary">
							No supplements scheduled for today
						</Typography>
					</Card>
				) : (
					<Stack spacing={2}>
						{schedule?.map((item) => (
							<Card
								key={`${item.supplement.id}-${item.scheduledTime}`}
								onClick={() =>
									item.status === "pending" &&
									handleSupplementClick(item.supplement.id, item.scheduledTime)
								}
								sx={{
									p: { xs: 2, md: 2.5 },
									borderRadius: 2,
									border: "1px solid",
									borderColor: "divider",
									cursor: item.status === "pending" ? "pointer" : "default",
									transition: "all 0.2s ease-in-out",
									"&:hover": item.status === "pending"
										? {
												borderColor: "primary.main",
												boxShadow: 2,
											}
										: {},
								}}
							>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									justifyContent="space-between"
									alignItems={{ xs: "flex-start", sm: "center" }}
									spacing={{ xs: 2, sm: 0 }}
								>
									<Stack spacing={1} sx={{ flex: 1 }}>
										<Typography variant="h6" fontWeight={600}>
											{item.supplement.name}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{item.supplement.dosage} {item.supplement.unit}
											{item.supplement.instructions.length > 0 && (
												<> • {item.supplement.instructions[0]}</>
											)}
										</Typography>
									</Stack>

									<Stack direction="row" spacing={1.5} alignItems="center">
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 0.5,
											}}
										>
											<AccessTime fontSize="small" sx={{ color: "text.secondary" }} />
											<Typography variant="body2" fontWeight={500}>
												{formatTime(item.scheduledTime)}
											</Typography>
										</Box>

										<Chip
											icon={getStatusIcon(item.status)}
											label={
												item.status.charAt(0).toUpperCase() +
												item.status.slice(1)
											}
											color={getStatusColor(item.status)}
											size="small"
											sx={{
												fontWeight: 500,
												textTransform: "capitalize",
											}}
										/>
									</Stack>
								</Stack>
							</Card>
						))}
					</Stack>
				)}

				{selectedSupplement && (
					<Dialog
						open={!!selectedSupplement}
						onClose={handleCloseDialog}
						maxWidth="xs"
						fullWidth
						PaperProps={{
							sx: {
								borderRadius: 4,
								p: 1,
								backgroundImage: 'none',
								boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
							},
						}}
					>
						<Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
							<IconButton onClick={handleCloseDialog} size="small" sx={{ color: 'text.secondary' }}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>

						<DialogContent sx={{ pt: 0, pb: 3, textAlign: 'center' }}>
							<Stack spacing={3} alignItems="center">
								<Box>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: '50%',
											bgcolor: 'success.light',
											color: 'success.dark',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											mx: 'auto',
											mb: 2,
											opacity: 0.2
										}}
									>
										<MedicationLiquidIcon sx={{ fontSize: 32, opacity: 1, color: '#1b5e20' }} />
									</Box>

									<Typography variant="h5" fontWeight={700} color="text.primary">
										{selectedSupplement.name}
									</Typography>

									<Box
										sx={{
											display: 'inline-block',
											mt: 1,
											px: 2,
											py: 0.5,
											bgcolor: 'grey.100',
											borderRadius: 8,
											border: '1px solid',
											borderColor: 'grey.200'
										}}
									>
										<Typography variant="subtitle2" fontWeight={600} color="text.secondary">
											{selectedSupplement.dosage}
										</Typography>
									</Box>
								</Box>

								{selectedSupplement.instructions.length > 0 && (
									<Box
										sx={{
											width: '100%',
											bgcolor: 'background.paper',
											border: '1px solid',
											borderColor: 'divider',
											borderRadius: 3,
											p: 2,
											textAlign: 'left'
										}}
									>
										<Stack direction="row" spacing={1} alignItems="center" mb={1}>
											<InfoOutlinedIcon fontSize="small" color="info" />
											<Typography variant="subtitle2" fontWeight={600}>
												How to take
											</Typography>
										</Stack>
										<Stack spacing={0.5}>
											{selectedSupplement.instructions.map((instruction, index) => (
												<Typography
													key={index}
													variant="body2"
													color="text.secondary"
													sx={{ display: 'flex', alignItems: 'flex-start' }}
												>
													<span style={{ marginRight: '8px', opacity: 0.6 }}>•</span>
													{instruction}
												</Typography>
											))}
										</Stack>
									</Box>
								)}
							</Stack>
						</DialogContent>

						<DialogActions sx={{ p: 2, pt: 0 }}>
							<Stack direction="row" spacing={2} width="100%">
								<Button
									onClick={handleSkip}
									fullWidth
									variant="text"
									color="inherit"
									sx={{
										py: 1.5,
										borderRadius: 3,
										color: 'text.secondary',
										fontWeight: 600
									}}
								>
									Skip
								</Button>
								<Button
									onClick={handleTaken}
									fullWidth
									variant="contained"
									disableElevation
									sx={{
										py: 1.5,
										borderRadius: 3,
										fontWeight: 700,
										textTransform: 'none',
										fontSize: '1rem',
										background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
										boxShadow: '0 4px 12px rgba(32, 201, 151, 0.3)',
										"&:hover": {
											background: "linear-gradient(135deg, #218838 0%, #1aa179 100%)",
										},
									}}
								>
									Mark as Taken
								</Button>
							</Stack>
						</DialogActions>
					</Dialog>
				)}
			</Stack>
		</Container>
	);
};

export default HomePage;
