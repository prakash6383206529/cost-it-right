import axios from "axios";
import { reactLocalStorage } from "reactjs-localstorage";
import { toast } from "react-toastify";
import { API } from "../src/config/constants"

let isRefreshing = false; // Track if refresh token request is in progress
let refreshSubscribers = []; // Store pending API requests while refreshing

// Function to refresh token

const CustomHeader = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    Authorization: `Bearer NRIsJAXFS-IgPMtfW05J1EiTwhv4z37BnFCk2TynvAdVYMuBIal7dTYyfboxRFjvPJ1zPl4r4LfQJ8_1fKDnSxTmGmThhl6YabKHaGvzp2WDQ7P0wFZs2wW10Mcmkt4Xb4ybDGzwSLt6fwRuI1uGNRuyNMxKQz-s533rIF5Qx08vwumo5ogN5x_oyi__b4KXJWbUU_0qLaJGLwISEf4o3_4CPBoP6Gv_tAGIO1W250SzOF3zwYpTxi8LwghOtQse`,
    "Access-From": "WEB",
    "Api-Key": `${process.env.REACT_APP_API_KEY}`,
  };

const refreshToken = async () => {
    try {
        let userDetail = JSON.parse(localStorage.getItem("userDetail"));
        let refresh_token = userDetail?.RefreshToken;
        if (!refresh_token) throw new Error("No refresh token available");

        let reqParams = {
            refresh_token: refresh_token,
            grant_type: "refresh_token",
        };

        let queryParams = `refresh_token=${reqParams.refresh_token}&grant_type=${reqParams.grant_type}`;
        
        const response = await axios.post( API.refreshTokenAPI, queryParams, CustomHeader);
        
        if (response && response.status === 200) {
            userDetail.Token = response.data.Data.access_token;
            userDetail.RefreshToken = response.data.Data.refresh_token;
            localStorage.setItem("userDetail", JSON.stringify(userDetail));

            // Notify all stored requests to retry with new token
            refreshSubscribers.forEach((callback) => callback(response.data.Data.access_token));
            refreshSubscribers = [];

            return response.data.Data.access_token;
        } else {
            throw new Error("Failed to refresh token");
        }
    } catch (error) {
        console.error("Refresh token failed", error);
        toast.error('Authentication error. Please contact your IT Team.')
        reactLocalStorage.setObject("isUserLoggedIn", false);
        reactLocalStorage.setObject("userDetail", {});
        reactLocalStorage.set("ModuleId", "");
        window.location.assign("/login");
        return Promise.reject(error);
    }
};

const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const userDetail = JSON.parse(localStorage.getItem("userDetail"));
            if (userDetail?.Token) {
                config.headers.Authorization = `Bearer ${userDetail.Token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
        (response) => response, // Return response as is for success cases
        async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                if (originalRequest.url.includes('/refresh_token')) {
                    reactLocalStorage.setObject("isUserLoggedIn", false);
                    reactLocalStorage.setObject("userDetail", {});
                    reactLocalStorage.set("ModuleId", "");
                    window.location.assign("/login");
                } else {
                    if (!isRefreshing) {
                        isRefreshing = true;
                        try {
                            const newToken = await refreshToken();
                            isRefreshing = false;
                            originalRequest._retry = true;
                            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                            return axios(originalRequest);
                        } catch (err) {
                            isRefreshing = false;
                            return Promise.reject(err);
                        }
                    }

                    return new Promise((resolve) => {
                        refreshSubscribers.push((token) => {
                            originalRequest._retry = true;
                            originalRequest.headers["Authorization"] = `Bearer ${token}`;
                            resolve(axios(originalRequest));
                        });
                    });
                }

            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
