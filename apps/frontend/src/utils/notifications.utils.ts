import { type ApiResponse, PreferenceOptions, type SuprSend } from "@suprsend/react-core";
import { toast } from "react-toastify";

/**
 * Enables web push notifications for the current user using the SuprSend client.
 * 
 * Checks the current browser permission status for notifications.
 * - If denied, informs the user notifications are blocked and throws an error.
 * - If default (not decided), requests browser permission and subscribes user on success.
 * - If granted, ensures the user's notification preference is set to OPT_IN for "reminders".
 * 
 * Displays toast messages for user feedback in cases of error or permission issues.
 * 
 * @param suprSendClient - The initialized SuprSend instance used to manage push preferences.
 * @throws Error if browser permissions are blocked or enabling notifications fails.
 */
export const enablePushNotifications = async (
    getPreferences: () => Promise<ApiResponse | undefined>,
    suprSendClient: SuprSend,
) => {
    const isWebPushRegistered = await suprSendClient.webpush.pushSubscribed()
    const browserLevelPermission = suprSendClient.webpush.notificationPermission();
    
    if (browserLevelPermission === "denied") {
        toast.info(
            "Notifications are blocked for this app. Please re-enable notifications in your browser site settings."
        );
        throw new Error("Notification Permission for this site is Blocked at Browser level");
    } else if (browserLevelPermission === "default" || (browserLevelPermission === "granted" && !isWebPushRegistered)) {
        // User hasn't yet made a decision, so request permission and register
        const registrationResult = await suprSendClient.webpush
            .registerPush()
            .then((val) => {
                if (val.status !== "success") {
                    return val;
                }
                //call getPreference() first to avoid race condition of whether 
                //webpush channel is available or not for the current user instance
                return getPreferences()
                    .then(() => suprSendClient.user.preferences.updateChannelPreferenceInCategory(
                            "webpush",
                            PreferenceOptions.OPT_IN,
                            "reminders"
                        )          
                    );
            })

        if (registrationResult.status !== "success") {
            toast.error(
                "Something went wrong while enabling push notifications!"
            );
            throw new Error(registrationResult.error?.message);
        }
    } else if (browserLevelPermission === "granted" || isWebPushRegistered) {
        // Notifications already allowed, just update preference
        const updateResult =
            await suprSendClient.user.preferences.updateChannelPreferenceInCategory(
                "webpush",
                PreferenceOptions.OPT_IN,
                "reminders"
            );

        if (updateResult.status !== "success") {
            toast.error(
                "Something went wrong while enabling push notifications!"
            );
            throw new Error(updateResult.error?.message);
        }
    }
}