import { useRegisterSW } from 'virtual:pwa-register/react';
import { Box, Button, Snackbar } from '@mui/material';

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
				<Box sx={{ display: "flex", gap: 1 }}>
					{needRefresh && (
						<Button
							color="primary"
							size="small"
							onClick={handleRefresh}
							variant="contained"
						>
							Refresh
						</Button>
					)}
					<Button
						size="small"
						aria-label="close"
						color="secondary"
						onClick={handleClose}
						variant="contained"
					>
						Not Now
					</Button>
				</Box>
			}
		/>
	);
}