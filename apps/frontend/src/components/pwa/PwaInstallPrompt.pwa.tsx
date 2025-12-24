import { usePwaInstallStore } from "@frontend/stores/usePwaInstallStore";
import { Snackbar, Button, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from '@mui/icons-material/IosShare';

export function PwaInstallPrompt() {
  const {
    showPwaInstallationPrompt,
    userPlatform,
    triggerInstall,
    dismissPrompt,
    isDisplayStandalone,
  } = usePwaInstallStore();

  if (isDisplayStandalone || !showPwaInstallationPrompt) return null;

  // Define the message content based on platform
  const getMessage = () => {
    if (userPlatform === 'ios') {
      return (
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Tap <IosShareIcon fontSize="small" color="inherit" /> then "Add to Home Screen"
        </Box>
      );
    }
    if (userPlatform === 'other') {
      return 'Install app for a better experience';
    }
    return 'Install this app on your device?';
  };

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      message={getMessage()}
      action={
        <>
          {/* Show Install Button only for Chromium/Installable browsers */}
          {userPlatform === 'chromium' && (
            <Button color="secondary" size="small" onClick={triggerInstall}>
              Install
            </Button>
          )}
          
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => dismissPrompt()}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
}