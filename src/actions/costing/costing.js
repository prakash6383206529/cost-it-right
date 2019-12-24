import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_PLANT_COMBO_SUCCESS,
    GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
    CREATE_PART_WITH_SUPPLIER_SUCCESS,
    GET_COSTING_BY_COSTINGID,
    GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
    SET_CED_ROW_DATA_TO_COST_SUMMARY,
    SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY,
    SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
    GET_FREIGHT_HEAD_SUCCESS,
    GET_FREIGHT_AMOUNT_DATA_SUCCESS
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method getPlantCombo
 * @description get all plant list
 */
export function getPlantCombo(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantCombo}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_COMBO_SUCCESS,
                    payload: response.data.DynamicData,
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
export function getExistingSupplierDetailByPartId(partId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getExistingSupplierDetailByPartId}/${partId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                console.log("action iffffffffff", response.data.Result)
                dispatch({
                    type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                console.log("action elseeeeeeeeeeee", response.data.Result)
                dispatch({
                    type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
                    payload: null,
                });
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({
                type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
                payload: null,
            });
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}



/**
 * @method createPartWithSupplier
 * @description create part with supplier
 */
export function createPartWithSupplier(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createPartWithSupplier, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                toastr.success(MESSAGES.ADD_PART_WITH_SUPPLIER_SUCCESS);
            }
            callback(response);
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}


/**
 * @method createFreightAPI
 * @description create freight master
 */
export function checkPartWithTechnology(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.checkPartWithTechnology, data, headers);
        request.then((response) => {
            if (response.data.Result) {
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
 * @method getCostingByCostingId
 * @description get costing by costingId
 */
export function getCostingByCostingId(costingId, supplier, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCostingByCostingId}/${costingId}`, headers);
        request.then((response) => {
            console.log('res >>>>>>>>>>', response)
            if (response.data.Result) {
                dispatch({
                    type: GET_COSTING_BY_COSTINGID,
                    payload: response.data.Data,
                    supplier: supplier,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            //callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method getCostSummaryOtherOperation
 * @description get all other operation for cost summary 
 */
export function getCostSummaryOtherOperation(supplierId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCostSummaryOtherOperationList}/${supplierId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
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
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setRowDataCEDOtherOps(supplier, data, callback) {
    return (dispatch) => {
        dispatch({
            type: SET_CED_ROW_DATA_TO_COST_SUMMARY,
            payload: data,
            supplierColumn: supplier,
        });
        callback();
    };
}

/**
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setRowDataFreight(supplier, data, callback) {
    return (dispatch) => {
        dispatch({
            type: SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY,
            payload: data,
            supplierColumn: supplier,
        });
        callback();
    };
}

/**
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setInventoryRowData(supplierColumn, data) {
    return (dispatch) => {
        dispatch({
            type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
            payload: data,
            supplierColumn: supplierColumn,
        });
    };
}

/**
 * @method getCostingOverHeadProByModelType
 * @description get overhead type by model type
 */
export function getCostingOverHeadProByModelType(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.getCostingOverHeadProByModelType, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                // console.log("ressssss", response)
                // dispatch({
                //     type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
                //     payload: response.data.Data,
                // });
                callback(response.data.Data);
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
 * @method saveCosting
 * @description save Costing
 */
export function saveCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.saveCosting, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                console.log("ressssss", response)
                // dispatch({
                //     type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
                //     payload: response.data.Data,
                // });
                callback(response);
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
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function fetchFreightHeadsAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.fetchFreightHeadsAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FREIGHT_HEAD_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getCostingFreight
 * @description Used to fetch costing heads
 */
export function getCostingFreight(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(`${API.getCostingFreight}`, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FREIGHT_AMOUNT_DATA_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}