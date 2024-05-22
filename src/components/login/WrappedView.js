
// WrappedView.js
import React, { useEffect } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { reactLocalStorage } from 'reactjs-localstorage';

export const WrappedView = ({ setToken, setIsLoginWithMsal }) => {
    console.log('WrappedView: call');

    const { instance, accounts } = useMsal();

    useEffect(() => {
        const fetchToken = async () => {
            if (!accounts.length) {
                return;
            }

            const request = {
                ...loginRequest,
                account: accounts[0]
            };

            try {
                const response = await instance.acquireTokenSilent(request);
                if (Object.keys(reactLocalStorage.getObject('msaltoken')).length === 0) {
                    console.log("I am in wrapper view");
                    reactLocalStorage.setObject('msaltoken', response.accessToken)
                    setToken(response.accessToken);
                    setIsLoginWithMsal(true);
                }
            } catch (e) {
                if (e instanceof InteractionRequiredAuthError) {
                    try {
                        const response = await instance.acquireTokenPopup(request);
                        setToken(response.accessToken);
                        setIsLoginWithMsal(true);
                    } catch (error) {
                    }
                } else {
                }
            }
        };

        fetchToken();
    }, [instance, accounts, setToken, setIsLoginWithMsal]);

    const handleRedirect = () => {
        instance
            .loginRedirect({
                ...loginRequest,
                prompt: "select_account",
            })
            .catch((error) => console.log(error));
    };

    return (
        <div className="App">
            <AuthenticatedTemplate>
                <p>Authenticated successfully</p>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <button type="button" onClick={handleRedirect}>Login with Microsoft</button>
            </UnauthenticatedTemplate>
        </div>
    );
};
