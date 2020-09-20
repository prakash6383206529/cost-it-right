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
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
* @method createReasonAPI
* @description create Reason 
*/
export function createReasonAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(API.createReason, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            } else {
                dispatch({ type: CREATE_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getAllReasonAPI
* @description get all Reason list
*/
export function getAllReasonAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getAllReasonAPI, { headers })
            .then((response) => {
                dispatch({
                    type: GET_REASON_DATA_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}


/**
 * @method getReasonAPI
 * @description get one Reason based on reason id
 */
export function getReasonAPI(ReasonId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getReasonAPI}/${ReasonId}`, headers)
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
        axios.put(`${API.updateReasonAPI}`, requestData, headers)
            .then((response) => {
                if (response.data.Result) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method deleteReasonAPI
 * @description delete UOM 
 */
export function deleteReasonAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteReasonAPI}/${Id}`, headers)
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
        axios.put(`${API.activeInactiveReasonStatus}`, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}