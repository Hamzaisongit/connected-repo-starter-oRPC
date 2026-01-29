import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Dialog, DialogContent, DialogTitle } from "@connected-repo/ui-mui/feedback/Dialog";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { PhotoCameraIcon } from "@connected-repo/ui-mui/icons/PhotoCameraIcon";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";

export function PhotoAssistCard() {
	const theme = useTheme();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<Box
			sx={{
				backgroundColor: theme.palette.background.paper,
				borderRadius: 2.5,
				p: 1.5,
				boxShadow: theme.shadows[1],
				border: `1px solid ${alpha(theme.palette.common.black, 0.05)}`,
			}}
		>
			<Box
				onClick={() => setDialogOpen(true)}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					cursor: "pointer",
					transition: "all 0.2s ease-in-out",
					p: 1.5,
					borderRadius: 1.5,
					"&:hover": {
						backgroundColor: alpha(theme.palette.info.main, 0.3),
					},
				}}
			>
				<Box
					sx={{
						width: 44,
						height: 44,
						borderRadius: 1.25,
						backgroundColor: alpha(theme.palette.info.main, 0.6),
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<PhotoCameraIcon sx={{ color: theme.palette.info.dark, fontSize: "1.35rem" }} />
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: theme.palette.text.primary, mb: 0.125 }}>
						Photo Assist
					</Typography>
					<Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary }}>
						Tap to scan label instantly
					</Typography>
				</Box>
				<Typography sx={{ color: theme.palette.text.secondary, fontSize: "1.15rem" }}>›</Typography>
			</Box>

			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				slotProps={{
					paper: {
						sx: {
							borderRadius: 1,
							minWidth: 280,
						},
					},
				}}
			>
				<DialogTitle sx={{ textAlign: "center", pt: 3 }}>Coming Soon</DialogTitle>
				<DialogContent sx={{ textAlign: "center", pb: 3 }}>
					<Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
						Photo Assist feature is currently under development. Stay tuned!
					</Typography>
					<Button
						variant="contained"
						onClick={() => setDialogOpen(false)}
						sx={{ minWidth: 100 }}
					>
						OK
					</Button>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
