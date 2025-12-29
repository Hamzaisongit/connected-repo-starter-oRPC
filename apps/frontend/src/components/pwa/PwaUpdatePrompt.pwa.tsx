import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, Stack, Typography } from '@mui/material';

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
      sx={{
		bottom: { xs: 20, sm: 10 },
		"& .MuiSnackbarContent-root": {
		  borderRadius: 2, // Pill shape
		  flexWrap: "nowrap", // FORCE SINGLE LINE
		  minWidth: "auto",
		  maxWidth: "95vw",
		  pl: 2,
		  pr: 2.5,
		  py: 1.5
		}
	  }}
      message={
        <Typography variant="body2" fontWeight="500">
          {needRefresh ? "New version available" : "App ready to work offline"}
        </Typography>
      }
      action={
        <Stack direction="row" spacing={0.5} alignItems="center">
          {needRefresh && (
            <Button
              onClick={handleRefresh}
              size="small"
              variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}
            >
              Update
            </Button>
          )}
          <Button
            onClick={handleClose}
            size="small"
            sx={{ fontWeight: 'bold', color: '#aaa', textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }}
          >
            {needRefresh ? "Later" : "Close"}
          </Button>
        </Stack>
      }
    />
  );
}