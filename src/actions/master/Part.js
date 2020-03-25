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
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAILURE,
    GET_PART_SUCCESS,
    GET_UNIT_PART_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_ALL_NEW_PARTS_SUCCESS,
    GET_UNIT_NEW_PART_DATA_SUCCESS,
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
 * @method fetchMasterDataAPI
 * @description fetch UOM and material type list
 */
export function fetchMasterDataAPI() {
    return (dispatch) => {
        const API1 = axios.get(API.getAllMasterUOMAPI, headers);
        const API2 = axios.get(API.getMaterialType, headers);
        Promise.all([API1, API2])
            .then((response) => {
                dispatch({
                    type: GET_UOM_DATA_SUCCESS,
                    payload: response[0].data.SelectList,
                });

                dispatch({
                    type: GET_MATERIAL_TYPE_SUCCESS,
                    payload: response[1].data.SelectList,
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
 * @method getAllPartsAPI
 * @description get all parts
 */
export function getAllPartsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllPartsAPI}`, headers);
        request.then((response) => {
            //if (response.data.Result === true) {
            dispatch({
                type: GET_ALL_PARTS_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
            // } else {
            //     toastr.error(MESSAGES.SOME_ERROR);
            // }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method createPartAPI
 * @description create part
 */
export function createPartAPI(data, callback) {
    return (dispatch) => {
        dispatch({
            type: CREATE_PART_REQUEST
        });
        const request = axios.post(API.partCreateAPI, data, headers);
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
 * @method deletePartsAPI
 * @description delete part
 */
export function deletePartsAPI(PartId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePartAPI}/${PartId}`, headers)
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
 * @method updatePartsAPI
 * @description update part details
 */
export function updatePartsAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updatePartAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getOnePartsAPI
 * @description get one part based on id
 */
export function getOnePartsAPI(PartId, isEditFlag, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (isEditFlag) {
            axios.get(`${API.getOnePartAPI}/${PartId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UNIT_PART_DATA_SUCCESS,
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
                type: GET_UNIT_PART_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}







//////////////////////////////// NEW PART API'S ////////////////////////////////




/**
 * @method createNewPartAPI
 * @description create New Part
 */
export function createNewPartAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createNewPartAPI, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_PART_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method getAllNewPartsAPI
 * @description get all parts
 */
export function getAllNewPartsAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllNewPartsAPI}`, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({
                    type: GET_ALL_NEW_PARTS_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: FETCH_MATER_DATA_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getNewPartsDataAPI
 * @description get one part based on id
 */
export function getNewPartsDataAPI(PartId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (PartId != '') {
            axios.get(`${API.getNewPartsDataAPI}/${PartId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_UNIT_NEW_PART_DATA_SUCCESS,
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
                type: GET_UNIT_NEW_PART_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}


/**
 * @method deleteNewPartsAPI
 * @description delete part
 */
export function deleteNewPartsAPI(PartId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteNewPartsAPI}/${PartId}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateNewPartsAPI
 * @description update part details
 */
export function updateNewPartsAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateNewPartsAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}