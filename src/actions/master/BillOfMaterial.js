import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_BOM_SUCCESS,
    CREATE_BOM_FAILURE,
    GET_BOM_SUCCESS,
    UPLOAD_BOM_XLS_SUCCESS,
    GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
    GET_ASSEMBLY_PART_DATALIST_SUCCESS,
    GET_ASSEMBLY_PART_DATA_SUCCESS,
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import {
    MESSAGES
} from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
* @method createBOMAPI
* @description create bill of material master
*/
export function createBOMAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createBOMAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_BOM_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method createNewBOMAPI
* @description create new bill of material for BOM and Part Combination
*/
export function createNewBOMAPI(data, callback) {
    return (dispatch) => {
        // dispatch({ type:  API_REQUEST });
        const request = axios.post(API.createNewBOMAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_BOM_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method getBOMDetailAPI
* @description get BOM detail
*/
export function getBOMDetailAPI(flag, PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (flag) {
            const request = axios.get(`${API.getBOMByPartAPI}/${PartId}`, headers);
            request.then((response) => {
                dispatch({
                    type: GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
* @method getAllBOMAPI
* @description get all bill of material list
*/
export function getAllBOMAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllBOMAPI}`, headers);
        request.then((response) => {
            //if (response.data.Result) {
            dispatch({
                type: GET_BOM_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
            // } else {
            //     toastr.error(MESSAGES.SOME_ERROR);
            // }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method BOM Upload XLS file
* @description Upload BOM xls file to create multiple BOM
*/
export function uploadBOMxlsAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.uploadBOMAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: UPLOAD_BOM_XLS_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method deleteBOMAPI
* @description delete BOM
*/
export function deleteBOMAPI(BomId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOMAPI}/${BomId}`, headers)
            .then((response) => {
                // getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                callback(response);
                // dispatch({ type: DELETE_USER_MEDIA_SUCCESS });
                // });
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method checkCostingExistForPart
* @description Used for check part has costing or not
*/
export function checkCostingExistForPart(PartId, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.checkCostingExistForPart}/${PartId}`, headers);
        request.then((response) => {
            //callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            const response = error ? error.response : undefined;
            callback(response.data.Message);
        });
    };
}

/**
* @method deleteExisCostingByPartID
* @description Used for check part has costing or not
*/
export function deleteExisCostingByPartID(PartId, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.deleteExisCostingByPartID}/${PartId}`, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

// New API for assembly part creation 

/**
* @method createAssemblyPartAPI
* @description create new bill of material for BOM and Part Combination
*/
export function createAssemblyPartAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createAssemblyPartAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: CREATE_BOM_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getAssemblyPartDataListAPI
* @description get all bill of material list
*/
export function getAssemblyPartDataListAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAssemblyPartDataListAPI}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_ASSEMBLY_PART_DATALIST_SUCCESS,
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
* @method getAssemblyPartDetailAPI
* @description get BOM detail
*/
export function getAssemblyPartDetailAPI(PartId, callback) {
    return (dispatch) => {
        if (PartId != '') {
            const request = axios.get(`${API.getAssemblyPartDetailAPI}/${PartId}`, headers);
            request.then((response) => {
                dispatch({
                    type: GET_ASSEMBLY_PART_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_ASSEMBLY_PART_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
* @method updateAssemblyPartAPI
* @description update Assembly Part details
*/
export function updateAssemblyPartAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateAssemblyPartAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method deleteAssemblyPartAPI
* @description delete Assembly Part
*/
export function deleteAssemblyPartAPI(AssemblyPartId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteAssemblyPartAPI}/${AssemblyPartId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}