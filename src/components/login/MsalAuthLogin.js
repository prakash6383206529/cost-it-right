
import React, { useEffect, useState } from 'react';
import { useAccount, useMsal } from '@azure/msal-react';
import { loginRequest } from '../../authConfig';
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { reactLocalStorage } from 'reactjs-localstorage';
import { jwtDecode } from "jwt-decode";
import Toaster from '../common/Toaster';

export const MsalAuthLogin = ({ setToken, setIsLoginWithMsal, setAudience }) => {
    const { instance, accounts, inProgress } = useMsal();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthentication = async () => {

        if (accounts.length > 0) {
            const account = accounts[0];
            const request = { ...loginRequest, account };

            try {
                const response = await instance.acquireTokenSilent(request);
                const decodedToken = jwtDecode(response.accessToken);
                setAudience(decodedToken.aud);
                setToken(response.accessToken);
                reactLocalStorage.setObject('msaltoken', response.accessToken);
                setIsAuthenticated(true);
                setIsLoginWithMsal(true);
            } catch (error) {
                if (error instanceof InteractionRequiredAuthError) {
                    try {
                        const response = await instance.acquireTokenPopup(request);
                        const decodedToken = jwtDecode(response.accessToken);
                        setAudience(decodedToken.aud);
                        setToken(response.accessToken);
                        reactLocalStorage.setObject('msaltoken', response.accessToken);
                        setIsAuthenticated(true);
                        setIsLoginWithMsal(true);
                    } catch (popupError) {

                        Toaster.error(popupError);

                    }
                } else {

                    Toaster.error(error);
                    setIsAuthenticated(false);
                    setIsLoginWithMsal(false);
                    setToken(null);
                }
            }
        } else {
            setIsAuthenticated(false);
            setIsLoginWithMsal(false);
            setToken(null);
        }
    };

    useEffect(() => {
        if (inProgress === 'none') {
            checkAuthentication();
        }
    }, [accounts, instance, setAudience, setIsLoginWithMsal, setToken, inProgress]);

    useEffect(() => {
        const token = reactLocalStorage.getObject('msaltoken');
        if (!token || Object.keys(token).length === 0) {
            setIsAuthenticated(false);
        } else {
            // Check if token is expired
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        }
    }, []);


    useEffect(() => {
        if (!isAuthenticated) {
            reactLocalStorage.setObject('msaltoken', null);
            setToken(null);
            setIsLoginWithMsal(false);
        }
    }, [isAuthenticated, setIsLoginWithMsal, setToken]);
    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const response = await instance.handleRedirectPromise();

            } catch (error) {
                console.error("Error handling redirect response:", error);
            }
        };

        handleRedirect();
    }, [instance]);
    const handleLogin = async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (redirectError) {
            Toaster.error(redirectError);

        }
    };

    let isInteractionInProgress = false;
    const login = async () => {
        if (isInteractionInProgress) {
            Toaster.error("A login popup is already open. Please complete the current login process before trying again.");
            return;
        }
        isInteractionInProgress = true;
        try {
            await instance.loginPopup(loginRequest);
        } catch (error) {
            console.error(error);
            Toaster.error("A login popup is already open. Please complete the current login process before trying again.");
        } finally {
            isInteractionInProgress = false;
        }

    };
    const logout = () => {
        instance.logoutPopup().catch((error) => {
            console.error(error);
        });
    };
    return (
        <div>
            <button type="button" onClick={login} className='microsot-login-button'>
                <div className='microsot-logo mr-2'>
                </div>

                Continue with Microsoft
            </button>
        </div>
    );
};
