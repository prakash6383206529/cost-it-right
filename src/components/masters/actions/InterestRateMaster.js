import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_DATA_SUCCESS,
    GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
    GET_ICC_APPLICABILITY_SELECTLIST,
    GET_INTEREST_RATE_DATA_LIST,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

const headers = config

/**
 * @method createInterestRate
 * @description CREATE INTEREST RATE
 */
export function createInterestRate(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(API.createInterestRate, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getInterestRateDataList
 * @description GET INTEREST RATE DATALIST
 */
export function getInterestRateDataList(isAPICall, data, callback) {
    return (dispatch) => {
        if (isAPICall) {
            dispatch({ type: API_REQUEST });
            let queryParams = `vendor=${data.vendor}&icc_applicability=${data.icc_applicability}&payment_term_applicability=${data.payment_term_applicability}`
            axios.get(`${API.getInterestRateDataList}?${queryParams}`, headers)
                .then((response) => {
                    if (response.data.Result || response.status === 204)
                        dispatch({
                            type: GET_INTEREST_RATE_DATA_LIST,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    callback(response);
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_INTEREST_RATE_DATA_LIST,
                payload: []
            })
        }
    };
}

/**
 * @method getInterestRateData
 * @description GET INTEREST RATE DATA
 */
export function getInterestRateData(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getInterestRateData}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_INTEREST_RATE_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    }
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_INTEREST_RATE_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteInterestRate
 * @description DELETE INTEREST RATE
 */
export function deleteInterestRate(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteInterestRate}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateInterestRate
 * @description UPDATE INTEREST RATE
 */
export function updateInterestRate(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateInterestRate}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getPaymentTermsAppliSelectList
 * @description GET PAYMENT TERMS APPLICABILITY SELECTLIST
 */
export function getPaymentTermsAppliSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPaymentTermsAppliSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getICCAppliSelectList
 * @description GET ICC APPLICABILITY SELECTLIST
 */
export function getICCAppliSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getICCAppliSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ICC_APPLICABILITY_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadInterestRateZBC
 * @description BULK UPLOAD FOR INTEREST RATE ZBC
 */
export function bulkUploadInterestRateZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadInterestRateZBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method bulkUploadInterestRateVBC
 * @description BULK UPLOAD FOR INTEREST RATE ZBC
 */
export function bulkUploadInterestRateVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadInterestRateVBC, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}