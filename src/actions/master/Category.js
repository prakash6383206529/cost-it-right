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
    GET_DATA_FAILURE,
    GET_CATEGORY_LIST_SUCCESS,
    GET_CATEGORY_TYPE_LIST_SUCCESS,
    GET_CATEGORY_TYPE_DATA_SUCCESS,
    GET_CATEGORY_MASTER_DATA_SUCCESS,
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
 * @method createCategoryTypeAPI
 * @description create category type
 */
export function createCategoryTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createcategoryTypeAPI, data, headers);
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
 * @method getCategoryTypeDataAPI
 * @description get category type data
 */
export function getCategoryTypeDataAPI(CategoryTypeId, callback) {
    return (dispatch) => {
        if (CategoryTypeId !== '') {
            axios.get(`${API.getCategoryTypeDataAPI}/${CategoryTypeId}`, headers)
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
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCategoryTypeAPI}`, requestData, headers)
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
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryTypeAPI}/${CategoryTypeId}`, headers)
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
    return (dispatch) => {
        const request = axios.post(API.createCategoryAPI, data, headers);
        request.then((response) => {
            if (response && response.data && response.data.Result) {
                dispatch({
                    type: CREATE_CATEGORY_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_CATEGORY_FAILURE });
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
 * @method getCategoryData
 * @description get category data
 */
export function getCategoryData(CategoryId, callback) {
    return (dispatch) => {
        if (CategoryId !== '') {
            axios.get(`${API.getCategoryData}/${CategoryId}`, headers)
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
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCategoryMasterAPI}`, requestData, headers)
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
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryMasterAPI}/${CategoryId}`, headers)
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
        const API1 = axios.get(API.fetchCategoryType, headers);
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
        const API1 = axios.get(API.getCategoryAPI, headers);
        const API2 = axios.get(API.getCategoryTypeAPI, headers);
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
