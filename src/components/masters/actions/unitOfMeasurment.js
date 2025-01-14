import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    FETCH_MATER_DATA_FAILURE,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_UOM_SUCCESS,
    GET_UNIT_TYPE_SELECTLIST_SUCCESS,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import axiosInstance from '../../../utils/axiosInstance';

// const config() = config;

/**
 * @method getUnitOfMeasurementAPI
 * @description get all UOM list
 */
export function getUnitOfMeasurementAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getAllUOMAPI, config())
            .then((response) => {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getOneUnitOfMeasurementAPI
 * @description get one UOM based on id
 */
export function getOneUnitOfMeasurementAPI(uomId, isEditFlag, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getUOMAPI}/${uomId}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UOM_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    } else {
                        Toaster.error(MESSAGES.SOME_ERROR);
                    }
                    callback(response);
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_UOM_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createUnitOfMeasurementAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: CREATE_PART_REQUEST
        });
        const request = axiosInstance.post(API.createUOMAPI, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_PART_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_PART_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
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
 * @method deleteUnitOfMeasurementAPI
 * @description delete UOM 
 */
export function deleteUnitOfMeasurementAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUOMAPI}/${Id}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateUnitOfMeasurementAPI
 * @description update UOM
 */
export function updateUnitOfMeasurementAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateUOMAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getUnitTypeListAPI
 * @description Used to fetch Unit Type list for UOM
 */
export function getUnitTypeListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getUnitTypeListAPI}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_UNIT_TYPE_SELECTLIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method activeInactiveUOM
 * @description update UOM
 */
export function activeInactiveUOM(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.activeInactiveUOM}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}