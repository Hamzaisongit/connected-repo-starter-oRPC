import { ErrorAlert } from "@connected-repo/ui-mui/components/ErrorAlert";
import { LoadingSpinner } from "@connected-repo/ui-mui/components/LoadingSpinner";
import { Chip } from "@connected-repo/ui-mui/data-display/Chip";
import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Alert } from "@connected-repo/ui-mui/feedback/Alert";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { ArrowBackIcon } from "@connected-repo/ui-mui/icons/ArrowBackIcon";
import { CalendarTodayIcon } from "@connected-repo/ui-mui/icons/CalendarTodayIcon";
import { DeleteIcon } from "@connected-repo/ui-mui/icons/DeleteIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Card, CardContent } from "@connected-repo/ui-mui/layout/Card";
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Divider } from "@connected-repo/ui-mui/layout/Divider";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { orpc } from "@frontend/utils/orpc.client";
import { useMutation, useQuery } from "@tanstack/react-query";
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

	const formatDays = (days: string | string[]) => {
		const daysArray = Array.isArray(days) ? days : [days];
		if (daysArray.length === 7) return "Every day";
		if (daysArray.length === 0) return "No schedule";
		return daysArray.join(", ");
	};

	const formatTimes = (times: string[]) => {
		if (times.length === 0) return "No times set";
		return times.join(", ");
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
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

	return (
		<Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
			{/* Back Button */}
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate("/user-stack")}
				sx={{
					mb: 3,
					color: "text.secondary",
					"&:hover": {
						color: "primary.main",
						bgcolor: "action.hover",
					},
				}}
			>
				Back to My Stack
			</Button>

			{/* Main Card */}
			<Card
				sx={{
					boxShadow: 3,
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
					transition: "box-shadow 0.3s ease-in-out",
					"&:hover": {
						boxShadow: 6,
					},
				}}
			>
				<CardContent sx={{ p: { xs: 3, md: 4 } }}>
					{/* Header Section */}
					<Stack
						direction={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems={{ xs: "flex-start", sm: "center" }}
						spacing={2}
						sx={{ mb: 3 }}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<CalendarTodayIcon sx={{ fontSize: 20, color: "text.secondary" }} />
							<Typography variant="body2" color="text.secondary">
								{formatDate(userStack.createdAt)}
							</Typography>
						</Box>
						<Button
							variant="outlined"
							color="error"
							startIcon={<DeleteIcon />}
							onClick={handleDeleteClick}
							sx={{
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: 2,
								},
							}}
						>
							Delete Item
						</Button>
					</Stack>

					<Divider sx={{ mb: 4 }} />

					{/* Name and Status Section */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
							<Typography
								variant="h4"
								component="h1"
								sx={{
									fontWeight: 700,
									color: "text.primary",
									flexGrow: 1,
								}}
							>
								{userStack.name}
							</Typography>
							<Chip
								label={userStack.isActive ? "Active" : "Inactive"}
								color={userStack.isActive ? "success" : "default"}
								size="small"
								sx={{ fontWeight: 600 }}
							/>
						</Box>
					</Box>

					{/* Dosage Section */}
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="overline"
							color="text.secondary"
							sx={{
								fontWeight: 600,
								letterSpacing: "0.1em",
								display: "block",
								mb: 1,
							}}
						>
							Dosage
						</Typography>
						<Typography
							variant="h6"
							sx={{
								color: "text.primary",
								fontWeight: 600,
							}}
						>
							{userStack.dosage} {userStack.unit}
						</Typography>
					</Box>

					{/* Schedule Section */}
					<Box sx={{ mb: 4 }}>
						<Typography
							variant="overline"
							color="text.secondary"
							sx={{
								fontWeight: 600,
								letterSpacing: "0.1em",
								display: "block",
								mb: 2,
							}}
						>
							Schedule
						</Typography>
						<Stack spacing={1}>
							<Box>
								<Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 500 }}>
									Days:
								</Typography>{" "}
								<Typography variant="body2" color="text.primary">
									{formatDays(userStack.days)}
								</Typography>
							</Box>
							<Box>
								<Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 500 }}>
									Times:
								</Typography>{" "}
								<Typography variant="body2" color="text.primary">
									{formatTimes(userStack.timesOfDay)}
								</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Instructions Section */}
					{userStack.instructions.length > 0 && (
						<Box>
							<Typography
								variant="overline"
								color="text.secondary"
								sx={{
									fontWeight: 600,
									letterSpacing: "0.1em",
									display: "block",
									mb: 2,
								}}
							>
								Instructions
							</Typography>
							<Box
								sx={{
									bgcolor: "grey.50",
									borderLeft: "4px solid",
									borderColor: "primary.main",
									p: 2,
									borderRadius: 1,
								}}
							>
								{userStack.instructions.map((instruction, index) => (
									<Typography
										key={`${index}-${instruction}`}
										variant="body1"
										sx={{
											color: "text.primary",
											lineHeight: 1.7,
											mb: index < userStack.instructions.length - 1 ? 2 : 0,
										}}
									>
										• {instruction}
									</Typography>
								))}
							</Box>
						</Box>
					)}
				</CardContent>
			</Card>

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
					<Button
						onClick={handleDeleteCancel}
						disabled={deleteMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deleteMutation.isPending}
						sx={{
							transition: "all 0.2s ease-in-out",
							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: 4,
							},
						}}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete Item"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}