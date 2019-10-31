import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    DATA_FAILURE,
    GET_MHR_DATA_SUCCESS,
    GET_DEPRICIATION_SUCCESS,
    CREATE_SUCCESS,
    CREATE_FAILURE
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
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createMHRMasterAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: API_REQUEST
        });
        const request = axios.post(API.createMHRMasterAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: CREATE_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method fetchMHRListAPI
 * @description Used to fetch MHR list
 */
export function fetchMHRListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMHRList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MHR_DATA_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method createDepreciationMasterAPI
 * @description create depreciation
 */
export function createDepreciationMasterAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: API_REQUEST
        });
        const request = axios.post(API.createDepreciationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: CREATE_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method getDepreciationDataAPI
 * @description Used get depreciation detail
 */
export function getDepreciationDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getDepreciationAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_DEPRICIATION_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}