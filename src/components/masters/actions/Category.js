import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_CATEGORY_TYPE_SUCCESS,
    CREATE_CATEGORY_TYPE_FAILURE,
    CREATE_CATEGORY_FAILURE,
    CREATE_CATEGORY_SUCCESS,
    FETCH_CATEGORY_DATA_FAILURE,
    GET_CATEGORY_DATA_SUCCESS,
    GET_CATEGORY_LIST_SUCCESS,
    GET_CATEGORY_TYPE_LIST_SUCCESS,
    GET_CATEGORY_TYPE_DATA_SUCCESS,
    GET_CATEGORY_MASTER_DATA_SUCCESS,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';

// const config() = config

/**
 * @method createCategoryTypeAPI
 * @description create category type
 */
export function createCategoryTypeAPI(data, callback) {
    const requestData = { LoggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        const request = axiosInstance.post(API.createcategoryTypeAPI, requestData, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_CATEGORY_TYPE_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_CATEGORY_TYPE_FAILURE });
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
 * @method getCategoryTypeDataAPI
 * @description get category type data
 */
export function getCategoryTypeDataAPI(CategoryTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (CategoryTypeId !== '') {
            axios.get(`${API.getCategoryTypeDataAPI}/${CategoryTypeId}/${loggedInUser?.loggedInUserId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_CATEGORY_TYPE_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_CATEGORY_TYPE_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method getCategoryTypeDataAPI
 * @description get category type data
 */
export function setEmptyCategoryTypeData(callback) {
    return (dispatch) => {
        dispatch({
            type: GET_CATEGORY_TYPE_DATA_SUCCESS,
            payload: {},
        });
        callback()
    };
}

/**
 * @method updateCategoryTypeAPI
 * @description update category type details
 */
export function updateCategoryTypeAPI(requestData, callback) {
    const requestedData = { LoggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateCategoryTypeAPI}`, requestedData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteCategoryTypeAPI
 * @description delete Category type API
 */
export function deleteCategoryTypeAPI(CategoryTypeId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryTypeAPI}/${CategoryTypeId}/${loggedInUser?.loggedInUserId}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createCategoryAPI
 * @description create category category
 */
export function createCategoryAPI(data, callback) {
    const requestData = { LoggedInUserId: loggedInUserId(), ...data }
    return (dispatch) => {
        const request = axiosInstance.post(API.createCategoryAPI, requestData, config());
        request.then((response) => {
            if (response && response.data && response.data.Result) {
                dispatch({
                    type: CREATE_CATEGORY_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_CATEGORY_FAILURE });
                if (response.data.Message) {
                    Toaster.error(response.data.Message);
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
 * @method getCategoryData
 * @description get category data
 */
export function getCategoryData(CategoryId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        if (CategoryId !== '') {
            axios.get(`${API.getCategoryData}/${CategoryId}/${loggedInUser?.loggedInUserId}`, config())
                .then((response) => {
                    dispatch({
                        type: GET_CATEGORY_MASTER_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_CATEGORY_MASTER_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateCategoryMasterAPI
 * @description update category details
 */
export function updateCategoryMasterAPI(requestData, callback) {
    const requestedData = { LoggedInUserId: loggedInUserId(), ...requestData }
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateCategoryMasterAPI}`, requestedData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method deleteCategoryMasterAPI
 * @description delete Category API
 */
export function deleteCategoryMasterAPI(CategoryId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryMasterAPI}/${CategoryId}/${loggedInUser?.loggedInUserId}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method fetchCategoryMasterDataAPI
 * @description create category category list
 */
export function fetchCategoryMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.fetchCategoryType, config());
        Promise.all([API1])
            .then((response) => {
                dispatch({
                    type: GET_CATEGORY_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });

            }).catch((error) => {
                dispatch({
                    type: FETCH_CATEGORY_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}

/**
 * @method getCategoryDataAPI
 * @description get category category list
 */
export function getCategoryDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getCategoryAPI, config());
        const API2 = axios.get(API.getCategoryTypeAPI, config());
        Promise.all([API1, API2])
            .then((response) => {
                dispatch({
                    type: GET_CATEGORY_LIST_SUCCESS,
                    payload: response[0].data.DataList,
                });
                dispatch({
                    type: GET_CATEGORY_TYPE_LIST_SUCCESS,
                    payload: response[1].data.DataList,
                });
            }).catch((error) => {
                dispatch({
                    type: FETCH_CATEGORY_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}
