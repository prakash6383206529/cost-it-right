import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_OTHER_OPERATION_SUCCESS,
    GET_UNIT_OTHER_OPERATION_DATA_SUCCESS,
    GET_UNIT_OPERATION_DATA_SUCCESS,
    GET_OTHER_OPERATION_FAILURE,
    CREATE_OTHER_OPERATION_REQUEST,
    CREATE_OTHER_OPERATION_FAILURE,
    CREATE_OTHER_OPERATION_SUCCESS,
    GET_CED_OTHER_OPERATION_SUCCESS,
    GET_CED_OTHER_OPERATION_DATA_SUCCESS,
    GET_CED_OTHER_OPERATION_FAILURE,
    GET_OPERATION_SUCCESS,
    GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS,
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
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getOperationsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOtherOperationsAPI, { headers })
            .then((response) => {
                dispatch({
                    type: GET_OTHER_OPERATION_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: GET_OTHER_OPERATION_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createOtherOperationsAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: CREATE_OTHER_OPERATION_REQUEST });
        const request = axios.post(API.createOtherOperationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_OTHER_OPERATION_SUCCESS,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_OTHER_OPERATION_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method deleteOtherOperationAPI
 * @description delete Other Operation
 */
export function deleteOtherOperationAPI(OperationId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteOtherOperationAPI}/${OperationId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getOtherOperationDataAPI
 * @description Get Other Operation unit operation data
 */
export function getOtherOperationDataAPI(OtherOperationId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getOtherOperationDataAPI}/${OtherOperationId}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_UNIT_OTHER_OPERATION_DATA_SUCCESS,
                        payload: response.data.Data,
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
 * @method updateOtherOperationAPI
 * @description update Other Operation details
 */
export function updateOtherOperationAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateOtherOperationAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createCEDOtherOperationsAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: CREATE_OTHER_OPERATION_REQUEST });
        const request = axios.post(API.createCEDOtherOperationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_OTHER_OPERATION_SUCCESS,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_OTHER_OPERATION_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getCEDOtherOperationsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getCEDOtherOperationsAPI, { headers })
            .then((response) => {
                //if (response.data.Result === true) {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
                // } else {
                //     toastr.error(MESSAGES.SOME_ERROR);
                // }
            }).catch((error) => {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_FAILURE
                });
                callback(error);
                apiErrors(error);
            });
    };
}


/**
 * @method getCEDoperationDataAPI
 * @description Get CED Other Operation data
 */
export function getCEDoperationDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID != '') {
            axios.get(`${API.getCEDoperationDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
                        dispatch({
                            type: GET_CED_OTHER_OPERATION_DATA_SUCCESS,
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
                type: GET_CED_OTHER_OPERATION_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteCEDotherOperationAPI
 * @description delete operation
 */
export function deleteCEDotherOperationAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCEDotherOperationAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getOperationsMasterAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOperationsAPI, { headers })
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_OPERATION_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_FAILURE
                });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createOperationsAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: CREATE_OTHER_OPERATION_REQUEST
        });
        const request = axios.post(API.createOperationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_OTHER_OPERATION_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_OTHER_OPERATION_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: CREATE_OTHER_OPERATION_FAILURE
            });
            apiErrors(error);
        });
    };
}


/**
 * @method getOperationDataAPI
 * @description Get operation unit operation data
 */
export function getOperationDataAPI(OperationId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (OperationId != '') {
            axios.get(`${API.getOperationDataAPI}/${OperationId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UNIT_OPERATION_DATA_SUCCESS,
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
                type: GET_UNIT_OPERATION_DATA_SUCCESS,
                payload: {},
            });
        }
    };
}

/**
 * @method updateOperationAPI
 * @description update Operation details
 */
export function updateOperationAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateOperationAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method deleteOperationAPI
 * @description delete operation
 */
export function deleteOperationAPI(OperationId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteOperationAPI}/${OperationId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getCostSummaryOtherOperation
 * @description get all other operation for cost summary 
 */
export function getCEDOtherOperationBySupplierID(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCEDOtherOperationBySupplierID}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
        });
    };
}