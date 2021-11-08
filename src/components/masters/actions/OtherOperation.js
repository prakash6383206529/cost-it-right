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
    GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS,
    GET_OPERATION_SELECTLIST_SUCCESS,
    GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
    GET_INITIAL_TECHNOLOGY_SELECTLIST,
    config,
    GET_OPERATION_DATA_LIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = config

/**
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getOperationsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOtherOperationsAPI, headers)
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
        axios.get(API.getCEDOtherOperationsAPI, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_CED_OTHER_OPERATION_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
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
 * @method getCEDoperationDataAPI
 * @description Get CED Other Operation data
 */
export function getCEDoperationDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getCEDoperationDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
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
 * @method updateCEDoperationAPI
 * @description update CED other operation details
 */
export function updateCEDoperationAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCEDoperationAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
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
 * @method getOperationsDataList
 * @description get all operation list
 */
export function getOperationsDataList(filterData, callback) {
    return (dispatch) => {
        let payload
        //dispatch({ type: API_REQUEST });
        const QueryParams = `operation_for=${filterData.operation_for}&operation_Name_id=${filterData.operation_Name_id}&technology_id=${filterData.technology_id}&vendor_id=${filterData.vendor_id}`
        axios.get(`${API.getOperationsDataList}?${QueryParams}`, headers)

            .then((response) => {

                if (response.status === 204 && response.data === '') {
                    payload = []
                } else if (response.status === 412) {
                    payload = []
                }
                else {
                    payload = response.data.DataList
                }
                dispatch({
                    type: GET_OPERATION_DATA_LIST,
                    payload: payload
                })
                callback(response);
            }).catch((error) => {
                dispatch({ type: GET_CED_OTHER_OPERATION_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method createOperationsAPI
 * @description create Operation 
 */
export function createOperationsAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: CREATE_OTHER_OPERATION_REQUEST });
        const request = axios.post(API.createOperationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_OTHER_OPERATION_FAILURE });
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
        if (OperationId !== '') {
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
 * @method fileUploadOperation
 * @description File Upload Over Head
 */
export function fileUploadOperation(data, callback) {
    return (dispatch) => {
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.post(API.fileUploadOperation, data, headers);
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
 * @method checkAndGetOperationCode
 * @description CHECK AND GET OPERATION CODE
 */
export function checkAndGetOperationCode(code, name, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.checkAndGetOperationCode}?operationCode=${code}&operationName=${name}`, '', headers);
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
 * @method fileDeleteOperation
 * @description delete Operation file API
 */
export function fileDeleteOperation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteOperation}/${data.Id}/${data.DeletedBy}`, headers)
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

/**
 * @method getOperationSelectList
 * @description get all operation list
 */
export function getOperationSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOperationSelectList, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_OPERATION_SELECTLIST_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: GET_CED_OTHER_OPERATION_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getVendorWithVendorCodeSelectList
 * @description GET VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getVendorWithVendorCodeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getTechnologySelectList
* @description OPERATION FILTER TECHNOLOGY SELECTLIST INITIAL
*/
export function getTechnologySelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTechnologySelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_TECHNOLOGY_SELECTLIST,
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
 * @method getVendorListByTechnology
 * @description get Vendor list by Technology
 */
export function getVendorListByTechnology(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorListByTechnology}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
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
 * @method getOperationListByTechnology
 * @description get Vendor list by Technology
 */
export function getOperationListByTechnology(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getOperationListByTechnology}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OPERATION_SELECTLIST_SUCCESS,
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
 * @method getTechnologyListByOperation
 * @description get Vendor list by Operation
 */
export function getTechnologyListByOperation(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getTechnologyListByOperation}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_TECHNOLOGY_SELECTLIST,
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
 * @method getVendorListByOperation
 * @description get Vendor list by Operation
 */
export function getVendorListByOperation(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorListByOperation}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
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
 * @method getTechnologyListByVendor
 * @description get Technology list by Vendor
 */
export function getTechnologyListByVendor(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getTechnologyListByVendor}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_TECHNOLOGY_SELECTLIST,
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
 * @method getOperationListByVendor
 * @description get Operation list by Vendor
 */
export function getOperationListByVendor(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getOperationListByVendor}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OPERATION_SELECTLIST_SUCCESS,
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
 * @method operationZBCBulkUpload
 * @description create ZBC Opration by Bulk Upload
 */
export function operationZBCBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.operationZBCBulkUpload, data, headers);
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
 * @method operationVBCBulkUpload
 * @description create VBC Opration by Bulk Upload
 */
export function operationVBCBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.operationVBCBulkUpload, data, headers);
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