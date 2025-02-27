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
    config,
    GET_OPERATION_COMBINED_DATA_LIST,
    GET_ALL_OPERATION_COMBINED_DATA_LIST,
    SET_OPERATION_DATA,
    GET_OPERATION_SELECTLIST,
} from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { reactLocalStorage } from 'reactjs-localstorage';

// const config() = config

/**
 * @method getUnitOfMeasurementAPI
 * @description get all operation list
 */
export function getOperationsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOtherOperationsAPI, config())
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
        const request = axios.post(API.createOtherOperationAPI, data, config());
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
        axios.delete(`${API.deleteOtherOperationAPI}/${OperationId}`, config())
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
        axios.get(`${API.getOtherOperationDataAPI}/${OtherOperationId}`, config())
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
        axios.put(`${API.updateOtherOperationAPI}`, requestData, config())
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
        const request = axios.post(API.createCEDOtherOperationAPI, data, config());
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
        axios.get(API.getCEDOtherOperationsAPI, config())
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
            axios.get(`${API.getCEDoperationDataAPI}/${ID}`, config())
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
        axios.put(`${API.updateCEDoperationAPI}`, requestData, config())
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
        axios.delete(`${API.deleteCEDotherOperationAPI}/${Id}`, config())
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
export function getOperationsDataList(filterData, skip, take, isPagination, obj, callback) {
    const { cbc, zbc, vbc } = reactLocalStorage.getObject('CostingTypePermission')
    return (dispatch) => {

        let payload
        //dispatch({ type: API_REQUEST });
        // const QueryParams = `operation_for=${filterData.operation_for}&technology_id=${filterData.technology_id}&ListFor=${filterData.ListFor ? filterData.ListFor : ''}&StatusId=${filterData.StatusId ? filterData.StatusId : ''}&OperationType=${obj.ForType}&DepartmentCode=${obj.DepartmentName !== undefined ? obj.DepartmentName : ""}`
        // const queryParamsSecond = `CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.Technology !== undefined ? obj.Technology : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&Plant=${obj.Plants !== undefined ? obj.Plants : ""}&OperationName=${obj.OperationName !== undefined ? obj.OperationName : ""}&OperationCode=${obj.OperationCode !== undefined ? obj.OperationCode : ""}&UOM=${obj.UnitOfMeasurement !== undefined ? obj.UnitOfMeasurement : ""}&Rate=${obj.Rate !== undefined ? obj.Rate : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? "" : obj.EffectiveDate) : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&IsCustomerDataShow=${cbc}&IsVendorDataShow=${vbc}&IsZeroDataShow=${zbc}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}`
        const QueryParams = encodeQueryParamsAndLog({
            operation_for: filterData.operation_for,
            technology_id: filterData.technology_id,
            ListFor: filterData.ListFor ? filterData.ListFor : '',
            StatusId: filterData.StatusId ? filterData.StatusId : '',
            OperationType: obj.ForType,
            DepartmentCode: obj.DepartmentName !== undefined ? obj.DepartmentName : "",
            OperationEntryType: filterData.OperationEntryType
        });
        const queryParamsSecond = encodeQueryParamsAndLog({
            CostingHead: obj.CostingHead !== undefined ? obj.CostingHead : "",
            Technology: obj.Technology !== undefined ? obj.Technology : "",
            Vendor: obj.VendorName !== undefined ? obj.VendorName : "",
            Plant: obj.Plants !== undefined ? obj.Plants : "",
            OperationName: obj.OperationName !== undefined ? obj.OperationName : "",
            OperationCode: obj.OperationCode !== undefined ? obj.OperationCode : "",
            UOM: obj?.UOM !== undefined ? obj?.UOM : "",
            Rate: obj.Rate !== undefined ? obj.Rate : "",
            EffectiveDate: obj.dateArray && obj.dateArray.length > 1 ? "" : obj.EffectiveDate,
            applyPagination: isPagination,
            skip: skip,
            take: take,
            CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '',
            IsCustomerDataShow: cbc,
            IsVendorDataShow: vbc,
            IsZeroDataShow: zbc,
            FromDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : "",
            ToDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : "",
            Currency: obj.Currency !== undefined ? obj.Currency : "",
            ExchangeRateSourceName: obj.ExchangeRateSourceName !== undefined ? obj.ExchangeRateSourceName : "",
            isRequestForPendingSimulation: obj.isRequestForPendingSimulation ? true : false
        });
        axios.get(`${API.getOperationsDataList}?${QueryParams}&${queryParamsSecond}`, config())

            .then((response) => {

                if (response.status === 204 && response.data === '') {
                    payload = []
                } else if (response.status === 412) {
                    payload = []
                }
                else {

                    payload = response?.data?.DataList
                    if (isPagination === true) {
                        dispatch({
                            type: GET_OPERATION_COMBINED_DATA_LIST,
                            payload: payload
                        })
                    } else {

                        dispatch({
                            type: GET_ALL_OPERATION_COMBINED_DATA_LIST,
                            payload: payload
                        })
                    }
                }
                callback(response);
            }).catch((error) => {
                dispatch({ type: GET_CED_OTHER_OPERATION_FAILURE });
                // callback(error);
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
        const request = axios.post(API.createOperationAPI, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_OTHER_OPERATION_FAILURE });
            apiErrors(error);
            callback(error);
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
            axios.get(`${API.getOperationDataAPI}/${OperationId}`, config())
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
        axios.put(`${API.updateOperationAPI}`, requestData, config())
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
 * @method deleteOperationAPI
 * @description delete operation
 */
export function deleteOperationAPI(OperationId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `OperationId=${OperationId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteOperationAPI}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error)
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
        const request = axios.post(API.fileUploadOperation, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error.toString())
        });
    };
}

/**
 * @method checkAndGetOperationCode
 * @description CHECK AND GET OPERATION CODE
 */export function checkAndGetOperationCode(code, name, callback) {
    return (dispatch) => {
        const requestBody = {
            operationName: name,
            operationCode: code
        };
        const request = axios.post(`${API.checkAndGetOperationCode}`, requestBody, config());
        // const request = axios.post(`${API.checkAndGetOperationCode}?operationCode=${code}&operationName=${name}`, '', config());
        request.then((response) => {
            if (response && (response.status === 200 || response.status === 202)) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            if (error.response && error.response.status === 412) {
                // Handle the 412 status code here
                callback(error.response); // Pass the response to the callback function
            } else {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            }
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
        const request = axios.get(`${API.getCEDOtherOperationBySupplierID}/${supplierId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CED_OTHER_OPERATION_BY_SUPPLIER_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
        });
    };
}


/**
 * @method operationBulkUpload
 * @description create ZBC Opration by Bulk Upload
 */
export function operationBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.operationBulkUpload, data, config());
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
 * @method setOperationList
 * @description setOperationList
 */
export function setOperationList(data) {

    return (dispatch) => {
        dispatch({
            type: SET_OPERATION_DATA,
            payload: data
        })
    };
}

export function getOperationPartSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getOperationPartSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OPERATION_SELECTLIST,
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