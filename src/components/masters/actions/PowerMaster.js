import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    GET_POWER_DATALIST_SUCCESS,
    GET_POWER_DATA_SUCCESS,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
// const config() = config

/**
 * @method createUnitOfMeasurementAPI
 * @description create UOM 
 */
export function createPowerAPI(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createPowerAPI, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getPowerDataListAPI
 * @description get all Power list
 */
export function getPowerDataListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getPowerDataListAPI, config())
            .then((response) => {
                dispatch({
                    type: GET_POWER_DATALIST_SUCCESS,
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
 * @method getPowerDataAPI
 * @description Get power unit data
 */
export function getPowerDataAPI(PowerId, callback) {
    return (dispatch) => {
        if (PowerId !== '') {
            //dispatch({ type: API_REQUEST });
            axios.get(`${API.getPowerDataAPI}/${PowerId}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_POWER_DATA_SUCCESS,
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
                type: GET_POWER_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };

}

/**
 * @method updatePowerAPI
 * @description update Power details
 */
export function updatePowerAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updatePowerAPI}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deletePowerAPI
 * @description delete Power
 */
export function deletePowerAPI(PowerId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePowerAPI}/${PowerId}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}