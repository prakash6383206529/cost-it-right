import axios from 'axios';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import {
    NOTIFICATION_DATA_REQUEST,
    NOTIFICATION_DATA_FAILURE,
    GET_NOTIFICATION_DATA_SUCCESS,
    UPDATE_NOTIFICATION_DATA_SUCCESS
} from '../config/constants';
import { API } from '../config/constants'
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
};

// const customHeader = {
//     'Accept': 'application/json',
//     'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d'
// };


/**
* @method getNotificationSettingDataApi
* @description Used to get notification seeting data
*/

export function getNotificationSettingDataApi(requestData) {
    //console.log("getNotificationSettingDataApi=>" + JSON.stringify(requestData));
    return (dispatch) => {
        dispatch({ type: NOTIFICATION_DATA_REQUEST });
        const request = axios.post(`${API.getNotificationSettingData}`, requestData, { headers });
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_NOTIFICATION_DATA_SUCCESS,
                    payload: response.data
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: NOTIFICATION_DATA_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method updateNotificationSettingAPI
* @description Used to update notification seeting data
*/
export function updateNotificationSettingAPI(requestData, callback) {
    //console.log("updateNotificationSettingAPI=======>" + JSON.stringify(requestData));
    return (dispatch) => {
        dispatch({ type: NOTIFICATION_DATA_REQUEST });
        const request = axios.post(API.updateNotificationSettingData, requestData, { headers });
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: UPDATE_NOTIFICATION_DATA_SUCCESS,
                    payload: response.data
                });
                callback(response)
            } else {
                callback(response)
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: NOTIFICATION_DATA_FAILURE });
            apiErrors(error);
        });
    };
}
