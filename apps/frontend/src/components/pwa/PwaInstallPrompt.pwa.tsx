import { usePwaInstallStore } from "@frontend/stores/usePwaInstallStore";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from '@mui/icons-material/IosShare';
import { Box, Button, IconButton, Snackbar } from "@mui/material";

export function PwaInstallPrompt() {
  const {
    showPwaInstallationPrompt,
    deferredInstallationPrompt,
    dismissInstallationFlow
  } = usePwaInstallStore();

  const handleInstall = () => {
    if (deferredInstallationPrompt) {
      deferredInstallationPrompt.prompt()
      deferredInstallationPrompt.userChoice.then(({ outcome }) => {
        if (outcome !== "accepted") {
          //if user rejects system generated prompt then dismiss installation flow for 90 days
          dismissInstallationFlow(true);
        }
      });
    }
  }

  const userAgent = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isChromium = (window as Window & {chrome?: object} ).chrome !== undefined && !isIOS;

  if (!showPwaInstallationPrompt) return null;

  return(
      <>
        {isIOS && (
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message={
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Tap <IosShareIcon fontSize="small" color="inherit" /> then "Add to Home Screen"
              </Box>
            }
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => dismissInstallationFlow()}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        )}

        {!isIOS && !isChromium && (
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message="Install app for a better experience"
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => dismissInstallationFlow()}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        )}
        {isChromium && !isIOS && (
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message="Install this app on your device?"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="primary"
                  size="small"
                  onClick={handleInstall}
                  variant="contained"
                >
                  Install
                </Button>
                <Button
                  size="small"
                  aria-label="close"
                  color="secondary"
                  onClick={() => dismissInstallationFlow()}
                  variant="contained"
                >
                  Maybe Later
                </Button>
              </Box>
            }
          />
        )}
      </>
  )
}