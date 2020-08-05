import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_FUEL_SUCCESS,
    CREATE_FUEL_DETAIL_FAILURE,
    CREATE_FUEL_DETAIL_SUCCESS,
    CREATE_FUEL_FAILURE,
    GET_FUEL_DATALIST_SUCCESS,
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS,
    GET_FULE_COMBO_SUCCESS,
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../../config/message';

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method createFuel
 * @description create fuel
 */
export function createFuel(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFuel, data, headers);
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
 * @method createFuelDetail
 * @description create fuel detail 
 */
export function createFuelDetail(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFuelDetail, data, headers);
        request.then((response) => {
            if (response && response.data && response.data.Result) {
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
 * @method updateFuelDetail
 * @description File update Fuel Detail
 */
export function updateFuelDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updateFuelDetail, data, headers);
        request.then((response) => {
            if (response && response.status == 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFuelDetailDataList
 * @description create fuel detail list
 */
export function getFuelDetailDataList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getFuelDetailDataList, headers);
        request.then((response) => {
            if (response && response.status == 200) {
                dispatch({
                    type: GET_FUEL_DATALIST_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getFuelAPI
 * @description create fuel list
 */
export function getFuelAPI() {
    return (dispatch) => {
        const request = axios.get(API.getAllFuelAPI, headers);
        request.then((response) => {
            dispatch({
                type: GET_FUEL_DETAIL_SUCCESS,
                payload: response.data.DataList,
            });
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getOneUnitOfMeasurementAPI
 * @description get one UOM based on id
 */
export function getFuelUnitAPI(fuelId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getFuelAPI}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
                    }
                    callback(response);
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getFuelDetailData
 * @description get Fuel Detail Data
 */
export function getFuelDetailData(fuelId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (fuelId != '') {
            axios.get(`${API.getFuelDetailData}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
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
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deleteFuelDetailAPI(index, Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelDetailAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deleteFuelTypeAPI(index, Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getFuelComboData
 * @description USED TO GET FUEL COMBO DATA
 */
export function getFuelComboData(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelComboData}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FULE_COMBO_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fuelBulkUpload
 * @description create Fuel by Bulk Upload
 */
export function fuelBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fuelBulkUpload, data, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}