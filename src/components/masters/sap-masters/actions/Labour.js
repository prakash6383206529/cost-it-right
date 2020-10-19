import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_LABOUR_FAILURE,
    GET_LABOUR_DATA_SUCCESS,
    LABOUR_TYPE_VENDOR_SELECTLIST,
    GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
    GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
    config
} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';

const headers = config

/**
 * @method createLabour
 * @description create labour
 */
export function createLabour(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createLabour, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getLabourDataList
 * @description get labour list
 */
export function getLabourDataList(data, callback) {
    return (dispatch) => {
        const queryParams = `employment_terms=${data.employment_terms}&state_id=${data.state}&plant_id=${data.plant}&labour_type_id=${data.labour_type}&machine_type_id=${data.machine_type}`;
        const request = axios.get(`${API.getLabourDataList}?${queryParams}`, headers);
        request.then((response) => {
            callback(response)
        }).catch((error) => {
            dispatch({ type: GET_LABOUR_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getLabourData
 * @description GET LABOUR DATA
 */
export function getLabourData(labourId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (labourId !== '') {
            axios.get(`${API.getLabourData}/${labourId}`, headers)
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_LABOUR_DATA_SUCCESS,
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
                type: GET_LABOUR_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteLabour
 * @description delete labour
 */
export function deleteLabour(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteLabour}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateLabour
 * @description update labour
 */
export function updateLabour(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateLabour}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method labourTypeVendorSelectList
 * @description LABOUR TYPE VENDOR SELECT LIST
 */
export function labourTypeVendorSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.labourTypeVendorSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: LABOUR_TYPE_VENDOR_SELECTLIST,
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
 * @method getLabourTypeByPlantSelectList
 * @description GET LABOUR TYPE BY PLANT
 */
export function getLabourTypeByPlantSelectList(ID, callback) {
    return (dispatch) => {
        if (ID !== '') {
            const request = axios.get(`${API.getLabourTypeByPlantSelectList}/${ID}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
                payload: [],
            });
            callback();
        }
    };
}


/**
 * @method getLabourTypeByMachineTypeSelectList
 * @description GET LABOUR TYPE BY MACHINE TYPE
 */
export function getLabourTypeByMachineTypeSelectList(ID, callback) {
    return (dispatch) => {
        if (ID !== '') {
            const request = axios.get(`${API.getLabourTypeByMachineTypeSelectList}/${ID}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE, });
                callback(error);
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
                payload: [],
            });
            callback();
        }
    };
}

/**
 * @method labourBulkUpload
 * @description create Labour by Bulk Upload
 */
export function labourBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.labourBulkUpload, data, headers);
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}