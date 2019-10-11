import axios from 'axios';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { toastr } from "react-redux-toastr";
import {
    API,
    DASHBOARD_API_REQUEST,
    DASHBOARD_API_FAILURE,
    GET_CHART_DATA_SUCCESS,
    GET_IN_APP_NOTIFICATION_LIST_SUCCESS,
    GET_MARK_AS_READ_NOTIFICATION_SUCCESS
} from '../config/constants';
import { formatGetInAppNotificationListResult } from '../helper/ApiResponse';

const headers = {
    'Content-Type': 'application/json',
};

/**
 * @method getOpportunitiesAPI
 * @description get all opportunities 
 */

export function getChartDataAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: DASHBOARD_API_REQUEST });
        //console.log('Dashborad getChartDataAPI data', data);
        const request = axios.get(`${API.getChartData}?${data}`, { headers });
        request.then((response) => {
            //console.log('Dashborad getChartDataAPI response', response.data.data);
            if (response.status === 200) {
                dispatch({
                    type: GET_CHART_DATA_SUCCESS,
                    payload: response.data.data,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log('Dashborad getChartDataAPI error', error);
            dispatch({ type: DASHBOARD_API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method getInAppNotificationListingAPI
* @description Used to get In app notification list
*/
export function getInAppNotificationListingAPI(data, loadMore = false, callback) {
    return (dispatch) => {
        dispatch({ type: DASHBOARD_API_REQUEST });
        const request = axios.get(`${API.notificationListing}?${data}`, { headers });
        request.then((response) => {
            if (response.status === 200) {
                const inAppNotificationListData = formatGetInAppNotificationListResult(response.data.notificationList);
                //console.log('getViewerListingAPI success', inAppNotificationListData);
                dispatch({
                    type: GET_IN_APP_NOTIFICATION_LIST_SUCCESS,
                    payload: inAppNotificationListData,
                    loadMore
                });
                callback(response.data);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log('getViewerListingAPI error', error);
            callback(error);
            dispatch({ type: DASHBOARD_API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method onClickMarkAsReadNotificationAPI
* @description Used to call to mark the notification as read
*/
export function onClickMarkAsReadNotificationAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: DASHBOARD_API_REQUEST });
        const request = axios.post(`${API.markAsReadNotification}`, data, { headers });
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_MARK_AS_READ_NOTIFICATION_SUCCESS,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: DASHBOARD_API_FAILURE });
            apiErrors(error);
        });
    };
}