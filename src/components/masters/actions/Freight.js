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
    GET_TRUCK_DIMENSIONS_SELECTLIST,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper';

// const config() = config;

/**
 * @method createFreight
 * @description CREATE FREIGHT MASTER
 */
export function createFreight(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createFreight, data, config());
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
        const queryParams = `loggedInUserId=${loggedInUserId()}&freight_for=${filterData.freight_for}&vendor_id=${filterData.vendor_id}&source_city_id=${filterData.source_city_id}&destination_city_id=${filterData.destination_city_id}&IsCustomerDataShow=${filterData?.IsCustomerDataShow}&IsVendorDataShow=${filterData?.IsVendorDataShow}&IsZeroDataShow=${filterData?.IsZeroDataShow}&FreightEntryType=${filterData?.FreightEntryType}`
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
export function getFreightData(data, callback) {   
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getFreightData}?freightId=${data?.freightId??null}&freightEntryType=${data?.entryType??null}&costingTypeId=${data?.CostingTypeId??null}&plantId=${data?.PlantId??null}&customerId=${data?.CustomerId??null}&vendorId=${data?.VendorId??null}&effectiveDate=${data?.EffectiveDate ? DayTime(data?.EffectiveDate).format('YYYY-MM-DD') : null}&currencyId=${data?.currencyId??null}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config())
            .then((response) => {
                if (response) {
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

        dispatch({
            type: GET_FREIGHT_DATA_SUCCESS,
            payload: {},
        });
        callback();
    }
};


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
        axiosInstance.put(`${API.updateFright}`, requestData, config())
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
export function getFreigtRateCriteriaSelectList(plantId) {
    return (dispatch) => {
        const queryParams = `?plantId=${plantId}`
        const request = axios.get(`${API.getFreigtRateCriteriaSelectList}${queryParams}`, config());
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
        const request = axiosInstance.post(API.createAdditionalFreightAPI, data, config());
        request.then((response) => {
            if (response.data.Result) {
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
 * @method getAdditionalFreightDetailAPI
 * @description get Additional freight list
 */
export function getAllAdditionalFreightAPI(callback) {
    const queryParams = { LoggedInUserId: loggedInUserId() }
    return (dispatch) => {
        const request = axios.get(`${API.getAllAdditionalFreightAPI}?${queryParams}`, config());
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
        axiosInstance.put(`${API.updateAdditionalFreightByIdAPI}`, requestData, config())
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
        const loggedInUser = { loggedInUserId: loggedInUserId() }
        const request = axiosInstance.post(`${API.getAdditionalFreightBySupplier}?sourceSupplierId=${sourceSupplierId}&loggedInUserId=${loggedInUser?.loggedInUserId}`, config());
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
/**
 * @method getTruckDimensionsSelectList
 * @description GET TRUCK DIMENSIONS SELECTLIST
 */
export function getTruckDimensionsSelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(API.getTruckDimensionsSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_TRUCK_DIMENSIONS_SELECTLIST,
                payload: response.data.DataList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method saveAndUpdateTruckDimensions 
 * @description SAVE OR UPDATE TRUCK DIMENSIONS
 */
export function saveAndUpdateTruckDimensions(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.post(API.saveTruckDimensions, requestData, config())
            .then((response) => {
                if (response) {
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
 * @method getTruckDimensionsById
 * @description GET TRUCK DIMENSIONS BY ID
 */
export function getTruckDimensionsById(dimensionsId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTruckDimensionsById}?dimensionsId=${dimensionsId}`, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

