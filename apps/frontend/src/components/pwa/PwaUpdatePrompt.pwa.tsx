import { useRegisterSW } from 'virtual:pwa-register/react';
import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton, Snackbar } from '@mui/material';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  const handleRefresh = async () => {
    await updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
  };

  return (
    <Snackbar
			open={needRefresh || offlineReady}
			anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			message={
				needRefresh
					? "New version available!"
					: "App ready to work offline"
			}
			action={
				<>
					{needRefresh && (
						<Button
							color="secondary"
							size="small"
							onClick={handleRefresh}
							sx={{ fontWeight: 600 }}
						>
							Refresh
						</Button>
					)}
					<IconButton
						size="small"
						aria-label="close"
						color="inherit"
						onClick={handleClose}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</>
			}
		/>
	);
}