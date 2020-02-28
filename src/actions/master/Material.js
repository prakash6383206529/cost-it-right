import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_RM_GRADE_LIST_SUCCESS,
    GET_GRADE_DATA_SUCCESS,
    GET_RM_CATEGORY_LIST_SUCCESS,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_SPECIFICATION_DATA_SUCCESS,
    GET_MATERIAL_LIST_SUCCESS,
    GET_MATERIAL_LIST_TYPE_SUCCESS,
    RAWMATERIAL_ADDED_FOR_COSTING,
    GET_MATERIAL_TYPE_DATA_SUCCESS,
    GET_CATEGORY_DATA_SUCCESS,
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
 * @method getCategoryDataAPI
 * @description get category data
 */
export function getCategoryDataAPI(CategoryId, callback) {
    return (dispatch) => {
        if (CategoryId != '') {
            axios.get(`${API.getCategoryDataAPI}/${CategoryId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_CATEGORY_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_CATEGORY_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateCategoryAPI
 * @description update category details
 */
export function updateCategoryAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateCategoryAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteCategoryAPI
 * @description delete Material type API
 */
export function deleteCategoryAPI(CategoryId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteCategoryAPI}/${CategoryId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
 * @method getRMGradeDataAPI
 * @description Get Grade data
 */
export function getRMGradeDataAPI(GradeId, callback) {
    return (dispatch) => {
        if (GradeId != '') {
            axios.get(`${API.getRMGradeDataAPI}/${GradeId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_GRADE_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_GRADE_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}


/**
 * @method updateRMGradeAPI
 * @description update RM Grade details
 */
export function updateRMGradeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMGradeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRMGradeAPI
 * @description delete RM Grade API
 */
export function deleteRMGradeAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMGradeAPI}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
 * @method getRMSpecificationDataAPI
 * @description Get RM Specification data
 */
export function getRMSpecificationDataAPI(SpecificationId, callback) {
    return (dispatch) => {
        if (SpecificationId != '') {
            axios.get(`${API.getRMSpecificationDataAPI}/${SpecificationId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_SPECIFICATION_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_SPECIFICATION_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method updateRMSpecificationAPI
 * @description update RM Grade details
 */
export function updateRMSpecificationAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateRMSpecificationAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteRMSpecificationAPI
 * @description delete RM Specification API
 */
export function deleteRMSpecificationAPI(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteRMSpecificationAPI}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
 * @method getMaterialTypeDataAPI
 * @description get material type data
 */
export function getMaterialTypeDataAPI(MaterialTypeId, callback) {
    return (dispatch) => {
        if (MaterialTypeId != '') {
            axios.get(`${API.getMaterialTypeDataAPI}/${MaterialTypeId}`, headers)
                .then((response) => {
                    dispatch({
                        type: GET_MATERIAL_TYPE_DATA_SUCCESS,
                        payload: response.data.Data,
                    });
                    callback(response)
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: GET_MATERIAL_TYPE_DATA_SUCCESS,
                payload: {},
            });
            callback()
        }
    };
}

/**
 * @method deleteMaterialTypeAPI
 * @description delete Material type API
 */
export function deleteMaterialTypeAPI(MaterialTypeId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMaterialTypeAPI}/${MaterialTypeId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method updateMaterialtypeAPI
 * @description update Material Type details
 */
export function updateMaterialtypeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMaterialtypeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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

/**
 * @method getAllRawMaterialList
 * @description Used to raw material list
 */
export function getAllRawMaterialList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMMaterialAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_RM_LIST_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}