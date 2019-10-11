import { reactLocalStorage } from 'reactjs-localstorage';
import axios from 'axios';
import { toastr } from "react-redux-toastr";
import {
    API,
    API_REQUEST,
    API_FAILURE,
    SHOW_EDIT_BUTTON,
    GET_USER_PROFILE_SUCCESS,
    UPDATE_USER_PROFILE_SUCCESS,
    DELETE_USER_MEDIA_SUCCESS,
    POST_USER_MEDIA_SUCCESS,
    FETCH_USER_DATA,
    USER_PROFILE_IMAGE_SUCCESS,
    USER_HEADSHOT_IMAGE_SUCCESS,
    SET_PROFILE_PICTURE_SUCCESS,
    EXPERIENCE_TYPE,
    GET_VIEWER_LIST_SUCCESS
} from '../config/constants';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { formatGetUserProfileResult, formatGetUserViewerListResult } from '../helper/ApiResponse';

let multipartHeaders = {
    'Content-Type': 'multipart/form-data;'
};

function updateAsyncStorage(updateData, cb) {
    const oldData = reactLocalStorage.getObject('userResponse');
    if (oldData !== null) {
        let userData = { ...oldData, ...updateData };
        reactLocalStorage.setObject('userResponse', userData)
        cb();
    }
}

/**
 * @method getUserProfileSuccess
 * @description return object containing action type
 */
export function getUserProfileSuccess(data) {
    return {
        type: GET_USER_PROFILE_SUCCESS,
        payload: data.data,
    };
}

/**
 * @method showEditButton
 * @description return object containing action type
 */
export function showEditButton(data) {
    return {
        type: SHOW_EDIT_BUTTON,
        payload: data,
    }
}

/**
 * @method getUserProfileFailure
 * @description return object containing action type
 */
export function getUserProfileFailure() {
    return {
        type: API_FAILURE
    };
}

/**
 * @method updateUserProfileAPI
 * @description update user profile data
 */
export function updateUserProfileAPI(requestData, userId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateUserProfile}?id=${userId}`, requestData)

            .then((response) => {
                console.log('updateUserProfileAPI Success', response.data);
                if (response.data.success === true) {
                    callback(response);
                    getUserProfileAPIForUpdatingProps(dispatch, userId, () => {
                        dispatch(getUserProfileUpdateSuccess(response));
                    });
                } else {
                    dispatch({ type: API_FAILURE });
                    if (response.data.message) {
                        toastr.error(response.data.message);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
                    }
                }
            })
            .catch((error) => {
                // console.log('updateUserProfileAPI error', error);
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getUserProfileUpdateSuccess
 * @description return object containing action type
 */
export function getUserProfileUpdateSuccess(data) {
    return {
        type: UPDATE_USER_PROFILE_SUCCESS,
        payload: data.data,
    };
}

/**
 * @method updateUserSocialLinksAPI
 * @description update social links
 */
export function updateUserSocialLinksAPI(requestData, userId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateUserSocialLink}?id=${userId}`, requestData)
            .then((response) => {
                callback(response);
                dispatch(getUserProfileUpdateSuccess(response));
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);

            });
    };
}

/**
 * @method deleteUserMediaAPI
 * @description delete user media
 */
export function deleteUserMediaAPI(id, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUserMedia}/${requestData.uniqueFilename}`)
            .then((response) => {
                getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                    callback(response);
                    dispatch({ type: DELETE_USER_MEDIA_SUCCESS });
                });
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method postUserMediaAPI
 * @description post media of user
 */
export function postUserMediaAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.post(API.postMedia, requestData, { multipartHeaders })
            .then((response) => {
                callback(response);
                dispatch({ type: POST_USER_MEDIA_SUCCESS });
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method uploadUserProfileImageOnBasicDetailAPI
 * @description upload user profile image
 */
export function uploadUserProfileImageOnBasicDetailAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const media = {
            uri: requestData.mediaUri,
            type: requestData.fileType,
            name: requestData.fileName,
        };
        let data = new FormData();
        data.append('files', media);
        axios.post(API.postUserProfileImage, data, { multipartHeaders })
            .then((response) => {
                if (response.status === 200) {
                    dispatch({ type: USER_PROFILE_IMAGE_SUCCESS });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method postUploadProfileImageAPI
 * @description post profileImage of user
 */
export function uploadUserProfileImageAPI(id, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const media = {
            uri: requestData.mediaUri,
            type: requestData.fileType,
            name: requestData.fileName,
        };
        let data = new FormData();
        data.append('files', media);
        axios.post(API.postUserProfileImage, data, { multipartHeaders })
            .then((response) => {
                getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                    dispatch({ type: USER_PROFILE_IMAGE_SUCCESS });
                    callback(response);
                });
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method uploadUserHeadShotImageAPI
 * @description post headshotImage of user
 */
export function uploadUserHeadShotImageAPI(id, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const media = {
            uri: requestData.mediaUri,
            type: requestData.fileType,
            name: requestData.fileName,
        };
        let data = new FormData();
        data.append('files', media);
        axios.post(API.postUserHeadShotImage, data, { multipartHeaders })
            .then((response) => {
                getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                    callback(response);
                    dispatch({ type: USER_HEADSHOT_IMAGE_SUCCESS });
                });
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getTalentProfile
 * @description get talent profile data
 */
export function getTalentProfile(id, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        console.log('getTalentProfile request', id);
        const request = axios.get(`${API.getUserProfile}?userId=${id}`);
        request.then((response) => {
            console.log('getTalentProfile', response);
            if (response.status === 200) {
                const userFormatedData = formatGetUserProfileResult(response.data);
                dispatch({
                    type: GET_USER_PROFILE_SUCCESS,
                    payload: userFormatedData,
                });
                callback(response)
                /** Update local storage  */
                updateLoggedInUserDataProps(dispatch, loggedInUserId);

                if (id !== loggedInUserId) {
                    console.log('ID IS DIFFERENT');
                    updateViewerCountAPI(id, loggedInUserId, dispatch);
                }
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log('getTalentProfile error', error);
            toastr.error('This user does not exist in our record.');
            setTimeout(() => {
                window.location.assign('/dashboard');
            }, 2000)
            dispatch(getUserProfileFailure(error));
            callback(error)
            //apiErrors(error);
        });
    };
}

/**
 * @method getUserProfileAPI
 * @description get user profile data
 */
export function getUserProfileAPI(id, showLoader = true, callback) {
    return (dispatch) => {
        //console.log('getUserProfileAPI: ', id, showLoader = true, callback);
        if (showLoader) {
            dispatch({ type: API_REQUEST });
        }
        const request = axios.get(`${API.getUserProfile}?userId=${id}`);
        request.then((response) => {
            //console.log('response', response);
            if (response.status === 200) {
                const userFormatedData = formatGetUserProfileResult(response.data);
                const updateData = {
                    firstName: userFormatedData.firstName,
                    lastName: userFormatedData.lastName,
                    profileImage: userFormatedData.profileImage,
                    isBasicInfoCompleted: userFormatedData.isBasicInfoCompleted,
                    followingUser: userFormatedData.followingUser,
                    followerUser: userFormatedData.followerUser,
                    blockedUser: userFormatedData.blockedUser,
                };
                dispatch({
                    type: GET_USER_PROFILE_SUCCESS,
                    payload: userFormatedData,
                });
                /** Update local storage  */
                updateAsyncStorage(updateData, () => {
                    dispatch({
                        type: FETCH_USER_DATA,
                        payload: updateData
                    });
                });
                callback(response.data)
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            callback(error)
            dispatch(getUserProfileFailure(error));
            apiErrors(error);
        });
    };
}

/**
 * @method updateLoggedInUserDataProps
 * @description update logged in user data
 */
function updateLoggedInUserDataProps(dispatch, id) {
    const request = axios.get(`${API.getUserProfile}?userId=${id}`);
    request.then((response) => {
        if (response.status === 200) {
            const userFormatedData = formatGetUserProfileResult(response.data);
            const updateData = {
                firstName: userFormatedData.firstName,
                lastName: userFormatedData.lastName,
                profileImage: userFormatedData.profileImage,
                isBasicInfoCompleted: userFormatedData.isBasicInfoCompleted,
                followingUser: userFormatedData.followingUser,
                followerUser: userFormatedData.followerUser,
                blockedUser: userFormatedData.blockedUser,
            };
            /** Update auth props */
            updateAsyncStorage(updateData, () => {
                dispatch({
                    type: FETCH_USER_DATA,
                    payload: updateData
                });
            });
        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
    }).catch((error) => {
        dispatch(getUserProfileFailure(error));
        apiErrors(error);
    });
}

/**
 * @method getUserProfileAPIForUpdatingProps
 * @description callback to update profile api this
 *  function update local storage and userData props
 */
function getUserProfileAPIForUpdatingProps(dispatch, id, cb) {
    const request = axios.get(`${API.getUserProfile}?userId=${id}`);
    request.then((response) => {
        if (response.status === 200) {
            const userFormatedData = formatGetUserProfileResult(response.data);
            const updateData = {
                firstName: userFormatedData.firstName,
                lastName: userFormatedData.lastName,
                profileImage: userFormatedData.profileImage,
                isBasicInfoCompleted: userFormatedData.isBasicInfoCompleted,
                followingUser: userFormatedData.followingUser,
                followerUser: userFormatedData.followerUser,
                blockedUser: userFormatedData.blockedUser,
            };
            /** Update local storage  */
            dispatch({
                type: GET_USER_PROFILE_SUCCESS,
                payload: userFormatedData,
            });
            /** Update auth props */
            updateAsyncStorage(updateData, () => {
                dispatch({
                    type: FETCH_USER_DATA,
                    payload: updateData
                });
                /** Callback execture here */
                cb();
            });
        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
    }).catch((error) => {
        dispatch(getUserProfileFailure(error));
        apiErrors(error);
    });
}

/**
 * @method setMediaAsProfilePictureAPI
 * @description set media as profile picture
 */
export function setMediaAsProfilePictureAPI(id, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.setProfilePicture}/${requestData.item.uniqueFilename}`);
        request.then((response) => {
            getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                callback(response);
                dispatch({ type: SET_PROFILE_PICTURE_SUCCESS });
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getEditExperienceType
 * @description edit experience type
 */
export function getEditExperienceType(data) {
    //console.log("expr data", data);
    return (dispatch) => {
        dispatch({
            type: EXPERIENCE_TYPE,
            payload: data
        });
    }
}

/**
 * @method getTalentProfileForFollowerFollowing
 * @description get user profile data
 */
export function getTalentProfileForFollowerFollowing(id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        //console.log('getTalentProfile0 request', id);

        const request = axios.get(`${API.getUserProfile}?userId=${id}`);
        request.then((response) => {
            //console.log('getTalentProfile', response);
            if (response.status === 200) {
                const userFormatedData = formatGetUserProfileResult(response.data);
                dispatch({
                    type: GET_USER_PROFILE_SUCCESS,
                    payload: userFormatedData,
                });
                callback(response);
                /** Update local storage  */
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log('getTalentProfile error', error);
            dispatch(getUserProfileFailure(error));
            apiErrors(error);
        });
    };
}

/**
* @method getViewerListingAPI
* @description Used to get viewer list
*/
export function getViewerListingAPI(data, loadMore = false) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.ViewerListing}?${data}`);
        request.then((response) => {
            if (response.status === 200) {
                const userViewerListData = formatGetUserViewerListResult(response.data);
                dispatch({
                    type: GET_VIEWER_LIST_SUCCESS,
                    payload: userViewerListData,
                    loadMore
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            console.log('getViewerListingAPI error', error);
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

function updateViewerCountAPI(id, loggedInUserId, dispatch) {
    const requestData = {
        reviewerUserId: loggedInUserId,
        reviewToUserId: id
    };
    const request = axios.post(`${API.updateViewerCountAPI}`, requestData);
    request.then((response) => {
        console.log('updateViewerCountAPI', response);
        if (response.status === 200) {

        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
    }).catch((error) => {
        console.log('View Profile Error  ', JSON.stringify(error));
        dispatch(getUserProfileFailure(error));
        // apiErrors(error);
    });
}
