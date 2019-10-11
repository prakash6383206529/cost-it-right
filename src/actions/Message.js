import axios from 'axios';
import { toastr } from "react-redux-toastr";
import { reactLocalStorage } from 'reactjs-localstorage';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import {
    API,
    MESSAGE_API_REQUEST,
    MESSAGE_API_FAILURE,
    SEND_CHAT_MESSAGE_SUCCESS,
    GET_MUTUAL_FOLLOWER_LIST_SUCCESS,
    GET_MESSAGE_LIST_SUCCESS,
    UPDATE_MESSAGE__FAILURE,
    GET_MESSAGE_DETAILS,
    SEARCH_TEXT_DATA,
    DELETE_MESSAGE_SUCCESS
} from '../config/constants';
import {
    formatGetMutualFollowerData, formateGetMessageListingResults,
    formatGetMessageDetails
} from '../helper/ApiResponse';

const headers = {
    'Content-Type': 'application/json',
};

/**
 * @method composeNewMessage
 * @description used to create new message thread
 */
export function composeNewMessage(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        axios.post(API.composeMessage, requestData, { headers })
            .then((response) => {
                dispatch({ type: SEND_CHAT_MESSAGE_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                dispatch({ type: MESSAGE_API_FAILURE });
                apiErrors(error);
            });
    };
}

export function getMutualProfileFolowerList() {
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        const request = axios.get(`${API.getMutualFollowers}`, { headers });
        request.then((response) => {
            if (response.data.status === true) {
                const formatedUserData = formatGetMutualFollowerData(response.data);
                dispatch({
                    type: GET_MUTUAL_FOLLOWER_LIST_SUCCESS,
                    payload: formatedUserData,
                });
            } else {
                toastr.success(MESSAGES.SOME_ERROR, 'danger');
            }
        }).catch((error) => {
            dispatch({ type: MESSAGE_API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getMessageList
* @description Used to get message list
*/
export function getMessageList(listType, callback) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        const request = axios.get(`${API.getMessageListing}?listType=${listType}`, { headers });
        request.then((response) => {
            if (response.data.status === true) {
                const getMessageListingData = formateGetMessageListingResults(response.data);
                dispatch({
                    type: GET_MESSAGE_LIST_SUCCESS,
                    payload: getMessageListingData,
                    inboxCount: response.data.data.inbox,
                    listType,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: MESSAGE_API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method filterMessageList
 * @description used to call the follow unfollow API
 */
export function filterMessageList(name, listType, callback) {
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        const request = axios.get(`${API.getMessageListing}?listType=${listType}`, { headers });
        request.then((response) => {
            if (response.data.status === true) {
                const getFilterMessageListingData = formateGetMessageListingResults(response.data);
                dispatch({
                    type: SEARCH_TEXT_DATA,
                    payload: getFilterMessageListingData,
                    inboxCount: response.data.data.inbox,
                    listType,
                    searchText: name
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: MESSAGE_API_FAILURE });
            apiErrors(error);
        });

    }
}

/**
* @method updateMessageListingAPI
* @description Used to delete opportunity created and posted by me 
*/
export function updateMessageListingAPI(requestData, callback) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        axios.put(`${API.updateMessageListing}`, requestData)
            .then((response) => {
                dispatch({ type: UPDATE_MESSAGE__FAILURE });
                callback(response);
            }).catch((error) => {
                dispatch({ type: MESSAGE_API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method getMessageDetailsAPI
 * @description used to create new message thread
 */
export function getMessageDetailsAPI(requestData) {
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        axios.put(`${API.getMessageDetails}`, requestData)
            .then((response) => {
                const messageFormatData = formatGetMessageDetails(response.data.messageDetails.messageDetails.chatDetails);
                dispatch({
                    type: GET_MESSAGE_DETAILS,
                    payload: messageFormatData
                });
            }).catch((error) => {
                dispatch({ type: MESSAGE_API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
* @method deleteMessageAPI
* @description Used to delete opportunity created and posted by me 
*/
export function deleteMessageAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: MESSAGE_API_REQUEST });
        axios.delete(`${API.deleteMessageAPI}?messageId=${requestData.messageId}&chatId=${requestData.chatId}`)
            .then((response) => {
                dispatch({ type: DELETE_MESSAGE_SUCCESS })
                callback(response);
            }).catch((error) => {
                dispatch({ type: MESSAGE_API_FAILURE });
                apiErrors(error);
            });

    };
}