import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_DATA_SUCCESS,
    GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
    GET_ICC_APPLICABILITY_SELECTLIST,
    GET_INTEREST_RATE_DATA_LIST,
    config,
    GET_WIP_COMPOSITION_METHOD_SELECTLIST,
    GET_INVENTORYDAY_TYPE_SELECTLIST,
    GET_ICC_METHOD_SELECTLIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';

// const config() = config

/**
 * @method createInterestRate
 * @description CREATE INTEREST RATE
 */
export function createInterestRate(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createInterestRate, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
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
            let queryParams = `loggedInUserId=${loggedInUserId()}&vendor=${data.vendor}&icc_applicability=${data.icc_applicability}&payment_term_applicability=${data.payment_term_applicability}&RawMaterialName=${data.RawMaterialName !== undefined ? data.RawMaterialName : ''}&RawMaterialGrade=${data.RawMaterialGrade !== undefined ? data.RawMaterialGrade : ''}&TechnologyName=${data.TechnologyName !== undefined ? data.TechnologyName : ''}&IsCustomerDataShow=${data?.IsCustomerDataShow !== undefined ? data?.IsCustomerDataShow : ""}&IsVendorDataShow=${data?.IsVendorDataShow}&IsZeroDataShow=${data?.IsZeroDataShow}&isPaymentTermsRecord=${data?.isPaymentTermsRecord}`
            axios.get(`${API.getInterestRateDataList}?${queryParams}`, config())
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
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getInterestRateData}/${ID}/${loggedInUser?.loggedInUserId}`, config())
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
export function deleteInterestRate(vendorIntrestRateId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `vendorIntrestRateId=${vendorIntrestRateId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteInterestRate}?${queryParams}`, config())
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
    const requestedData = { LoggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateInterestRate}`, requestedData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
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
        const request = axios.get(`${API.getPaymentTermsAppliSelectList}`, config());
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
 * @method getInventoryDayTypeSelectList
 * @description GET INVENTORY DAY TYPE SELECTLIST
 */
export function getInventoryDayTypeSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getInventoryDayTypeSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INVENTORYDAY_TYPE_SELECTLIST,
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
 * @method getWipCompositionMethodList
 * @description GET INVENTORY DAY TYPE SELECTLIST
 */
export function getWipCompositionMethodList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getWipCompositionMethodList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_WIP_COMPOSITION_METHOD_SELECTLIST,
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
        const request = axios.get(`${API.getICCAppliSelectList}`, config());
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
 * @method getICCMethodSelectList
 * @description GET ICC METHOD SELECTLIST
 */
export function getICCMethodSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getICCMethodSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ICC_METHOD_SELECTLIST,
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
        const request = axiosInstance.post(API.bulkUploadInterestRateZBC, data, config());
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
 * @description BULK UPLOAD FOR INTEREST RATE CBC
 */
export function bulkUploadInterestRateVBC(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadInterestRateVBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method bulkUploadInterestRateCBC
 * @description BULK UPLOAD FOR INTEREST RATE CBC
 */
export function bulkUploadInterestRateCBC(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadInterestRateCBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}


/**
 * @method bulkUploadInterestRate
 * @description BULK UPLOAD FOR INTEREST RATE CBC
 */
export function bulkUploadInterestRate(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadInterestRate, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}