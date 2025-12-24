// src/components/InstallPrompt.tsx
import { usePwaInstallStore } from "@frontend/stores/usePwaInstallStore";
import { 
  Button, 
  Snackbar, 
  IconButton, 
  Typography, 
  Box, 
  Paper, 
  Stack, 
  useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from '@mui/icons-material/IosShare'; // Specific iOS icon
import AddToHomeScreenIcon from '@mui/icons-material/AddToHomeScreen'; // Generic icon for logic
import MenuIcon from '@mui/icons-material/Menu';

export function PwaInstallPrompt() {
  const {
    showPwaInstallationPrompt,
    userPlatform,
    triggerInstall,
    dismissPrompt,
    isDisplayStandalone,
  } = usePwaInstallStore();

  const theme = useTheme();

  // Early return if already installed or store says hide
  if (isDisplayStandalone || !showPwaInstallationPrompt) return null;

  return (
    <Snackbar
      open={true}
      // Position slightly higher on mobile to avoid overlapping navigation bars
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ 
        bottom: { xs: 24, sm: 32 },
        width: '100%',
        maxWidth: 450,
        // Remove default Snackbar styling to let our Paper component handle it
        '& .MuiSnackbarContent-root': {
          bgcolor: 'transparent',
          boxShadow: 'none',
          p: 0,
        }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          p: 2.5,
          borderRadius: 3,
          // Glassmorphism effect (optional, depends on your design system)
          // bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background accent (optional) */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 4,
            bgcolor: 'primary.main',
          }} 
        />

        {/* Header Section */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight="700" color="text.primary">
              Install Application
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add to your home screen for the best experience.
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => dismissPrompt()} 
            aria-label="close"
            sx={{ 
              color: 'text.secondary',
              mt: -1, mr: -1 
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Platform Specific Action Section */}
        <Box mt={2}>
          
          {/* CHROMIUM (Android / Desktop) - Direct Install Button */}
          {userPlatform === "chromium" && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button 
                onClick={() => dismissPrompt()}
                color="inherit"
                size="small"
              >
                Not Now
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={triggerInstall}
                startIcon={<AddToHomeScreenIcon />}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Install
              </Button>
            </Stack>
          )}

          {/* IOS - Instructional */}
          {userPlatform === "ios" && (
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={2} 
              sx={{ 
                bgcolor: theme.palette.action.hover, 
                p: 1.5, 
                borderRadius: 2 
              }}
            >
              <IosShareIcon color="primary" />
              <Typography variant="caption" color="text.primary" fontWeight="500">
                Tap the <b>Share</b> button below, then scroll down and select <b>"Add to Home Screen"</b>.
              </Typography>
            </Stack>
          )}

          {/* OTHER BROWSERS - Generic Instructions */}
          {userPlatform === "other" && (
            <Stack 
              direction="row" 
              alignItems="center" 
              spacing={2} 
              sx={{ 
                bgcolor: theme.palette.action.hover, 
                p: 1.5, 
                borderRadius: 2 
              }}
            >
              <MenuIcon color="primary" />
              <Typography variant="caption" color="text.primary" fontWeight="500">
                Tap your browser menu and look for <b>"Install App"</b> or <b>"Add to Home Screen"</b>.
              </Typography>
            </Stack>
          )}
        </Box>
      </Paper>
    </Snackbar>
  );
}