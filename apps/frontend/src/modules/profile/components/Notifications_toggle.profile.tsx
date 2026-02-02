import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { env } from "@frontend/configs/env.config";
import { useSuprSend } from "@frontend/hooks/useSuprSend";
import { enablePushNotifications } from "@frontend/utils/notifications.utils";
import { orpc, orpcFetch } from "@frontend/utils/orpc.client";
import { queryClient } from "@frontend/utils/queryClient";
import { EmailRounded, NotificationsActive } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material";
import Switch from "@mui/material/Switch";
import { PreferenceOptions, SuprSendProvider } from "@suprsend/react-core";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

const NotificationPreferencesPanel = ({ userId }: { userId: string }) => {
  const theme = useTheme();
	const { getPreferences, suprSendClient } = useSuprSend(userId);

	// -- Data loading error state using TanStack's useQuery (orpc.profile.getProfile) --
	const { data: profileData } = useQuery(
		orpc.profile.getProfile.queryOptions(),
	);

  const handlePushNotificationToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("toggled push...")
      const newStatus = event.target.checked;

      try {
          // 1. Update SuprSend
          if (newStatus) {
          	await enablePushNotifications(getPreferences, suprSendClient)
          } else {
          	// User is switching OFF push notifications
          	const result =
          		await suprSendClient.user.preferences.updateChannelPreferenceInCategory(
          			"webpush",
          			PreferenceOptions.OPT_OUT,
          			"reminders"
          		);

          	if (result.status !== "success") {
          		console.log("Preference update result:", result);
          		return toast.error(
          			"Something went wrong while disabling push notifications!"
          		);
          	}
          }

          // 2. Update database
          await orpcFetch.profile.updateProfile({
            ...profileData,
          	pushNotificationPreference: newStatus
          });

          await queryClient.invalidateQueries({
          	queryKey: orpc.profile.getProfile.queryKey()
          });
      } catch (error) {
          console.error("Failed to toggle notifications:", error);
      }
  };

  const emailNotificationToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("toggled email...")
    const newStatus = event.target.checked;

    try {
        // 1. Update SuprSend
        if (newStatus) {
          const result = await suprSendClient.user.preferences.updateChannelPreferenceInCategory(
            "email",
            PreferenceOptions.OPT_IN,
            "reminders"
          )

          if (result.status !== "success") {
            console.log("Enable email result:", result);
            return toast.error(
              "Something went wrong while enabling email notifications!"
            );
          }
        } else {
          // User is switching OFF email notifications
          const result =
            await suprSendClient.user.preferences.updateChannelPreferenceInCategory(
              "email",
              PreferenceOptions.OPT_OUT,
              "reminders"
            );

          if (result.status !== "success") {
            console.log("Preference update result:", result);
            return toast.error(
              "Something went wrong while disabling email notifications!"
            );
          }
        }

        // 2. Update database
        await orpcFetch.profile.updateProfile({
            ...profileData,
            emailNotificationPreference: newStatus
        });

        queryClient.invalidateQueries({ 
          queryKey: orpc.profile.getProfile.queryKey() 
        });
        
    } catch (error) {
        console.error("Failed to toggle notifications:", error);
    }
  }
  
  return (
    <>
      {/* handlePushNotificationToggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2.5,
          borderRadius: 2.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 1.5
          }}
        >
          {/* Notification Icon */}
          <NotificationsActive fontSize="medium" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: "1rem",
            }}
          >
            Web-Push Notifications
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.90rem"
            }}
          >
            Receive Web-Push Notifications for Supplement Reminder
          </Typography>
        </Box>
        <Switch
            checked={Boolean(profileData?.pushNotificationPreference)}
            onChange={ handlePushNotificationToggle }
            // disabled={profileLoading || notificationMutation.isPending}
            color="success"
            slotProps={{ input: { "aria-label": "Enable push notifications" } }}
        />
      </Box>

      {/* emailNotificationToggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: 2,
          px: 2,
          py: 1.5,
          borderRadius: 2.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: theme.shadows[1],
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: 1.5
          }}
        >
          {/* Email Notification Icon */}
          <EmailRounded fontSize="medium" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 500,
              fontSize: "1rem",
            }}
          >
            Email Notifications
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.90rem"
            }}
          >
            Receive Email Notifications for Supplement Reminder
          </Typography>
        </Box>
        <Switch
            checked={Boolean(profileData?.emailNotificationPreference)}
            onChange={emailNotificationToggle}
            // disabled={profileLoading || notificationMutation.isPending}
            color="success"
            slotProps={{ input: { "aria-label": "Enable email notifications" } }}
        />
      </Box>
    </>
  )
}

export function NotificationsToggle ({ userId }: { userId: string }) {
	return (
		<SuprSendProvider
			publicApiKey={env.VITE_SUPRSEND_PUBLIC_API_KEY}
			vapidKey={env.VITE_SUPRSEND_PUBLIC_VAPID_KEY}
			swFileName={import.meta.env.DEV ? "./dev-sw.js?dev-sw" : "./sw.js"}
		>
			<NotificationPreferencesPanel userId={userId} />
		</SuprSendProvider>
	);
}