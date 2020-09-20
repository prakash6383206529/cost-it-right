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

/**
 * @method getUnitOfMeasurementAPI
 * @description get all UOM list
 */
export function getUnitOfMeasurementAPI(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(API.getAllUOMAPI, { headers })
            .then((response) => {
                //if (response.data.Result === true) {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
                // } else {
                //     toastr.error(MESSAGES.SOME_ERROR);
                // }
            }).catch((error) => {
                dispatch({
                    type: API_FAILURE
                });
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
            axios.get(`${API.getUOMAPI}/${uomId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UOM_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
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
        const request = axios.post(API.createUOMAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: CREATE_PART_SUCCESS,
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_PART_FAILURE });
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
 * @method deleteUnitOfMeasurementAPI
 * @description delete UOM 
 */
export function deleteUnitOfMeasurementAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteUOMAPI}/${Id}`, headers)
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
        axios.put(`${API.updateUOMAPI}`, requestData, headers)
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
        const request = axios.get(`${API.getUnitTypeListAPI}`, headers);
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
        axios.put(`${API.activeInactiveUOM}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}