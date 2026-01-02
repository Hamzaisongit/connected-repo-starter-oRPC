import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { TextField } from "@connected-repo/ui-mui/form/TextField";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useState } from "react";

interface TakeSkipDialogProps {
	open: boolean;
	onClose: () => void;
	supplementName: string;
	dosage: number;
	unit: string;
	onTake: () => void;
	onSkip: (reason?: string) => void;
}

export const TakeSkipDialog = ({
	open,
	onClose,
	supplementName,
	dosage,
	unit,
	onTake,
	onSkip,
}: TakeSkipDialogProps) => {
	const [skipReason, setSkipReason] = useState("");
	const [showReasonInput, setShowReasonInput] = useState(false);

	const handleTake = () => {
		onTake();
		handleClose();
	};

	const handleSkip = () => {
		onSkip(skipReason || undefined);
		handleClose();
	};

	const handleClose = () => {
		setSkipReason("");
		setShowReasonInput(false);
		onClose();
	};

	const handleSkipClick = () => {
		setShowReasonInput(true);
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 3,
				},
			}}
		>
			<DialogTitle>
				<Typography variant="h6" fontWeight={600}>
					{supplementName}
				</Typography>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={2}>
					<Box
						sx={{
							p: 2,
							bgcolor: "background.default",
							borderRadius: 2,
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						<Typography variant="body2" color="text.secondary">
							Dosage: <strong>{dosage} {unit}</strong>
						</Typography>
					</Box>

					{!showReasonInput ? (
						<DialogContentText>
							Did you take this supplement?
						</DialogContentText>
					) : (
						<Stack spacing={2}>
							<Typography variant="body2" color="text.secondary">
								Why did you skip this supplement? (optional)
							</Typography>
							<TextField
								fullWidth
								multiline
								rows={3}
								placeholder="e.g., Forgot to take it, Not feeling well, etc."
								value={skipReason}
								onChange={(e) => setSkipReason(e.target.value)}
								variant="outlined"
							/>
						</Stack>
					)}
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 2, pt: 0 }}>
				{!showReasonInput ? (
					<Stack direction="row" spacing={2} sx={{ width: "100%" }}>
						<Button
							onClick={handleSkipClick}
							variant="outlined"
							color="error"
							sx={{
								flex: 1,
								py: 1.5,
								fontSize: "1rem",
								fontWeight: 600,
							}}
						>
							✗ Skip
						</Button>
						<Button
							onClick={handleTake}
							variant="contained"
							color="success"
							sx={{
								flex: 1,
								py: 1.5,
								fontSize: "1rem",
								fontWeight: 600,
							}}
						>
							✓ Taken
						</Button>
					</Stack>
				) : (
					<Stack direction="row" spacing={2} sx={{ width: "100%" }}>
						<Button
							onClick={() => setShowReasonInput(false)}
							variant="outlined"
							sx={{
								flex: 1,
							}}
						>
							Back
						</Button>
						<Button
							onClick={handleSkip}
							variant="contained"
							color="error"
							sx={{
								flex: 1,
								fontWeight: 600,
							}}
						>
							Confirm Skip
						</Button>
					</Stack>
				)}
			</DialogActions>
		</Dialog>
	);
};
