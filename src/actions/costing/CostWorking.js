import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_WEIGHT_CALC_INFO_SUCCESS,
    CREATE_WEIGHT_CALC_COSTING_SUCCESS,
    UPDATE_WEIGHT_CALC_SUCCESS,
    GET_WEIGHT_CALC_LAYOUT_SUCCESS,
    GET_COSTING_BY_SUPPLIER_SUCCESS,
    GET_RM_LIST_BY_SUPPLIER_SUCCESS,
    ADD_RAW_MATERIAL_COSTING_SUCCESS,
    CREATE_SHEETMETAL_COSTING_SUCCESS,
    GET_COSTING_DATA_SUCCESS,
    UPDATE_COSTING_RM_SUCCESS,
    GET_BOP_LIST_SUCCESS,
    ADD_BOP_COSTING_SUCCESS,
    GET_OTHER_OPERATION_LIST_SUCCESS,
    ADD_OTHER_OPERATION_COSTING_SUCCESS,
    ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
    GET_MHR_LIST_SUCCESS,
    ADD_MHR_FOR_PROCESS_GRID_DATA,
    GET_PROCESSES_LIST_SUCCESS,
    SAVE_PROCESS_COSTING_SUCCESS,
    GET_OTHER_OPERATION_SELECT_LIST_SUCCESS,
    SAVE_OTHER_OPERATION_COSTING_SUCCESS,
    ADD_PROCESS_COSTING_SUCCESS,
    GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method getWeightCalculationCosting
 * @description Get Weight Calculation Costing details
 */
export function getWeightCalculationCosting(CostingId = '', callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getWeightCalculationInfo}/${CostingId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_WEIGHT_CALC_INFO_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getWeightCalculationLayoutType
 * @description Get Weight Calculation layout type radio button details
 */
export function getWeightCalculationLayoutType(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getWeightCalculationLayoutType}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_WEIGHT_CALC_LAYOUT_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method createWeightCalculationCosting
 * @description Create Weight Calculation Costing
 */
export function createWeightCalculationCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.AddCostingWeightCalculation, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_WEIGHT_CALC_COSTING_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method updateWeightCalculationCosting
 * @description Update Weight Calculation Costing
 */
export function updateWeightCalculationCosting(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.UpdateCostingWeightCalculation}`, requestData, headers)
            .then((response) => {
                dispatch({ type: UPDATE_WEIGHT_CALC_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getCostingBySupplier(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCostingBySupplier}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COSTING_BY_SUPPLIER_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getRawMaterialListBySupplierId(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRawMaterialListBySupplierId}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RM_LIST_BY_SUPPLIER_SUCCESS,
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

/*
 * @method createNewCosting
 * @description Create new costing for selected supplier
 */
export function createNewCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createNewCosting, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_SHEETMETAL_COSTING_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method createBOMAPI
 * @description create bill of material master
 */
export function addCostingRawMaterial(data, selectedIndex, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.addCostingRawMaterial, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: ADD_RAW_MATERIAL_COSTING_SUCCESS,
                    payload: data,
                    selectedIndex: selectedIndex,
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method getCostingDetailsById
 * @description get costing details by id
 */
export function getCostingDetailsById(costingId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getCostingDetailsById}/${costingId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_COSTING_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        // Empty data in costing edit case by clicked on list
                        // dispatch({
                        //     type: ADD_RAW_MATERIAL_COSTING_SUCCESS,
                        //     payload: {},
                        // });
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
                type: GET_COSTING_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method updateBOPAPI
 * @description update BOP
 */
export function updateCostingRawMatrial(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCostingRawMatrial}`, requestData, headers)
            .then((response) => {
                dispatch({ type: UPDATE_COSTING_RM_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getBoughtOutPartList(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBoughtOutPartList}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_BOP_LIST_SUCCESS,
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
 * @method addCostingBoughtOutPart
 * @description add bought out part to costing
 */
export function addCostingBoughtOutPart(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.addCostingBoughtOutPart, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: ADD_BOP_COSTING_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getOtherOperationList(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherOperationList}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_OPERATION_LIST_SUCCESS,
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
 * @method addCostingOtherOperation
 * @description add other operation to costing
 */
export function addCostingOtherOperation(costingId, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.get(`${API.addCostingOtherOperation}/${costingId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: ADD_OTHER_OPERATION_COSTING_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method addCostingUnitOtherOperationData
 * @description add unit other operation to costing
 */
export function addCostingUnitOtherOperationData(data, selectedIndex, callback) {
    return (dispatch) => {
        dispatch({
            type: ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
            payload: data,
            selectedIndex: selectedIndex
        });
        callback();
    }
}


/**
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getMHRCostingList(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMHRCostingList}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MHR_LIST_SUCCESS,
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
 * @method addCostingUnitOtherOperationData
 * @description add unit other operation to costing
 */
export function addMHRForProcess(data, callback) {
    return (dispatch) => {
        dispatch({
            type: ADD_MHR_FOR_PROCESS_GRID_DATA,
            payload: data,
        });
        callback();
    }
}

/**
 * @method getProcessesSelectList
 * @description Get Processes select list in process grid
 */
export function getProcessesSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getProcessesSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PROCESSES_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method saveProcessCosting
 * @description save Process Costing
 */
export function saveProcessCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.saveProcessCosting, data, headers);
        request.then((response) => {
            console.log("response success >>>>>", response)
            if (response.data.Result) {
                dispatch({
                    type: SAVE_PROCESS_COSTING_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method addCostingProcesses
 * @description add process to costing
 */
export function addCostingProcesses(costingId, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.get(`${API.addCostingProcesses}/${costingId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: ADD_PROCESS_COSTING_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method getOtherOpsSelectList
 * @description Get Processes select list in process grid
 */
export function getOtherOpsSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherOpsSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_OPERATION_SELECT_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method saveOtherOpsCosting
 * @description save Other operation Costing
 */
export function saveOtherOpsCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.saveOtherOpsCosting, data, headers);
        request.then((response) => {
            console.log("response success >>>>>", response)
            if (response.data.Result) {
                dispatch({
                    type: SAVE_OTHER_OPERATION_COSTING_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
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
 * @method fetchMasterDataAPI
 * @description fetch UOM and material type list
 */
export function getMaterialTypeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getMaterialTypeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_MATERIAL_DATA_SELECTLIST_SUCCESS,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}