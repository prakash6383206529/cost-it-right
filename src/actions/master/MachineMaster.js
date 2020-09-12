import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    DATA_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    CREATE_MACHINE_TYPE_SUCCESS,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
    GET_MACHINE_DATALIST_SUCCESS,
    GET_MACHINE_DATA_SUCCESS,
    GET_MACHINE_TYPE_SELECTLIST,
    GET_PROCESSES_LIST_SUCCESS,
    GET_MACHINE_LIST_SUCCESS,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
 * @method createMachineType
 * @description create Machine Type 
 */
export function createMachineType(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachineType, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getMachineTypeListAPI
 * @description get all operation list
 */
export function getMachineTypeListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getMachineTypeListAPI, { headers })
            .then((response) => {
                if (response.data.Result == true) {
                    dispatch({
                        type: GET_MACHINE_TYPE_DATALIST_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getMachineTypeDataAPI
 * @description Get CED Other Operation data
 */
export function getMachineTypeDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID != '') {
            axios.get(`${API.getMachineTypeDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
                        dispatch({
                            type: GET_MACHINE_TYPE_DATA_SUCCESS,
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
                type: GET_MACHINE_TYPE_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteMachineTypeAPI
 * @description delete Machine Type
 */
export function deleteMachineTypeAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMachineTypeAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateMachineTypeAPI
 * @description update Machine Type details
 */
export function updateMachineTypeAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMachineTypeAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method createMachineAPI
 * @description create Machine Type 
 */
export function createMachineAPI(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachineAPI, data, headers);
        request.then((response) => {
            if (response.data.Result == true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getMachineListAPI
 * @description get all operation list
 */
export function getMachineListAPI(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(API.getMachineListAPI, { headers })
            .then((response) => {
                if (response.data.Result == true) {
                    dispatch({
                        type: GET_MACHINE_DATALIST_SUCCESS,
                        payload: response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getMachineDataAPI
 * @description Get Machine data
 */
export function getMachineDataAPI(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID != '') {
            axios.get(`${API.getMachineDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
                        dispatch({
                            type: GET_MACHINE_DATA_SUCCESS,
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
                type: GET_MACHINE_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteMachineAPI
 * @description delete Machine Type
 */
export function deleteMachineAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMachineAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateMachineAPI
 * @description update Machine Type details
 */
export function updateMachineAPI(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMachineAPI}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getMachineTypeSelectList
 * @description Used to fetch Labour type selectlist
 */
export function getMachineTypeSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineTypeSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_TYPE_SELECTLIST,
                    payload: response.data.SelectList,
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

/**
 * @method getProcessesSelectList
 * @description Get Processes select list in process grid
 */
export function getProcessesSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getProcessesSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PROCESSES_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getMachineSelectList
 * @description GET MACHINE SELECTLIST
 */
export function getMachineSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const id = '802da383-4745-420d-9186-2dbe42f00f5b';
        const request = axios.get(`${API.getMachineSelectList}/${id}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_LIST_SUCCESS,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

