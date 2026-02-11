import { orpcFetch } from "@frontend/utils/orpc.client";
import { type ApiResponse, useSuprSendClient } from "@suprsend/react-core";
import { useEffect, useRef } from "react";

export const useSuprSend = (userId: string) => {
    const suprSendClient = useSuprSendClient();
    const userPref = useRef<ApiResponse | undefined>(undefined);
    const suprSendUserToken = useRef<string | undefined>(undefined);

    const getUserToken = () => 
        orpcFetch.notifications.signSuprSendUserToken()
            .then(({ token }) => {
                suprSendUserToken.current = token;
                return token;
            });

    const getPreferences = async () => {
        if(suprSendClient.isIdentified(true)) {
		    const pref = await suprSendClient.user.preferences.getPreferences();
            userPref.current = pref;
			return pref;
		};

        const userToken = suprSendUserToken.current ?? await getUserToken();
		
		return suprSendClient.identify(userId, userToken,
            {
                refreshUserToken: getUserToken
            }
        )
            .then(() => suprSendClient.user.preferences.getPreferences()
                .then((prefResult)=> {
                userPref.current = prefResult;
                return prefResult;

                }
            ));
    };

    useEffect(() => {
        getPreferences();
    })

    return {
        suprSendClient,
        getPreferences,
        userPref
    }
}