import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATALIST_SUCCESS,
    GET_SUPPLIER_DATA_SUCCESS,
    GET_RADIO_SUPPLIER_TYPE_SUCCESS,
    GET_VENDOR_TYPE_SELECTLIST_SUCCESS,
    GET_ALL_VENDOR_SELECTLIST_SUCCESS,
    GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
    GET_ALL_SUPPLIER_DATALIST_SUCCESS,
    GET_VENDOR_TYPE_BOP_SELECTLIST,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';

// const config() = config

/**
 * @method createSupplierAPI
 * @description create supplier master
 */
export function createSupplierAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createSupplierAPI, data, config());
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
                    Toaster.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method getSupplierDataList
 * @description get Supplier's DataList 
 */
export function getSupplierDataList(skip, obj, take, isPagination, callback) {
    return (dispatch) => {

        var queryParams = `isApplyPagination=${isPagination}`;
        var queryParams2 = `take=${take}`
        var queryParams1 = `skip=${skip}`
        const QueryParams = `vendorType=${obj.VendorType !== null && obj.VendorType !== undefined ? obj.VendorType : ""}&vendorName=${obj.VendorName != null && obj.VendorName !== undefined ? obj.VendorName : ""}&country=${obj.Country != null || obj.Country !== "" ? obj.Country : ""}&vendorCode=${obj.VendorCode !== null || obj.VendorCode !== "" ? obj.VendorCode : ""}&city=${obj.City !== null || obj.City !== "" ? obj.City : ""}&state=${obj.State !== null || obj.State !== "" ? obj.State : ""} `
        const request = axios.get(`${API.getAllSupplierAPI}?${queryParams}&${queryParams1}&${queryParams2}&${QueryParams}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                if (isPagination === true) {
                    dispatch({
                        type: GET_SUPPLIER_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList,
                    });
                } else {
                    dispatch({
                        type: GET_ALL_SUPPLIER_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList,
                    });
                }
            }
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
            axios.get(`${API.getSupplierAPI}/${supplierId}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_SUPPLIER_DATA_SUCCESS,
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
        axios.delete(`${API.deleteSupplierAPI}/${Id}`, config())
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
        axios.put(`${API.updateSupplierAPI}`, requestData, config())
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
 * @method getRadioButtonSupplierType
 * @description get radio button supplier type
 */
export function getRadioButtonSupplierType() {
    return (dispatch) => {
        const request = axios.get(API.getRadioButtonSupplierType, config());
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
 * @method activeInactiveVendorStatus
 * @description active Inactive Status
 */
export function activeInactiveVendorStatus(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.activeInactiveVendorStatus}`, requestData, config())
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method vendorBulkUpload
 * @description create Vendor by Bulk Upload
 */
export function vendorBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.vendorBulkUpload, data, config());
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
 * @method getVendorTypesSelectList
 * @description GET VENDOR TYPE SELECTLIST
 */
export function getVendorTypesSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorTypesSelectList, config());
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
 * @method getAllVendorSelectList
 * @description GET ALL VENDORS SELECTLIST
 */
export function getAllVendorSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_ALL_VENDOR_SELECTLIST_SUCCESS,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getVendorsByVendorTypeID
 * @description GET VENDOR SELECTLIST BY VENDOR TYPE
 */
export function getVendorsByVendorTypeID(VendorID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getVendorsByVendorTypeID}/${VendorID}`, config())
            .then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_ALL_VENDOR_SELECTLIST_SUCCESS,
                        payload: response.data.SelectList,
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
 * @method getVendorTypeByVendorSelectList
 * @description GET ALL VENDORS TYPE SELECTLIST BY VENDOR
 */
export function getVendorTypeByVendorSelectList(VendorId) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorTypeByVendorSelectList}/${VendorId}`, config());
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
 * @method getVendorWithVendorCodeSelectList
 * @description GET VBC VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getVendorWithVendorCodeSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
                payload: response.data.SelectList,
            });
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getVendorTypeBOPSelectList
 * @description GET BOP TYPE VENDOR'S SELECTLIST
 */
export function getVendorTypeBOPSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getVendorTypeBOPSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_TYPE_BOP_SELECTLIST,
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