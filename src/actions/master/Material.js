import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_RM_GRADE_LIST_SUCCESS,
    GET_RM_CATEGORY_LIST_SUCCESS,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_MATERIAL_LIST_SUCCESS,
    GET_MATERIAL_LIST_TYPE_SUCCESS,
    RAWMATERIAL_ADDED_FOR_COSTING,
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
 * @method createMaterialAPI
 * @description create material master
 */
export function createMaterialAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    //payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method createRMCategoryAPI
 * @description create row material category master
 */
export function createRMCategoryAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createRMCategoryAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method createRMGradeAPI
 * @description create row material grade master
 */
export function createRMGradeAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createRMGradeAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method createRMSpecificationAPI
 * @description create row material specification master
 */
export function createRMSpecificationAPI(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axios.post(API.createRMSpecificationAPI, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getRowMaterialDataAPI
 * @description get row material list
 */
export function getRowMaterialDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getRMMaterialAPI, headers);
        const API2 = axios.get(API.getRMGradeAPI, headers);
        const API3 = axios.get(API.getRMCategoryAPI, headers);
        const API4 = axios.get(API.getRMSpecificationAPI, headers);
        Promise.all([API1, API2, API3, API4])
            .then((response) => {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response[0].data.DataList,
                });
                dispatch({
                    type: GET_RM_GRADE_LIST_SUCCESS,
                    payload: response[1].data.DataList,
                });
                dispatch({
                    type: GET_RM_CATEGORY_LIST_SUCCESS,
                    payload: response[2].data.DataList,
                });
                dispatch({
                    type: GET_RM_SPECIFICATION_LIST_SUCCESS,
                    payload: response[3].data.DataList,
                });
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
                apiErrors(error);
            });
    };
}

// Action Creator for material master

/**
 * @method createMaterialTypeAPI
 * @description create material master
 */
export function createMaterialTypeAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterialType, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method createRMDetailAPI
 * @description create material master
 */
export function createRMDetailAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMaterial, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: CREATE_MATERIAL_SUCCESS,
                    payload: response.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_MATERIAL_FAILURE });
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
 * @method getMaterialDetailAPI
 * @description get row material list
 */
export function getMaterialDetailAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getMaterialTypeDataList, headers);
        const API2 = axios.get(API.getMaterial, headers);
        Promise.all([API1, API2])
            .then((response) => {
                dispatch({
                    type: GET_MATERIAL_LIST_TYPE_SUCCESS,
                    payload: response[0].data.DataList,
                });
                dispatch({
                    type: GET_MATERIAL_LIST_SUCCESS,
                    payload: response[1].data.DataList,
                });
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
                apiErrors(error);
            });
    };
}

/**
 * @method getMaterialDetailAPI
 * @description get row material list
 */
export function rawMaterialForCosting(data) {
    return (dispatch) => {
        dispatch({
            type: RAWMATERIAL_ADDED_FOR_COSTING,
            payload: data
        });
    };
}