import { type ApiResponse, PreferenceOptions, type SuprSend } from "@suprsend/react-core";
import { toast } from "react-toastify";

/**
 * Attempts to enable web push notifications for the user via the SuprSend client.
 *
 * - Checks current browser notification permission:
 *    - If "denied": shows info toast and throws an error.
 *    - If permission is not "denied": attempts registration.
 *       - On success: fetches preferences and sets "webpush" to OPT_IN for "reminders".
 *       - On failure: shows error toast and throws with error message.
 *
 * - Provides toast-based user feedback for both blocking and failure cases.
 *
 * @param suprSendClient The initialized SuprSend client instance.
 * @throws Error if permissions are blocked or push setup fails.
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
    } else {
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
    } 
}