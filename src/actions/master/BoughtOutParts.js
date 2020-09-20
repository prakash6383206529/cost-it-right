import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_BOP_DOMESTIC_DATA_SUCCESS,
    GET_BOP_IMPORT_DATA_SUCCESS,
    GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method createBOPAPI
 * @description create baught out parts master
 */
export function createBOPDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPDomestic, data, headers);
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
 * @method createBOPImport
 * @description create BOP Import
 */
export function createBOPImport(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPImport, data, headers);
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
 * @method getBOPDomesticDataList
 * @description get all BOP Domestic Data list.
 */
export function getBOPDomesticDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `bop_for=${data.bop_for}&category_id=${data.category_id}&vendor_id=${data.vendor_id}&plant_id=${data.plant_id}`
        const request = axios.get(`${API.getBOPDomesticDataList}/${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getBOPImportDataList
 * @description get all BOP Import Data list.
 */
export function getBOPImportDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `bop_for=${data.bop_for}&category_id=${data.category_id}&vendor_id=${data.vendor_id}&plant_id=${data.plant_id}`
        const request = axios.get(`${API.getBOPImportDataList}/${queryParams}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getBOPDomesticById
 * @description get one bought out part based on id
 */
export function getBOPDomesticById(bopId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (bopId !== '') {
            axios.get(`${API.getBOPDomesticById}/${bopId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_BOP_DOMESTIC_DATA_SUCCESS,
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
                type: GET_BOP_DOMESTIC_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method getBOPImportById
 * @description get one bought out part based on id
 */
export function getBOPImportById(bopId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (bopId !== '') {
            axios.get(`${API.getBOPImportById}/${bopId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_BOP_IMPORT_DATA_SUCCESS,
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
                type: GET_BOP_IMPORT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteBOPAPI
 * @description delete BOP
 */
export function deleteBOPAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOPAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateBOPDomestic
 * @description update BOP Domestic
 */
export function updateBOPDomestic(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateBOPDomestic}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateBOPImport
 * @description update BOP Import
 */
export function updateBOPImport(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateBOPImport}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method createBOPCategory
 * @description create BOP Category
 */
export function createBOPCategory(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPCategory, data, headers);
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
 * @method getBOPCategorySelectList
 * @description Used to fetch BOP Category selectlist
 */
export function getBOPCategorySelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOPCategorySelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}