import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_FUEL_SUCCESS,
    CREATE_FUEL_DETAIL_FAILURE,
    CREATE_FUEL_DETAIL_SUCCESS,
    CREATE_FUEL_FAILURE,
    GET_FUEL_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method createFuelAPI
 * @description create fuel
 */
export function createFuelAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createFuelAPI, data,headers);
        request.then((response) => {
            if (response.data.Result) {
                    dispatch({
                        type: CREATE_FUEL_SUCCESS,
                        payload: response.data.Data
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_FUEL_FAILURE });
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
 * @method createFuelDetailAPI
 * @description create fuel detail 
 */
export function createFuelDetailAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createFuelDetailAPI, data,headers);
        request.then((response) => {
            console.log('response: ', response);
            if (response && response.data && response.data.Result) {
                    dispatch({
                        type: CREATE_FUEL_DETAIL_SUCCESS,
                        //payload: response.data.Data
                    });
                    callback(response);
            } else {
                dispatch({ type: CREATE_FUEL_DETAIL_FAILURE });
                    if (response.data.Message) {
                        toastr.error(response.data.Message);
                    } 
                    callback(response);
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method getFuelDetailAPI
 * @description create fuel detail list
 */
export function getFuelDetailAPI() {
    return (dispatch) => {
        const request = axios.get(API.getFuelDetailAPI, headers);
            request.then((response) => {
                dispatch({
                    type: GET_FUEL_SUCCESS,
                    payload: response.data.DataList,
                });
                 
            }).catch((error) => {
                dispatch({
                    type: GET_FUEL_FAILURE
                });
                apiErrors(error);
            });
    };
}
/**
 * @method getFuelAPI
 * @description create fuel list
 */
export function getFuelAPI() {
    return (dispatch) => {
        const request = axios.get(API.getFuelAPI, headers);
            request.then((response) => {
                dispatch({
                    type: GET_FUEL_DETAIL_SUCCESS,
                    payload: response.data.DataList,
                });
                 
            }).catch((error) => {
                dispatch({
                    type: GET_FUEL_FAILURE
                });
                apiErrors(error);
            });
    };
}