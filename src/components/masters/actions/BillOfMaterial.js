import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_BOM_SUCCESS,
    CREATE_BOM_FAILURE,
    GET_BOM_SUCCESS,
    UPLOAD_BOM_XLS_SUCCESS,
    GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

import Toaster from '../../common/Toaster';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';

// const config() = config;

/**
* @method createBOMAPI
* @description create bill of material master
*/
export function createBOMAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axiosInstance.post(API.createBOMAPI, data, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_BOM_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method createNewBOMAPI
* @description create new bill of material for BOM and Part Combination
*/
export function createNewBOMAPI(data, callback) {
    return (dispatch) => {
        // dispatch({ type:  API_REQUEST });
        const request = axiosInstance.post(API.createNewBOMAPI, data, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_BOM_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method getBOMDetailAPI
* @description get BOM detail
*/
export function getBOMDetailAPI(flag, PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (flag) {
            const request = axios.get(`${API.getBOMByPartAPI}/${PartId}`, config());
            request.then((response) => {
                dispatch({
                    type: GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_BOM_UNIT_DATA_BY_PART_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
* @method getAllBOMAPI
* @description get all bill of material list
*/
export function getAllBOMAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllBOMAPI}`, config());
        request.then((response) => {
            //if (response.data.Result) {
            dispatch({
                type: GET_BOM_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
            // } else {
            //     Toaster.error(MESSAGES.SOME_ERROR);
            // }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method BOM Upload XLS file
* @description Upload BOM xls file to create multiple BOM
*/
export function uploadBOMxlsAPI(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.uploadBOMAPI, data, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: UPLOAD_BOM_XLS_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_BOM_FAILURE });
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
* @method deleteBOMAPI
* @description delete BOM
*/
export function deleteBOMAPI(BomId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOMAPI}/${BomId}`, config())
            .then((response) => {
                // getUserProfileAPIForUpdatingProps(dispatch, id, () => {
                callback(response);
                // dispatch({ type: DELETE_USER_MEDIA_SUCCESS });
                // });
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method checkCostingExistForPart
* @description Used for check part has costing or not
*/
export function checkCostingExistForPart(PartId, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(`${API.checkCostingExistForPart}/${PartId}`, config());
        request.then((response) => {
            //callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            const response = error ? error.response : undefined;
            callback(response.data.Message);
        });
    };
}

/**
* @method deleteExisCostingByPartID
* @description Used for check part has costing or not
*/
export function deleteExisCostingByPartID(PartId, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(`${API.deleteExisCostingByPartID}/${PartId}`, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

// New API for assembly part creation 







export function createMBOMAssembly(obj, callback) {
    const requestData = { LoggedInUserId: loggedInUserId(), ...obj }
    return (dispatch) => {

        const request = axiosInstance.post(API.createMBOMAssemblyApi, requestData, config());

        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}



