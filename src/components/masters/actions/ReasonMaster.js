import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_SUCCESS,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_REASON_DATA_SUCCESS,
    GET_REASON_SUCCESS,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import axiosInstance from '../../../utils/axiosInstance';

// const config() = config;

/**
* @method createReasonAPI
* @description create Reason 
*/
export function createReasonAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createReason, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            } else {
                dispatch({ type: CREATE_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
* @method getAllReasonAPI
* @description get all Reason list
*/
export function getAllReasonAPI(isAPICall, callback) {
    return (dispatch) => {
        if (isAPICall) {

            dispatch({ type: API_REQUEST });
            axios.get(API.getAllReasonAPI, config())
                .then((response) => {
                    if (response.data.Result || response.status === 204) {
                        dispatch({
                            type: GET_REASON_DATA_SUCCESS,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        });
                        callback(response);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
        }
        else {
            dispatch({
                type: GET_REASON_DATA_SUCCESS,
                payload: [],
            });
        }
    }
}


/**
 * @method getReasonAPI
 * @description get one Reason based on reason id
 */
export function getReasonAPI(ReasonId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getReasonAPI}/${ReasonId}`, config())
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_REASON_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method setEmptyReason
 * @description set empty reducer
 */
export function setEmptyReason() {
    return (dispatch) => {
        dispatch({
            type: GET_REASON_SUCCESS,
            payload: {},
        });
    };
}


/**
 * @method updateReasonAPI
 * @description Update Reason
 */
export function updateReasonAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateReasonAPI}`, requestData, config())
            .then((response) => {
                if (response.data.Result) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}


/**
 * @method deleteReasonAPI
 * @description delete UOM 
 */
export function deleteReasonAPI(reasonId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `reasonId=${reasonId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteReasonAPI}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method activeInactiveReasonStatus
 * @description active Inactive Status
 */
export function activeInactiveReasonStatus(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.activeInactiveReasonStatus}`, requestData, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}