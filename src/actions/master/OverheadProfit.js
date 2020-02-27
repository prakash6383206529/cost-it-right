import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_OVERHEAD_PROFIT_SUCCESS,
    GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
    GET_OVERHEAD_PROFIT_DATA_SUCCESS,
    CREATE_SUCCESS,
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
export function getOverheadProfitAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getOverheadProfitAPI, { headers })
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_OVERHEAD_PROFIT_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
                callback(error);
                apiErrors(error);
            });
    };
}


/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getOverheadProfitComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOverheadProfitComboDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
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
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createOverheadProfitAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: API_REQUEST
        });
        const request = axios.post(API.createOverheadProfitAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_SUCCESS,
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
 * @method getOverheadProfitDataAPI
 * @description Get Overhead and Profit data
 */
export function getOverheadProfitDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID != '') {
            axios.get(`${API.getOverheadProfitDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
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
                type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteOverheadProfitAPI
 * @description delete Overhead and Profit
 */
export function deleteOverheadProfitAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteOverheadProfitAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateOverheadProfitAPI
 * @description update Overhead and Profit details
 */
export function updateOverheadProfitAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateOverheadProfitAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}