import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATALIST_SUCCESS,
    GET_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATA_SUCCESS,
    GET_RADIO_SUPPLIER_TYPE_SUCCESS,
    GET_VENDOR_TYPE_SELECTLIST_SUCCESS,
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
 * @method createSupplierAPI
 * @description create supplier master
 */
export function createSupplierAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createSupplierAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_SUPPLIER_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_SUPPLIER_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method getSupplierDataList
 * @description get Supplier's DataList 
 */
export function getSupplierDataList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getAllSupplierAPI, headers);
        request.then((response) => {
            dispatch({
                type: GET_SUPPLIER_DATALIST_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response)
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method getSupplierByIdAPI
 * @description get one labour based on id
 */
export function getSupplierByIdAPI(supplierId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getSupplierAPI}/${supplierId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_SUPPLIER_DATA_SUCCESS,
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
                type: GET_SUPPLIER_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteSupplierAPI
 * @description delete supplier
 */
export function deleteSupplierAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteSupplierAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateSupplierAPI
 * @description update supplier
 */
export function updateSupplierAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateSupplierAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getRadioButtonSupplierType
 * @description get radio button supplier type
 */
export function getRadioButtonSupplierType() {
    return (dispatch) => {
        const request = axios.get(API.getRadioButtonSupplierType, headers);
        request.then((response) => {
            dispatch({
                type: GET_RADIO_SUPPLIER_TYPE_SUCCESS,
                payload: response.data.SelectList,
            });

        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getVendorTypesSelectList
 * @description get radio button supplier type
 */
export function getVendorTypesSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorTypesSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_VENDOR_TYPE_SELECTLIST_SUCCESS,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method activeInactiveVendorStatus
 * @description active Inactive Status
 */
export function activeInactiveVendorStatus(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.activeInactiveVendorStatus}`, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}