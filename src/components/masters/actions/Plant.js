import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    CREATE_PLANT_SUCCESS,
    CREATE_PLANT_FAILURE,
    GET_PLANT_SUCCESS,
    GET_PLANT_UNIT_SUCCESS,
    config,
    GET_PLANT_FILTER_LIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { toastr } from 'react-redux-toastr'

const headers = config;

/**
 * @method createPlantAPI
 * @description create plant master
 */
export function createPlantAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createPlantAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_PLANT_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_PLANT_FAILURE });
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
 * @method getPlantDataAPI
 * @description get process list
 */
export function getPlantDataAPI(isVe, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAllPlantAPI}?isVendor=${isVe}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_PLANT_FILTER_LIST,
                payload: response.data.DataList
            });
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
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deletePlantAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePlantAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getOneUnitOfPlantAPI
 * @description get one Plant based on id
 */
export function getPlantUnitAPI(plantId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (plantId !== '') {
            axios.get(`${API.getPlantAPI}/${plantId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_PLANT_UNIT_SUCCESS,
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
                type: GET_PLANT_UNIT_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method updateUnitOfMeasurementAPI
 * @description update UOM
 */
export function updatePlantAPI(plantId, request, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updatePlantAPI}`, request, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method activeInactiveStatus
 * @description active Inactive Status
 */
export function activeInactiveStatus(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.activeInactiveStatus}`, requestData, headers)
            .then((response) => {
                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getFilteredPlantList
 * @description get process list
 */
export function getFilteredPlantList(filterData, callback) {
    return (dispatch) => {
        const qParams = `country_id=${filterData.country}&state_id=${filterData.state}&city_id=${filterData.city}&is_vendor=${filterData.is_vendor}`
        const request = axios.get(`${API.getFilteredPlantList}?${qParams}`, headers);
        request.then((response) => {

            dispatch({
                type: GET_PLANT_FILTER_LIST,
                payload: response.data.DataList
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}