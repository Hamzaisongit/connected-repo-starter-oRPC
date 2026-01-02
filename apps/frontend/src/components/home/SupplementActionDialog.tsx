import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";

interface SupplementActionDialogProps {
	open: boolean;
	onClose: () => void;
	onTaken: () => void;
	onSkip: () => void;
	supplementName: string;
	supplementDosage: string;
	supplementInstructions: string[];
}

export const SupplementActionDialog = ({
	open,
	onClose,
	onTaken,
	onSkip,
	supplementName,
	supplementDosage,
	supplementInstructions,
}: SupplementActionDialogProps) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
					p: 2,
				},
			}}
		>
			<DialogTitle>
				<Typography variant="h5" fontWeight={600}>
					Record Supplement
				</Typography>
			</DialogTitle>

			<DialogContent>
				<Stack spacing={2}>
					<Box>
						<Typography variant="h6" fontWeight={600} gutterBottom>
							{supplementName}
						</Typography>
						<Typography variant="body1" color="text.secondary">
							{supplementDosage}
						</Typography>
					</Box>

					{supplementInstructions.length > 0 && (
						<Box>
							<Typography
								variant="subtitle2"
								fontWeight={600}
								gutterBottom
								color="text.primary"
							>
								Instructions:
							</Typography>
							{supplementInstructions.map((instruction) => (
								<Typography
									key={instruction}
									variant="body2"
									color="text.secondary"
									sx={{ ml: 1 }}
								>
									• {instruction}
								</Typography>
							))}
						</Box>
					)}

					<Box>
						<Typography
							variant="body2"
							color="text.secondary"
							fontWeight={500}
						>
							Have you taken this supplement?
						</Typography>
					</Box>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ p: 2, pt: 0 }}>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					spacing={1.5}
					width="100%"
				>
					<Button
						onClick={onSkip}
						fullWidth
						variant="outlined"
						color="primary"
						sx={{
							py: 1.5,
							borderRadius: 1.5,
						}}
					>
						Skip
					</Button>
					<Button
						onClick={onTaken}
						fullWidth
						variant="contained"
						color="success"
						sx={{
							py: 1.5,
							borderRadius: 1.5,
							background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
							"&:hover": {
								background: "linear-gradient(135deg, #218838 0%, #1aa179 100%)",
							},
						}}
					>
						Taken
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};
