import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_PROCESS_LIST_SUCCESS,
    GET_PROCESS_UNIT_DATA_SUCCESS,
    GET_INITIAL_PLANT_SELECTLIST_SUCCESS,
    GET_INITIAL_MACHINE_TYPE_SELECTLIST,
    GET_INITIAL_PROCESSES_LIST_SUCCESS,
    GET_INITIAL_MACHINE_LIST_SUCCESS,
    GET_MACHINE_LIST_BY_PLANT,
    GET_PLANT_LIST_BY_MACHINE,
    GET_MACHINE_TYPE_LIST_BY_PLANT,
    GET_VENDOR_LIST_BY_TECHNOLOGY,
    GET_MACHINE_TYPE_LIST_BY_TECHNOLOGY,
    GET_MACHINE_TYPE_LIST_BY_VENDOR,
    GET_PROCESS_LIST_BY_MACHINE_TYPE,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';

// const config() = config

/**
 * @method createProcess
 * @description create Process
 */
export function createProcess(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.createProcess, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

/**
 * @method getProcessCode
 * @description USED TO GET PROCESS CODE
 */
export function getProcessCode(obj, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProcessCode}?loggedInUserId=${loggedInUserId()}&processName=${obj?.processName}&processCode=${obj?.processCode}`, config());
        request.then((response) => {
            if (response.data.Result) {
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
 * @method getProcessDataList
 * @description GET PROCESS DATALIST
 */
export function getProcessDataList(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProcessDataList}?loggedInUserId=${loggedInUserId()}&ProcessName=${data.ProcessName}&ProcessCode=${data.ProcessCode}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_PROCESS_LIST_SUCCESS,
                    payload: response.status === 204 ? [] : response.data.DataList,
                });
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method deleteProcess
 * @description DELETE PROCESS
 */
export function deleteProcess(processId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `processId=${processId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteProcess}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getProcessData
 * @description GET PROCESS DATA
 */
export function getProcessData(processId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (processId !== '') {
            axios.get(`${API.getProcessData}/${processId}/${loggedInUser?.loggedInUserId}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_PROCESS_UNIT_DATA_SUCCESS,
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
                type: GET_PROCESS_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method updateProcess
 * @description UPDATE PROCESS
 */
export function updateProcess(request, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateProcess}`, request, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}

/**
 * @method getInitialMachineTypeSelectList
 * @description GET INTIAL ALL MACHINE TYPE IN SELECTLIST
 */
export function getInitialMachineTypeSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineTypeSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_MACHINE_TYPE_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            apiErrors(error);
        });
    };
}

/**
 * @method getInitialMachineSelectList
 * @description GET MACHINE SELECTLIST
 */
export function getInitialMachineSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const id = '802da383-4745-420d-9186-2dbe42f00f5b';
        const request = axios.get(`${API.getMachineSelectList}/${id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_MACHINE_LIST_SUCCESS,
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
 * @method getInitialProcessesSelectList
 * @description Get Processes select list in process grid
 */
export function getInitialProcessesSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getProcessesSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_PROCESSES_LIST_SUCCESS,
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
 * @method getMachineSelectListByPlant
 * @description GET MACHINE SELECTLIST BY PLANT 
 */
export function getMachineSelectListByPlant(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineSelectListByPlant}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_LIST_BY_PLANT,
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
 * @method getPlantSelectListByMachine
 * @description GET PLANT SELECTLIST BY MACHINE
 */
export function getPlantSelectListByMachine(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectListByMachine}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_LIST_BY_MACHINE,
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
 * @method getMachineTypeSelectListByPlant
 * @description GET MACHINE TYPE SELECTLIST BY PLANT
 */
export function getMachineTypeSelectListByPlant(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineTypeSelectListByPlant}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_TYPE_LIST_BY_PLANT,
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
 * @method getVendorSelectListByTechnology
 * @description GET VENDOR SELECTLIST BY TECHNOLOGY
 */
export function getVendorSelectListByTechnology(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getVendorSelectListByTechnology}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_LIST_BY_TECHNOLOGY,
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
 * @method getMachineTypeSelectListByTechnology
 * @description GET MACHINE TYPE SELECTLIST BY TECHNOLOGY
 */
export function getMachineTypeSelectListByTechnology(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineTypeSelectListByTechnology}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_TYPE_LIST_BY_TECHNOLOGY,
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
 * @method getMachineTypeSelectListByVendor
 * @description GET MACHINE TYPE SELECTLIST BY VENDOR
 */
export function getMachineTypeSelectListByVendor(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getMachineTypeSelectListByVendor}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MACHINE_TYPE_LIST_BY_VENDOR,
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
 * @method getProcessSelectListByMachineType
 * @description GET PROCESS SELECTLIST BY MACHINE TYPE
 */
export function getProcessSelectListByMachineType(Id, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getProcessSelectListByMachineType}/${Id}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PROCESS_LIST_BY_MACHINE_TYPE,
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