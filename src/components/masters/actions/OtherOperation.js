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
    GET_OPERATION_COMBINED_DATA_LIST,
    GET_ALL_OPERATION_COMBINED_DATA_LIST,
    GET_OPERATION_APPROVAL_LIST,
    SET_OPERATION_DATA,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { loggedInUserId, userDetails } from '../../../helper';

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

    return (dispatch) => {

        let payload
        //dispatch({ type: API_REQUEST });
        const QueryParams = `operation_for=${filterData.operation_for}&technology_id=${filterData.technology_id}&ListFor=${filterData.ListFor ? filterData.ListFor : ''}&StatusId=${filterData.StatusId ? filterData.StatusId : ''}&OperationType=${filterData.OperationType}&DepartmentCode=`
        const queryParamsSecond = `CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.Technology !== undefined ? obj.Technology : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&Plant=${obj.Plants !== undefined ? obj.Plants : ""}&OperationName=${obj.OperationName !== undefined ? obj.OperationName : ""}&OperationCode=${obj.OperationCode !== undefined ? obj.OperationCode : ""}&UOM=${obj.UnitOfMeasurement !== undefined ? obj.UnitOfMeasurement : ""}&Rate=${obj.Rate !== undefined ? obj.Rate : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? obj.EffectiveDate : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&IsCustomerDataShow=${obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false}`
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
export function deleteOperationAPI(OperationId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteOperationAPI}/${OperationId}`, config())
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
        const request = axios.post(API.fileUploadOperation, data, config());
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
        const request = axios.post(`${API.checkAndGetOperationCode}?operationCode=${code}&operationName=${name}`, '', config());
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
        axios.delete(`${API.fileDeleteOperation}/${data.Id}/${data.DeletedBy}`, config())
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
 * @method getOperationSelectList
 * @description get all operation list
 */
export function getOperationSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getOperationSelectList, config())
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
export function getVendorWithVendorCodeSelectList(vendorName, callback) {
    return axios.get(`${API.getVendorWithVendorCodeSelectList}?vendorName=${vendorName}`, config());

}

/**
* @method getTechnologySelectList
* @description OPERATION FILTER TECHNOLOGY SELECTLIST INITIAL
*/
export function getTechnologySelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getTechnologySelectList}`, config());
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
        const request = axios.get(`${API.getVendorListByTechnology}/${ID}`, config());
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
        const request = axios.get(`${API.getOperationListByTechnology}/${ID}`, config());
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
        const request = axios.get(`${API.getTechnologyListByOperation}/${ID}`, config());
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
        const request = axios.get(`${API.getVendorListByOperation}/${ID}`, config());
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
        const request = axios.get(`${API.getTechnologyListByVendor}/${ID}`, config());
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
        const request = axios.get(`${API.getOperationListByVendor}/${ID}`, config());
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
        const request = axios.post(API.operationZBCBulkUpload, data, config());
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
 * @method operationVBCBulkUpload
 * @description create VBC Opration by Bulk Upload
 */
export function operationVBCBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.operationVBCBulkUpload, data, config());
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
 * @method operationCBCBulkUpload
 * @description create CBC Opration by Bulk Upload
 */
export function operationCBCBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.operationCBCBulkUpload, data, config());
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
 * @method masterApprovalRequestBySenderOperation
 * @description When sending Operation for approval for the first time
 * 
 */
export function masterApprovalRequestBySenderOperation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.masterSendToApproverOperation, data, config())
        request.then((response) => {
            if (response.data.Result) {
                callback(response)
            } else {
                dispatch({ type: API_FAILURE })
                if (response.data.Message) {
                    Toaster.error(response.data.Message)
                }
            }
        }).catch((error) => {
            callback(error)
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


/*
@method getOperationApprovalList

**/
export function getOperationApprovalList(callback) {

    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOperationApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}&masterId=3`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                //
                dispatch({
                    type: GET_OPERATION_APPROVAL_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                    // payload: JSON.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error)
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