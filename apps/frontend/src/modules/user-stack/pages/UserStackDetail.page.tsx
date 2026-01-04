import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Switch } from "@connected-repo/ui-mui/form/Switch";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { EditIcon } from "@connected-repo/ui-mui/icons/EditIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Paper } from "@connected-repo/ui-mui/layout/Paper";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { BackButton } from "@frontend/components/BackButton";
import { orpc } from "@frontend/utils/orpc.client";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function UserStackDetailPage() {
	const navigate = useNavigate();
	const { stackId } = useParams<{ stackId: string }>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const { data: userStack, isLoading, error } = useQuery(
		orpc.userStacks.getById.queryOptions({ input: { id: stackId || "" } })
	);

	const { data: adherenceLogs } = useQuery(
		orpc.userAdherenceLogs.getBySupplementId.queryOptions({ input: { supplementId: stackId || "" } })
	);

	const deleteMutation = useMutation(orpc.userStacks.delete.mutationOptions());

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
		setConfirmationText("");
		setDeleteError(null);
	};

	const handleDeleteConfirm = async () => {
		if (confirmationText.toLowerCase() !== "delete") {
			setDeleteError('Please type "DELETE" to confirm');
			return;
		}

		try {
			await deleteMutation.mutateAsync({ id: stackId || "" });
			navigate("/user-stack", { replace: true });
		} catch {
			setDeleteError("Failed to delete stack item. Please try again.");
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setConfirmationText("");
		setDeleteError(null);
	};



	const formatTimes = (times: string[]) => {
		if (times.length === 0) return "No times set";
		return times.map(time => {
			const [hours, minutes] = time.split(":");
			const hour = parseInt(hours || "0", 10);
			const minute = minutes || "00";
			const period = hour >= 12 ? "PM" : "AM";
			const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
			return `${displayHour}:${minute} ${period}`;
		}).join(", ");
	};

	const formatDays = (days: string[]) => {
		if (days.length === 7) return "Daily";
		if (days.length === 0) return "No days set";
		return days.map(day => day.substring(0, 3)).join(", ");
	};



	if (isLoading) return <LoadingSpinner text="Loading stack item..." />;

	if (error) {
		const errorMessage = `${error.name} - ${error.message}`;
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<ErrorAlert message={`Error loading stack item: ${errorMessage}`} />
			</Container>
		);
	}

	if (!userStack) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Alert severity="error">Stack item not found</Alert>
			</Container>
		);
	}

	const stockIconData = getStockIconAndColor(userStack.name);

	// Prepare intake log data
	const days = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateStr = date.toDateString();
		const log = adherenceLogs?.find(l => new Date(l.scheduledFor).toDateString() === dateStr);
		days.push({ date, log });
	}

	return (
		<Container maxWidth="sm" sx={{ pb: 12 }}>
			{/* Header */}
			<Box sx={{ mb: 2, textAlign: "center", position: "relative" }}>
				<BackButton
					sx={{
						position: "absolute",
						left: 0,
						top: "50%",
						transform: "translateY(-50%)",
					}}
				/>
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
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
						Supplement Details
					</Typography>
					<Typography
						sx={{
							fontSize: "0.875rem",
							color: "#64748B",
							lineHeight: 1.5,
						}}
					>
						View and manage your supplement.
					</Typography>
				</motion.div>
			</Box>

			{/* Hero Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<Paper
					sx={{
						borderRadius: "24px",
						backgroundColor: "rgba(255, 255, 255, 0.85)",
						backdropFilter: "blur(10px)",
						WebkitBackdropFilter: "blur(10px)",
						boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
						position: "relative",
						overflow: "visible",
						p: { xs: 3, md: 4 },
						mt: 5,
					}}
				>
					{/* Large Icon overlapping top edge - 50% larger */}
					<Box
						sx={{
							position: "absolute",
							top: -40,
							left: "50%",
							transform: "translateX(-50%)",
							width: 96,
							height: 96,
							borderRadius: "50%",
							backgroundColor: stockIconData.bgColor,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.15)",
							border: "4px solid rgba(255, 255, 255, 0.9)",
							zIndex: 2,
						}}
					>
						<span style={{ fontSize: "3rem" }}>{stockIconData.icon}</span>
					</Box>

					{/* Name and Toggle Row - Left Aligned */}
					<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 5, mb: 3 }}>
						<Typography
							sx={{
								fontFamily: '"Playfair Display", Georgia, serif',
								fontWeight: 700,
								fontSize: "1.5rem",
								color: "#000000",
								lineHeight: 1.3,
								flex: 1,
							}}
						>
							{userStack.name}
						</Typography>
						<Switch
							checked={userStack.isActive}
							onChange={() => {}} // TODO: implement toggle
							sx={{
								"& .MuiSwitch-switchBase.Mui-checked": {
									color: "#4CAF50",
									"&:hover": {
										backgroundColor: "rgba(76, 175, 80, 0.08)",
									},
								},
								"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
									backgroundColor: "#4CAF50",
								},
								"& .MuiSwitch-track": {
									backgroundColor: "#9E9E9E",
								},
							}}
						/>
					</Box>

						{/* Glass Pills */}
						<Box sx={{ display: "flex", gap: 2, mb: 3 }}>
							<Box
								sx={{
									flex: 1,
									backgroundColor: "rgba(255, 255, 255, 0.4)",
									border: "1px solid rgba(255, 255, 255, 0.6)",
									backdropFilter: "blur(10px)",
									WebkitBackdropFilter: "blur(10px)",
									borderRadius: "16px",
									p: 2,
									textAlign: "center",
									boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)",
								}}
							>
								<Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, mb: 0.5 }}>
									Dosage
								</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#000000" }}>
									{userStack.dosage} {userStack.unit}
								</Typography>
							</Box>
							<Box
								sx={{
									flex: 1,
									backgroundColor: "rgba(255, 255, 255, 0.4)",
									border: "1px solid rgba(255, 255, 255, 0.6)",
									backdropFilter: "blur(10px)",
									WebkitBackdropFilter: "blur(10px)",
									borderRadius: "16px",
									p: 2,
									textAlign: "center",
									boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.05)",
								}}
							>
								<Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, mb: 0.5 }}>
									Times
								</Typography>
								<Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#000000" }}>
									{formatTimes(userStack.timesOfDay)}
								</Typography>
							</Box>
						</Box>

					{/* Days Display */}
					{userStack.days && userStack.days.length > 0 && (
						<Box sx={{ mb: 3, textAlign: "center" }}>
							<Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600, mb: 1 }}>
								Schedule
							</Typography>
							<Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#666666" }}>
								{formatDays(userStack.days)}
							</Typography>
						</Box>
					)}

						{/* Instructions Section */}
						{userStack.instructions && userStack.instructions.length > 0 && (
							<Box sx={{ mt: 3 }}>
								<Typography
									variant="body2"
									sx={{
										color: "#64748B",
										fontWeight: 600,
										mb: 1.5,
									}}
								>
									Instructions
								</Typography>
								<Box
									sx={{
										bgcolor: "#F8FAFC",
										borderLeft: "3px solid #1A1C2E",
										p: 2,
										borderRadius: "8px",
									}}
								>
									{userStack.instructions.map((instruction, index) => (
										<Typography
											key={`${index}-${instruction}`}
											variant="body2"
											sx={{
												color: "#333333",
												lineHeight: 1.6,
												mb: index < userStack.instructions.length - 1 ? 1 : 0,
											}}
										>
											• {instruction}
										</Typography>
									))}
								</Box>
							</Box>
						)}

						{/* Edit Button with Deep Gloss */}
						<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
							<motion.div
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.95 }}
							>
								<Button
									startIcon={<EditIcon />}
									onClick={() => navigate(`/user-stack/edit/${stackId}`)}
									sx={{
										px: 3,
										py: 1,
										borderRadius: "20px",
										background: "linear-gradient(135deg, #1A1C2E 0%, #2D3154 100%)",
										color: "#ffffff",
										fontSize: "0.875rem",
										fontWeight: 600,
										textTransform: "none",
										boxShadow: "0px 4px 16px rgba(26, 28, 46, 0.3)",
										"&:hover": {
											background: "linear-gradient(135deg, #2D3047 0%, #3D4166 100%)",
											boxShadow: "0px 6px 24px rgba(26, 28, 46, 0.4)",
										},
									}}
								>
									Edit Supplement
								</Button>
							</motion.div>
						</Box>
				</Paper>
			</motion.div>

			{/* Intake History & Logs Section */}
			<Box sx={{ mt: 4 }}>
				<Typography
					sx={{
						fontFamily: "sans-serif",
						fontVariant: "small-caps",
						fontWeight: 600,
						fontSize: "0.9rem",
						color: "#000000",
						mb: 3,
					}}
				>
					Intake Logs
				</Typography>

				{/* Vertical Timeline with Stagger Animation */}
				<Stack spacing={2.5}>
					{days.map(({ date, log }, index) => {
						const isTaken = log && (log.status === "Taken on-time" || log.status === "Taken late");
						return (
							<motion.div
								key={date.toISOString()}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<Typography sx={{ fontWeight: 500, fontSize: "0.95rem", color: "#000000", minWidth: 100 }}>
										{date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
									</Typography>
									
									{/* Circular Liquid Fill */}
									<Box
										sx={{
											width: 32,
											height: 32,
											borderRadius: "50%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											position: "relative",
											backgroundColor: isTaken ? "#4CAF50" : "transparent",
											border: isTaken ? "none" : "2px solid #FA8072",
											boxShadow: isTaken ? "0px 2px 8px rgba(76, 175, 80, 0.3)" : "none",
											transition: "all 0.3s ease",
										}}
									>
										{isTaken && (
											<Typography sx={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "bold" }}>
												✓
											</Typography>
										)}
									</Box>

									<Typography sx={{ fontSize: "0.9rem", color: "#666666", flex: 1 }}>
										{log?.actualAt ? `Logged at ${new Date(log.actualAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}` : "No intake recorded"}
									</Typography>
								</Box>
							</motion.div>
						);
					})}
				</Stack>
			</Box>

			{/* Delete Text Link */}
			<Box sx={{ mt: 6, display: "flex", justifyContent: "center", pb: 2 }}>
				<motion.div
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Button
						onClick={handleDeleteClick}
						sx={{
							color: "text.secondary",
							fontSize: "0.9rem",
							fontWeight: 500,
							textDecoration: "underline",
							textDecorationColor: "rgba(0, 0, 0, 0.3)",
							backgroundColor: "transparent",
							border: "none",
							"&:hover": {
								color: "error.main",
								textDecorationColor: "error.main",
								backgroundColor: "transparent",
							},
						}}
					>
						Delete this supplement
					</Button>
				</motion.div>
			</Box>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Delete Stack Item?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 3 }}>
						This action cannot be undone. To confirm deletion, please type{" "}
						<Typography component="span" fontWeight={600} color="error.main">
							DELETE
						</Typography>{" "}
						below.
					</DialogContentText>
					<TextField
						fullWidth
						label="Type DELETE to confirm"
						value={confirmationText}
						onChange={(e) => setConfirmationText(e.target.value)}
						error={!!deleteError}
						helperText={deleteError}
						autoFocus
						sx={{
							"& .MuiOutlinedInput-root": {
								"&.Mui-focused fieldset": {
									borderWidth: 2,
								},
							},
						}}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
						<Button
							onClick={handleDeleteCancel}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
					</motion.div>
					<motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
						<Button
							onClick={handleDeleteConfirm}
							color="error"
							variant="contained"
							disabled={deleteMutation.isPending}
							sx={{
								background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
								"&:hover": {
									background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
									boxShadow: "0px 4px 16px rgba(211, 47, 47, 0.4)",
								},
							}}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete Item"}
						</Button>
					</motion.div>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
