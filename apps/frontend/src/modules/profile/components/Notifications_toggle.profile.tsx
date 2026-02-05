import { Typography } from "@connected-repo/ui-mui/data-display/Typography";
import { Box } from "@connected-repo/ui-mui/layout/Box";
import { env } from "@frontend/configs/env.config";
import { useSuprSend } from "@frontend/hooks/useSuprSend";
import { enablePushNotifications } from "@frontend/utils/notifications.utils";
import { queryClient } from "@frontend/utils/queryClient";
import { EmailRounded, NotificationsActive } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material";
import Switch from "@mui/material/Switch";
import { type ApiResponse, type Category, type CategoryChannel, PreferenceOptions, type Section, SuprSendProvider } from "@suprsend/react-core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const NotificationPreferencesPanel = ({ userId }: { userId: string }) => {
  const theme = useTheme();
	const { getPreferences, suprSendClient } = useSuprSend(userId);
  const [isWebPushSubscribed, setIsWebPushSubscribed] = useState<boolean>(false)

  useEffect(()=>{
    suprSendClient.webpush.pushSubscribed()
      .then(isPushSubscribed => setIsWebPushSubscribed(isPushSubscribed))
  },[suprSendClient])

  //Fetch Preferences using TanStack Query + SuprSend SDK
  const { data: userPrefData, isLoading: isUserPrefLoading, error: userPrefError } = useQuery({
    queryKey: ["suprsend-preferences"],
    queryFn: async () => {
      const resp = await suprSendClient.user.preferences.getPreferences();
      
      if (resp.status === "error"){
        toast.error("Failed to fetch!")
        throw new Error(resp.error?.message);
      }

      return resp.body
    },
  });

  //Derive the Email Status (OPT_IN vs OPT_OUT)
  //TODO: make it readable
  const isEmailEnabled = userPrefData?.sections
    ?.flatMap((section: Section) => section.subcategories || [])
      .find((sub: Category) => sub.category === "reminders")
      ?.channels?.find((ch: CategoryChannel) => ch.channel === "email")
        ?.preference === PreferenceOptions.OPT_IN;


  const handlePushNotificationToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("toggled push...")
      const newStatus = event.target.checked;

      try {
          // Update SuprSend
          if (newStatus) {
          	await enablePushNotifications(getPreferences, suprSendClient)
            setIsWebPushSubscribed(true)
          } else {

            const result = (await suprSendClient.webpush.removePushSubscription()) as ApiResponse

          	if (result.status !== "success") {
          		console.log("Preference update result:", result);
          		return toast.error(
          			"Something went wrong while disabling push notifications!"
          		);
          	}

            // Get the current PushSubscription instance and unsubscribe it
            await navigator.serviceWorker.ready
            .then((reg) => reg.pushManager.getSubscription()
              .then((pushSubscription) => pushSubscription?.unsubscribe()
              )
            );

            setIsWebPushSubscribed(false)
          }
      } catch (error) {
          console.error("Failed to toggle notifications:", error);
      }
  };

  const emailNotificationToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("toggled email...");
    const newStatus = event.target.checked;
    const preferenceOption = newStatus ? PreferenceOptions.OPT_IN : PreferenceOptions.OPT_OUT;

    try {
      // 1. Call SuprSend SDK
      const result = await suprSendClient.user.preferences.updateChannelPreferenceInCategory(
        "email",
        preferenceOption,
        "reminders"
      );

      if (result.status !== "success") {
        console.log("Email update failed:", result);
        return toast.error("Failed to update email preferences");
      }

      await queryClient.setQueryData(["suprsend-preferences"], result.body)

    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      toast.error("Something went wrong");
    }
  };
  
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
            checked={isWebPushSubscribed}
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
            checked={Boolean(isEmailEnabled)}
            onChange={emailNotificationToggle}
            disabled={isUserPrefLoading}
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