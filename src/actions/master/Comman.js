import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_UOM_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_PART_SUCCESS,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS,
    GET_ROW_MATERIAL_SUCCESS,
    GET_GRADE_SUCCESS,
    GET_TECHNOLOGY_LIST_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_FAILURE
} from '../../config/constants';
import {
    apiErrors
} from '../../helper/util';
import {
    MESSAGES
} from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

export function fetchMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getAllMasterUOMAPI, headers);
        const API2 = axios.get(API.getMaterialType, headers);
        const API3 = axios.get(API.getPart, headers);
        const API4 = axios.get(API.getPlant, headers);
        const API5 = axios.get(API.getSupplier, headers);
        const API6 = axios.get(API.getTechnology, headers);
        Promise.all([API1, API2, API3, API4, API5, API6])
            .then((response) => {
                console.log('%c 🥗 response: ', 'font-size:20px;background-color: #FFDD4D;color:#fff;', response);
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });

                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response[1].data.SelectList,
                });

                dispatch({
                    type: GET_PART_SUCCESS,
                    payload: response[2].data.SelectList,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response[3].data.SelectList,
                });
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response[4].data.SelectList,
                });
                dispatch({
                    type: GET_TECHNOLOGY_LIST_SUCCESS,
                    payload: response[5].data.SelectList,
                });
            }).catch((error) => {
                dispatch({
                    type: FETCH_MATER_DATA_FAILURE
                });
                apiErrors(error);
            });
    };
}
/**
 * @method fetchCountryDataAPI
 * @description Used to fetch country list
 */
export function fetchCountryDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCountry}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COUNTRY_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchStateDataAPI
 * @description Used to fetch state list
 */
export function fetchStateDataAPI(countryId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (countryId == 0) {
            dispatch({
                type: GET_STATE_SUCCESS,
                payload: []
            });
            dispatch({
                type: GET_CITY_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getState}/${countryId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_STATE_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchCityDataAPI
 * @description Used to fetch city list
 */
export function fetchCityDataAPI(stateId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (stateId == 0) {
            dispatch({
                type: GET_CITY_SUCCESS,
                payload: [],
            });
            callback([]);
        } else {
            const request = axios.get(`${API.getCity}/${stateId}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_CITY_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchPlantDataAPI
 * @description Used to fetch plant list
 */
export function fetchPlantDataAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlant}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRowMaterialAPI
 * @description Used to fetch row material list
 */
export function fetchRowMaterialAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRowMaterial}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROW_MATERIAL_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRMGradeAPI
 * @description Used to fetch row material grade list
 */
export function fetchRMGradeAPI(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (Id == 0) {
            dispatch({
                type: GET_GRADE_SUCCESS,
                payload: []
            });
        } else {
            const request = axios.get(`${API.getRowGrade}/${Id}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_GRADE_SUCCESS,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            }).catch((error) => {
                dispatch({ type: FETCH_MATER_DATA_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        }
    };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function fetchRMCategoryAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRowMaterial}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ROW_MATERIAL_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getOtherOperationData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOtherOperationsFormDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OTHER_OPERATION_FORMDATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: GET_OTHER_OPERATION_FORMDATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

