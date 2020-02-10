import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_SUCCESS,
    GET_INTEREST_RATE_COMBO_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_INTEREST_RATE_DATA_SUCCESS
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
 * @method getInterestRateAPI
 * @description get all operation list
 */
export function getInterestRateAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getAllInterestRateAPI, { headers })
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: GET_INTEREST_RATE_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                }
                // else if (response.status == 204) {
                //     toastr.error(response.statusText);
                // } else {
                //     toastr.error(MESSAGES.SOME_ERROR);
                // }
            }).catch((error) => {
                console.log("interest error", error)
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
export function getInterestRateComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getInterestRateComboDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INTEREST_RATE_COMBO_DATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
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
export function createInterestRateAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: API_REQUEST
        });
        const request = axios.post(API.createInterestRateAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
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
 * @method getInterestRateByIdAPI
 * @description get one interest rate based on id
 */
export function getInterestRateByIdAPI(SupplierInterestRateId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getInterestRateAPI}/${SupplierInterestRateId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_INTEREST_RATE_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    }
                    callback(response);
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_INTEREST_RATE_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteInterestRateAPI
 * @description delete Interest Rate
 */
export function deleteInterestRateAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteInterestRateAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateInterestRateAPI
 * @description update Interest Rate
 */
export function updateInterestRateAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateInterestRateAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}