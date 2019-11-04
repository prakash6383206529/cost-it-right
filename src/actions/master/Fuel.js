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
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../../config/message';

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
        const request = axios.post(API.createFuelAPI, data, headers);
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
        const request = axios.post(API.createFuelDetailAPI, data, headers);
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

/**
 * @method getOneUnitOfMeasurementAPI
 * @description get one UOM based on id
 */
export function getFuelUnitAPI(fuelId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getFuelAPI}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
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
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getOneUnitOfMeasurementAPI
 * @description get one UOM based on id
 */
export function getFuelDetailUnitAPI(fuelId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getFuelDetailAPI}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
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
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deleteFuelDetailAPI(index, Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelDetailAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deleteFuelTypeAPI(index, Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}