import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_PROCESS_LIST_SUCCESS,
    GET_PROCESS_UNIT_DATA_SUCCESS,
    GET_INITIAL_PLANT_SELECTLIST_SUCCESS,
    GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
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

const headers = config

/**
 * @method createProcess
 * @description create Process
 */
export function createProcess(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createProcess, data, headers);
        request.then((response) => {
            if (response.data.Result === true) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getProcessCode
 * @description USED TO GET PROCESS CODE
 */
export function getProcessCode(value, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProcessCode}?processName=${value}`, headers);
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
        const request = axios.get(`${API.getProcessDataList}?plant_id=${data.plant_id}&machine_id=${data.machine_id}`, headers);
        request.then((response) => {
            dispatch({
                type: GET_PROCESS_LIST_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response)
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
export function deleteProcess(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteProcess}/${Id}`, headers)
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
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (processId !== '') {
            axios.get(`${API.getProcessData}/${processId}`, headers)
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
        axios.put(`${API.updateProcess}`, request, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
* @method getInitialPlantSelectList
* @description GET INITIAL ALL PLANTS IN SELECTLIST
*/
export function getInitialPlantSelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_PLANT_SELECTLIST_SUCCESS,
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
 * @method getInitialVendorWithVendorCodeSelectList
 * @description GET VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getInitialVendorWithVendorCodeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
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
        const request = axios.get(`${API.getMachineTypeSelectList}`, headers);
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
        const request = axios.get(`${API.getMachineSelectList}/${id}`, headers);
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
        const request = axios.get(`${API.getProcessesSelectList}`, headers);
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
        const request = axios.get(`${API.getMachineSelectListByPlant}/${Id}`, headers);
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
        const request = axios.get(`${API.getPlantSelectListByMachine}/${Id}`, headers);
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
        const request = axios.get(`${API.getMachineTypeSelectListByPlant}/${Id}`, headers);
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
        const request = axios.get(`${API.getVendorSelectListByTechnology}/${Id}`, headers);
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
        const request = axios.get(`${API.getMachineTypeSelectListByTechnology}/${Id}`, headers);
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
        const request = axios.get(`${API.getMachineTypeSelectListByVendor}/${Id}`, headers);
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
        const request = axios.get(`${API.getProcessSelectListByMachineType}/${Id}`, headers);
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