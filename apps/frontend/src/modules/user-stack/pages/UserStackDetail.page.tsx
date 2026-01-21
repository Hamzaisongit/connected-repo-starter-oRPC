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
import { Card } from "@connected-repo/ui-mui/layout/Card"
import { Container } from "@connected-repo/ui-mui/layout/Container";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { BackButton } from "@frontend/components/BackButton";
import { orpc } from "@frontend/utils/orpc.client";
import { getStockIconAndColor } from "@frontend/utils/supplement.utils";
import { alpha, useTheme } from "@mui/material/styles";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function UserStackDetailPage() {
	const theme = useTheme();
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



  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Extract HH:MM from HH:MM:SS
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
                        fontFamily: 'serif',
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                    }}
                >
                    Supplement Details
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
            <Card
                sx={{
                    position: "relative",
                    overflow: "visible",
                    p: { xs: 3, md: 4 },
                    mt: 6,
                }}
            >
                {/* Floating Icon */}
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
                        // Using theme.shadows directly
                        boxShadow: theme.shadows[4],
                        border: "4px solid",
                        borderColor: theme.palette.background.paper,
                        zIndex: 2,
                    }}
                >
                    <span style={{ fontSize: "3rem" }}>{stockIconData.icon}</span>
                </Box>

                {/* Name and Toggle Row */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 5, mb: 3 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: 'serif',
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            lineHeight: 1.3,
                            flex: 1,
                        }}
                    >
                        {userStack.name}
                    </Typography>
                    <Switch
                        checked={userStack.isActive}
                        onChange={() => {}} 
                        color="success"
                    />
                </Box>

                {/* Stats Pills */}
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: theme.palette.divider,
                            borderRadius: "16px",
                            p: 2,
                            textAlign: "center",
                            // Using theme variable for alpha
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 0.5 }}>
                            Dosage
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {userStack.dosage} {userStack.unit}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid",
                            borderColor: theme.palette.divider,
                            borderRadius: "16px",
                            p: 2,
                            textAlign: "center",
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 0.5 }}>
                            Times
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                            {formatTime(userStack.reminderTime)}
                        </Typography>
                    </Box>
                </Box>

                {/* Days Display */}
                {userStack.reminderDays && userStack.reminderDays.length > 0 && (
                    <Box sx={{ mb: 3, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 1 }}>
                            Schedule
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                            {formatDays(userStack.reminderDays)}
                        </Typography>
                    </Box>
                )}

                {/* Instructions Section */}
                {userStack.instructions && userStack.instructions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 1.5 }}>
                            Instructions
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: theme.palette.action.hover,
                                borderLeft: "3px solid",
                                borderColor: theme.palette.primary.main,
                                p: 2,
                                borderRadius: 2,
                            }}
                        >
                            {userStack.instructions.map((instruction, index) => (
                                <Typography
                                    key={`${index}-${instruction}`}
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.primary,
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

                {/* Edit Button */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/user-stack/edit/${stackId}`)}
                            sx={{ px: 3, borderRadius: "20px" }}
                        >
                            Edit Supplement
                        </Button>
                    </motion.div>
                </Box>
            </Card>
        </motion.div>

        {/* Intake History & Logs Section */}
        <Box sx={{ mt: 4 }}>
            <Typography
                variant="overline"
                sx={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: theme.palette.text.primary,
                    display: "block",
                    mb: 3,
                }}
            >
                Intake Logs
            </Typography>

            {/* Timeline */}
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
                                <Typography sx={{ fontWeight: 500, fontSize: "0.95rem", color: theme.palette.text.primary, minWidth: 100 }}>
                                    {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </Typography>
                                
                                {/* Circular Status Indicator */}
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: isTaken ? theme.palette.success.main : "transparent",
                                        border: isTaken ? "none" : "2px solid",
                                        borderColor: isTaken ? "transparent" : theme.palette.error.light,
                                        boxShadow: isTaken ? `0px 2px 8px ${alpha(theme.palette.success.main, 0.4)}` : "none",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    {isTaken && (
                                        <Typography sx={{ color: theme.palette.success.contrastText, fontSize: "1.2rem", fontWeight: "bold" }}>
                                            ✓
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, flex: 1 }}>
                                    {log?.actualAt ? `Logged at ${new Date(log.actualAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}` : "No intake recorded"}
                                </Typography>
                            </Box>
                        </motion.div>
                    );
                })}
            </Stack>
        </Box>

        {/* Delete Link */}
        <Box sx={{ mt: 6, display: "flex", justifyContent: "center", pb: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    onClick={handleDeleteClick}
                    sx={{
                        color: theme.palette.error.main,
                        textDecoration: "underline",
                        textDecorationColor: alpha(theme.palette.error.main, 0.3),
                        "&:hover": {
                            textDecorationColor: theme.palette.error.main,
                            bgcolor: "transparent",
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
                    <Typography component="span" fontWeight={600} sx={{ color: theme.palette.error.main }}>
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
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleDeleteCancel} disabled={deleteMutation.isPending} color="inherit">
                    Cancel
                </Button>
                <Button
                    onClick={handleDeleteConfirm}
                    color="error"
                    variant="contained"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Item"}
                </Button>
            </DialogActions>
        </Dialog>
    </Container>
);
}
