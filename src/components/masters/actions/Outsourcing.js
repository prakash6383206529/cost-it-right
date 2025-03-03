import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    config,
    GET_OUTSOURCING_DATA,
    GET_ALL_OUTSOURCING_DATA,
    GET_OUTSOURCING_DATA_FOR_DOWNLOAD,
    API_SUCCESS
} from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';


/**
 * @method createOutsourcing
 * @description create outsourcing 
 */
export function createOutsourcing(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createOutsourcing, data, config());
        request.then((response) => {
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
 * @method updateOutsourcing
 * @description Update Outsourcing
 */
export function updateOutsourcing(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateOutsourcing}`, requestData, config())
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
 * @method getOutsourcing
 * @description get outsourcing data
 */
export function getOutsourcing(outSourcingId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getOutsourcing}/${outSourcingId}/${loggedInUser?.loggedInUserId}`, config())
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_OUTSOURCING_DATA,
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
* @method getAlloutsourcing
* @description get all outsourcing list
*/
export function getAllOutsourcing(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            loggedInUserId: loggedInUserId(), outSourcingName: obj.OutSourcingName, outSourcingShortName: obj.OutSourcingShortName, isApplyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getAllOutsourcing}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_ALL_OUTSOURCING_DATA,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_OUTSOURCING_DATA_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method activeInactiveOutsourcingStatus
 * @description active Inactive Status
 */
export function activeInactiveOutsourcingStatus(requestData, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.activeInactiveOutsourcingStatus}`, requestData, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}