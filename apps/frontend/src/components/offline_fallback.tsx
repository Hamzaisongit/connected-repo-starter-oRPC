import { WifiOff } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";


export const OfflineFallback = ({ children }: {children: ReactNode}) => {
  const theme = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {children}
      {!isOnline && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: theme.palette.background.default, 
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: theme.palette.action.hover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <WifiOff sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 1 
            }}
          >
            You are offline
          </Typography>

          <Typography 
            variant="body1" 
            sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: 400,
                mb: 4 
            }}
          >
            It seems you lost your internet connection. Check your network to restore access.
          </Typography>
        </Box>
      )}
    </>
  );
};