import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, Stack, Typography } from '@mui/material';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const handleRefresh = async () => {
    await updateServiceWorker(true);
  };

  const handleClose = () => {
    setNeedRefresh(false);
  };

  return (
    <Snackbar
      open={needRefresh}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
		bottom: { xs: 100, sm: 100 },
		"& .MuiSnackbarContent-root": {
		  borderRadius: 1.5, // Pill shape
		  flexWrap: "nowrap", // FORCE SINGLE LINE
		  minWidth: "auto",
		  maxWidth: "95vw",
		  pl: 2.5,
		  pr: 2.5,
		  py: 1.5
		}
	  }}
      message={
        <Typography variant="body2" fontWeight="500">
          {"New version available"}
        </Typography>
      }
      action={
        <Stack direction="row" spacing={0} alignItems="center">
          <Button
            onClick={handleRefresh}
            size="small"
            variant="contained"
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 'bold', fontSize: '0.75rem' }}
          >
            Update
          </Button>
          <Button
            onClick={handleClose}
            size="small"
            sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }}
          >
            {needRefresh ? "Later" : "Close"}
          </Button>
        </Stack>
      }
    />
  );
}