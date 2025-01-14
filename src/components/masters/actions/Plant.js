import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    CREATE_PLANT_SUCCESS,
    CREATE_PLANT_FAILURE,
    GET_PLANT_UNIT_SUCCESS,
    config,
    GET_PLANT_FILTER_LIST,
    GET_COMPANY_SELECTLIST,
    GET_PLANT_CODE_SELECT_LIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import axiosInstance from '../../../utils/axiosInstance';

// const config() = config;

/**
 * @method createPlantAPI
 * @description create plant master
 */
export function createPlantAPI(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createPlantAPI, data, config());
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
                    Toaster.error(response.data.Message);
                }
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
 * @method getPlantDataAPI
 * @description get process list
 */
export function getPlantDataAPI(isVe, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAllPlantAPI}?isVendor=${isVe}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_PLANT_FILTER_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                });
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
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deletePlantAPI(plantId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `plantId=${plantId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deletePlantAPI}?${queryParams}`, config())
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
            axios.get(`${API.getPlantAPI}/${plantId}`, config())
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
        axiosInstance.put(`${API.updatePlantAPI}`, request, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
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
        axiosInstance.put(`${API.activeInactiveStatus}`, requestData, config())
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
        const qParams = `country_id=${filterData.country}&state_id=${filterData.state}&city_id=${filterData.city}&CostingTypeId=${filterData.CostingTypeId}`
        const request = axios.get(`${API.getFilteredPlantList}?${qParams}`, config());
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

export function getComapanySelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getComapanySelectList}`, config());
        request.then((response) => {
            dispatch({
                type: GET_COMPANY_SELECTLIST,
                payload: response.data.SelectList
            })
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}


export function getPlantCodeSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getPlantCodeSelectList}`, config());
        request.then((response) => {
            dispatch({
                type: GET_PLANT_CODE_SELECT_LIST,
                payload: response.data.SelectList
            })
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}