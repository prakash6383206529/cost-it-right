import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_FREIGHT_SUCCESS,
    CREATE_FREIGHT_FAILURE,
    GET_FREIGHT_SUCCESS,
    GET_FREIGHT_FAILURE,
    GET_FREIGHT_DATA_SUCCESS,
    GET_FREIGHT_MODE_SELECTLIST,
    GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
    GET_FREIGHT_RATE_CRITERIA_SELECTLIST,
    GET_ALL_ADDITIONAL_FREIGHT_SUCCESS,
    GET_ADDITIONAL_FREIGHT_DATA_SUCCESS,
    GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';

// const config() = config;

/**
 * @method createFreight
 * @description CREATE FREIGHT MASTER
 */
export function createFreight(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFreight, data, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_FREIGHT_SUCCESS,
                    payload: response.data.Data
                });
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
 * @method getFreightDataList
 * @description GET FREIGHT DATALIST
 */
export function getFreightDataList(filterData, callback) {
    return (dispatch) => {
        const queryParams = `freight_for=${filterData.freight_for}&vendor_id=${filterData.vendor_id}&source_city_id=${filterData.source_city_id}&destination_city_id=${filterData.destination_city_id}&IsCustomerDataShow=${filterData?.IsCustomerDataShow}&IsVendorDataShow=${filterData?.IsVendorDataShow}&IsZeroDataShow=${filterData?.IsZeroDataShow}&FreightEntryType=${filterData?.FreightEntryType}`
        const request = axios.get(`${API.getFreightDataList}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204)
                dispatch({
                    type: GET_FREIGHT_SUCCESS,
                    payload: response.status === 204 ? [] : response.data.DataList,
                });
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFreightData
 * @description GET FREIGHT DATA
 */
export function getFreightData(freightId, callback) {
    return (dispatch) => {
        if (freightId !== '') {
            dispatch({ type: API_REQUEST });
            axios.get(`${API.getFreightData}/${freightId}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_FREIGHT_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_FREIGHT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteFright
 * @description DELETE FREIGHT
 */
export function deleteFright(freightId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `freightId=${freightId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteFright}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateFright
 * @description UPDATE FREIGHT
 */
export function updateFright(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateFright}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method getFreightModeSelectList
 * @description GET FREIGHT MODE SELECTLIST
 */
export function getFreightModeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getFreightModeSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_FREIGHT_MODE_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFreigtFullTruckCapacitySelectList
 * @description GET FREIGHT FULL TRUCK CAPACITY SELECTLIST
 */
export function getFreigtFullTruckCapacitySelectList() {
    return (dispatch) => {
        const request = axios.get(API.getFreigtFullTruckCapacitySelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFreigtRateCriteriaSelectList
 * @description GET FREIGHT RATE CRITERIA SELECTLIST
 */
export function getFreigtRateCriteriaSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getFreigtRateCriteriaSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_FREIGHT_RATE_CRITERIA_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


/** **************Below API/Action for additional freight's ***************** */

/**
 * @method createAdditionalFreightAPI
 * @description create additional freight master
 */
export function createAdditionalFreightAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAdditionalFreightAPI, data, config());
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
 * @method getAdditionalFreightDetailAPI
 * @description get Additional freight list
 */
export function getAllAdditionalFreightAPI(callback) {
    return (dispatch) => {
        const request = axios.get(API.getAllAdditionalFreightAPI, config());
        request.then((response) => {
            dispatch({
                type: GET_ALL_ADDITIONAL_FREIGHT_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({
                type: GET_FREIGHT_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method getFreightByIdAPI
 * @description get one freight based on id
 */
export function getAdditionalFreightByIdAPI(Id, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getAdditionalFreightByIdAPI}/${Id}`, config())
            .then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_ADDITIONAL_FREIGHT_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response);
                } else {
                    Toaster.error(MESSAGES.SOME_ERROR);
                }
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method deleteAdditionalFreightAPI
 * @description delete Additional Freight
 */
export function deleteAdditionalFreightAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteAdditionalFreightAPI}/${Id}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateAdditionalFreightByIdAPI
 * @description update Additonal Freight
 */
export function updateAdditionalFreightByIdAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateAdditionalFreightByIdAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createFreightAPI
 * @description create freight master
 */
export function getAdditionalFreightBySupplier(sourceSupplierId, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.getAdditionalFreightBySupplier}?sourceSupplierId=${sourceSupplierId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_FREIGHT_FAILURE });
                if (response.data.Message) {
                    Toaster.warning(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            //apiErrors(error);
            callback(error);
        });
    };
}