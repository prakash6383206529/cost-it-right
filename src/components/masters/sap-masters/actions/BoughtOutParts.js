import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_BOP_DOMESTIC_DATA_SUCCESS,
    GET_BOP_IMPORT_DATA_SUCCESS,
    GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
    GET_ALL_VENDOR_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_BY_VENDOR,
    config
} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';

const headers = config

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
        const request = axios.get(`${API.getBOPDomesticDataList}?${queryParams}`, headers);
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
        const request = axios.get(`${API.getBOPImportDataList}?${queryParams}`, headers);
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
 * @method deleteBOP
 * @description delete BOP
 */
export function deleteBOP(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOP}/${Id}`, headers)
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

/**
 * @method getAllVendorSelectList
 * @description GET ALL VENDORS SELECTLIST
 */
export function getAllVendorSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getAllVendorSelectList, headers);
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
* @method getPlantSelectList
* @description Used to get select list of Vendor's
*/
export function getPlantSelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SELECTLIST_SUCCESS,
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

/**
* @method getPlantSelectListByVendor
* @description Used to get select list of Plant by Vendors
*/
export function getPlantSelectListByVendor(VendorId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectListByVendor}/${VendorId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SELECTLIST_BY_VENDOR,
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


/**
 * @method fileUploadBOPDomestic
 * @description File Upload BOP Domestic
 */
export function fileUploadBOPDomestic(data, callback) {
    return (dispatch) => {
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.post(API.fileUploadBOPDomestic, data, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileDeleteBOPDomestic
 * @description delete FILE DELETE API
 */
export function fileDeleteBOPDomestic(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteBOPDomestic}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method bulkUploadBOPDomesticZBC
 * @description upload bulk BOP Domestic ZBC
 */
export function bulkUploadBOPDomesticZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPDomesticZBC, data, headers);
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
 * @method bulkUploadBOPDomesticVBC
 * @description upload bulk BOP Domestic VBC
 */
export function bulkUploadBOPDomesticVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPDomesticVBC, data, headers);
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
 * @method bulkUploadBOPImportZBC
 * @description upload bulk BOP Domestic ZBC
 */
export function bulkUploadBOPImportZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPImportZBC, data, headers);
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
 * @method bulkUploadBOPImportVBC
 * @description upload bulk BOP Domestic VBC
 */
export function bulkUploadBOPImportVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPImportVBC, data, headers);
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