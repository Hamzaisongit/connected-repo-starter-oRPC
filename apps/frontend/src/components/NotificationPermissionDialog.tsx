import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Snackbar } from "@connected-repo/ui-mui/feedback/Snackbar";
import { Button } from "@connected-repo/ui-mui/form/Button";
import { Stack } from "@connected-repo/ui-mui/layout/Stack";
import { useSuprSend } from "@frontend/hooks/useSuprSend";
import { enablePushNotifications } from "@frontend/utils/notifications.utils";
import { useTheme } from "@mui/material/styles";
import type { Dispatch, SetStateAction } from "react";

type NotificationPermissionDialogProps = {
	userId: string;
	show?: boolean;
	setShow: Dispatch<SetStateAction<boolean>>;
};

export function NotificationPermissionDialog({
	userId,
	show,
	setShow
}: NotificationPermissionDialogProps) {
    const { getPreferences, suprSendClient } = useSuprSend(userId)
	const theme = useTheme();

	const handleEnable = async () => {
		try {
			await enablePushNotifications(getPreferences, suprSendClient)
		} catch (error) {
			console.error("Failed to register push notifications:", error);
		}
		setShow(false);
	};

	const handleDismiss = () => {
		setShow(false);
	};

	return (
		<Snackbar
			open={show}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			sx={{
				bottom: { xs: 100, sm: 100 },
				"& .MuiSnackbarContent-root": {
					borderRadius: theme.spacing(4),
					flexWrap: "nowrap",
					minWidth: "auto",
					maxWidth: "95vw",
					pl: 2.5,
					pr: 2.5,
					py: 1.5,
				},
			}}
			message={
				<Typography variant="body2" fontWeight="500">
					Enable notifications to get timely reminders!! 
				</Typography>
			}
			action={
				<Stack direction="row" spacing={0} alignItems="center">
					<Button
						onClick={handleEnable}
						size="small"
						variant="contained"
						sx={{
							borderRadius: 1,
							textTransform: "none",
							fontWeight: "bold",
							fontSize: "0.75rem",
						}}
					>
						Enable
					</Button>
					<Button
						onClick={handleDismiss}
						size="small"
						sx={{
							fontWeight: "bold",
							textTransform: "none",
							color: theme.palette.text.disabled,
							fontSize: "0.75rem",
							minWidth: "auto",
						}}
					>
						Later
					</Button>
				</Stack>
			}
		/>
	);
}