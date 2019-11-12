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
    CREATE_SHEETMETAL_COSTING_SUCCESS,
    GET_COSTING_DATA_SUCCESS
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
export function getWeightCalculationCosting(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getWeightCalculationInfo}`, headers);
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