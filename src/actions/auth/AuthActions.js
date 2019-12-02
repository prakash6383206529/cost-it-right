import axios from 'axios';
import { apiErrors } from '../../helper/util';
import {
    API,
    AUTH_API_REQUEST,
    AUTH_API_FAILURE,
    LOGIN_SUCCESS,
    UPDATE_PASSWORD_SUCCESS,
    REGISTER_SUCCESS,
    FORGOT_PASSWORD_SUCCESS,
    VERIFY_OTP_SUCCESS,
    RESEND_OTP_SUCCESS,
    SOCIAL_MEDIA_LOGIN_SUCCESS,
    UPDATE_USER_ACCOUNT_DETAIL_SUCCESS,
    SOCIAL_USER_DATA,
    INTERNAL_ROUTE_ID,
    SEND_MESSAGE_SUCCESS
} from '../../config/constants';
import { formatLoginResult } from '../../helper/ApiResponse';


// /**
//  * @method loginUser
//  * @description get data from dummy api
//  */

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function loginUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.login, requestData, { headers })
            .then((response) => {
                console.log("login res", response)
                callback(response);
                // console.log('loginUserAPI response =>>' + JSON.stringify(response));
                dispatch(getLoginSuccess(response));
            })
            .catch((error) => {
                dispatch(getFailure(error));
                apiErrors(error);
                callback(error);
            });
    };
}

// /**
//  * @method getLoginSuccess
//  * @description return object containing action type
//  */
export function getLoginSuccess(data) {
    return {
        type: LOGIN_SUCCESS,
        payload: formatLoginResult(data),
    };
}

// /**
//  * @method getFailure
//  * @description return object containing action type
//  */
export function getFailure() {
    return {
        type: AUTH_API_FAILURE
    };
}

// /**
//  * @method socialLoginAPI
//  * @description get data from social Media
//  */
// export function socialLoginAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.socialMediaLogin, requestData, { headers })
//             .then((response) => {
//                 dispatch(getSocialMediaLoginSuccess(response));
//                 callback(response);
//             }).catch((error) => {
//                 dispatch(getSocialMediaLoginFailure(error));
//                 apiErrors(error);
//                 callback(error);
//                 // console.log("Social Response Error", error.response);
//             });
//     };
// }

// /**
//  * @method getSocialMediaLoginSuccess
//  * @description return object containing action type
//  */
// export function getSocialMediaLoginSuccess(data) {
//     return {
//         type: SOCIAL_MEDIA_LOGIN_SUCCESS,
//         payload: formatLoginResult(data),
//     };
// }

// /**
//  * @method getSocialMediaLoginFailure
//  * @description return object containing action type
//  */
// export function getSocialMediaLoginFailure() {
//     return {
//         type: AUTH_API_FAILURE
//     };
// }


// /**
//  * @method forgotPasswordAPI
//  * @description Register user by email
//  */
// export function forgotPasswordAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.forgotPassword, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch(getForgotPasswordSuccess(response));
//             })
//             .catch((error) => {
//                 dispatch(getForgotPasswordFailure(error));
//                 apiErrors(error);
//                 callback(error);
//             });
//     };
// }

// /**
//  * @method getForgotPasswordSuccess
//  * @description return object containing action type
//  */
// export function getForgotPasswordSuccess(data) {
//     return {
//         type: FORGOT_PASSWORD_SUCCESS,
//         data,
//     };
// }


// /**
//  * @method getForgotPasswordFailure
//  * @description return object containing action type
//  */
// export function getForgotPasswordFailure() {
//     return {
//         type: AUTH_API_FAILURE
//     };
// }

// /**
//  * @method registerUserAPI
//  * @description Register user by email
//  */
export function registerUserAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: AUTH_API_REQUEST });
        axios.post(API.register, requestData, { headers })
            .then((response) => {
                callback(response);
                dispatch(getRegisterSuccess(response));
            })
            .catch((error) => {
                dispatch(getRegisterFailure(error));
                apiErrors(error);
                callback(error);
            });
    };
}

// /**
//  * @method getRegisterSuccess
//  * @description return object containing action type
//  */
export function getRegisterSuccess(data) {
    return {
        type: REGISTER_SUCCESS,
        data,
    };
}

// /**
//  * @method getRegisterFailure
//  * @description return object containing action type
//  */
export function getRegisterFailure() {
    return {
        type: AUTH_API_FAILURE
    };
}


// /**
//  * @method verifyOtpAPI
//  * @description Verify otp sent on email
//  */
// export function verifyOtpAPI(requestData, callback) {

//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.verifyOtp, requestData, { headers })
//             .then((response) => {
//                 dispatch({ type: VERIFY_OTP_SUCCESS });
//                 callback(response);
//             })
//             .catch((error) => {
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method resendOtpAPI
//  * @description  Resned Verification code if expired or not found
//  */
// export function resendOtpAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.get(`${API.resendOtp}?email=${requestData.email}&registrationType=${requestData.registrationType}`, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch({ type: RESEND_OTP_SUCCESS });
//             })
//             .catch((error) => {
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method updatePasswordAPI
//  * @description update Password
//  */
// export function updatePasswordAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.put(API.updatePassword, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 dispatch(getUpdatePasswordSuccess(response));
//             })
//             .catch((error) => {
//                 dispatch({
//                     type: AUTH_API_FAILURE,
//                 });
//                 apiErrors(error);
//                 callback(error);
//             });
//     };
// }

// /**
//  * @method getUpdatePasswordSuccess
//  * @description return object containing action type
//  */
// export function getUpdatePasswordSuccess(data) {
//     return {
//         type: UPDATE_PASSWORD_SUCCESS,
//     };
// }


// /**
//  * @method updatePasswordAPI
//  * @description update Password
//  */
// export function updateUserAccountDetailsAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.updateUserAccountDetail, requestData, { headers })
//             .then((response) => {
//                 callback(response);
//                 // console.log("updateUserAccountDetailsAPI", response);
//                 dispatch({
//                     type: UPDATE_USER_ACCOUNT_DETAIL_SUCCESS,
//                     payload: formatLoginResult(response)
//                 });
//             })
//             .catch((error) => {
//                 // console.log("updateUserAccountDetailsAPI error", error);
//                 dispatch({ type: AUTH_API_FAILURE });
//                 apiErrors(error);
//             });
//     };
// }

// /**
//  * @method socialLoginValues
//  * @description return new logged in user data
//  */
// export function getsocialLoginValuesAPI(data) {
//     // console.log(data);
//     return {
//         type: SOCIAL_USER_DATA,
//         payload: data
//     };
// }

// export function showUserData(data) {
//     return {
//         type: LOGIN_SUCCESS,
//         payload: (data),
//     }
// }

// /**
//  * @method getEditExperienceType
//  * @description edit experience type
//  */
// // export function internalRouteANDID(data) {
// //    console.log('data: ', data);
// //     return (dispatch) => {
// //         dispatch({
// //             type: INTERNAL_ROUTE_ID,
// //             payload: data
// //         });
// //     }
// // }

// /**
// * @method contactUsAPI
// * @description send contact us message
// */
// export function contactUsAPI(requestData, callback) {
//     return (dispatch) => {
//         dispatch({ type: AUTH_API_REQUEST });
//         axios.post(API.contactUs, requestData, { headers })
//             .then((response) => {
//                 dispatch({
//                     type: SEND_MESSAGE_SUCCESS
//                 });
//                 callback(response);
//             }).catch((error) => {
//                 dispatch({
//                     type: AUTH_API_FAILURE,
//                 });
//                 apiErrors(error);
//             });
//     };
// }