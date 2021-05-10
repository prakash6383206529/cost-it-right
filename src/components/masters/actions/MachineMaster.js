import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
    GET_MACHINE_DATALIST_SUCCESS,
    GET_MACHINE_DATA_SUCCESS,
    GET_MACHINE_TYPE_SELECTLIST,
    GET_PROCESSES_LIST_SUCCESS,
    GET_MACHINE_LIST_SUCCESS,
    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

const headers = config

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
        axios.get(API.getMachineTypeListAPI, headers)
            .then((response) => {
                if (response.data.Result === true) {
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
        if (ID !== '') {
            axios.get(`${API.getMachineTypeDataAPI}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
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
 * @method createMachine
 * @description create Machine
 */
export function createMachine(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachine, data, headers);
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
 * @method copyMachine
 * @description Copy Machine
 */
export function copyMachine(MachineId, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.copyMachine}/${MachineId}`, '', headers);
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
 * @method getMachineDataList
 * @description GET DATALIST
 */
export function getMachineDataList(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `costing_head=${data.costing_head}&technology_id=${data.technology_id}&vendor_id=${data.vendor_id}&machine_type_id=${data.machine_type_id}&process_id=${data.process_id}&plant_id=${data.plant_id}`
        axios.get(`${API.getMachineDataList}?${queryParams}`, headers)
            .then((response) => {
                if (response.data.Result === true || response.status === 204) {
                    dispatch({
                        type: GET_MACHINE_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method getMachineData
 * @description Get Machine data
 */
export function getMachineData(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getMachineData}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
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
 * @method getMachineDetailsData
 * @description Get Machine Details Data
 */
export function getMachineDetailsData(ID, callback) {
    return (dispatch) => {
        if (ID !== '') {
            axios.get(`${API.getMachineDetailsData}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
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
 * @method deleteMachine
 * @description delete Machine
 */
export function deleteMachine(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteMachine}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateMachine
 * @description update Machine details
 */
export function updateMachine(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMachine}`, requestData, headers)
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
        // const id = '802da383-4745-420d-9186-2dbe42f00f5b';
        const id = "00000000-0000-0000-0000-000000000000" //uncomment it when code is deployed.
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

/**
 * @method fileUploadMachine
 * @description File Upload Machine
 */
export function fileUploadMachine(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadMachine, data, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileDeleteMachine
 * @description delete Machine file
 */
export function fileDeleteMachine(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteMachine}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method checkAndGetMachineNumber
 * @description CHECK AND GET MACHINE NUMBER
 */
export function checkAndGetMachineNumber(number, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.checkAndGetMachineNumber}?machineNumber=${number}`, '', headers);
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFuelUnitCost
 * @description GET FUEL UNIT COST
 */
export function getFuelUnitCost(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `fuelId=${data.fuelId}&plantId=${data.plantId}`
        axios.get(`${API.getFuelUnitCost}?${queryParams}`, headers)
            .then((response) => {
                if (response && response.data && response.data.Result === true) {
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
 * @method getLabourCost
 * @description GET LABOUR COST
 */
export function getLabourCost(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `labourTypeId=${data.labourTypeId}&machineTypeId=${data.machineTypeId}`
        axios.get(`${API.getLabourCost}?${queryParams}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
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
 * @method getPowerCostUnit
 * @description GET POWER COST UNIT
 */
export function getPowerCostUnit(plantId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getPowerCostUnit}?plantId=${plantId}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
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
 * @method createMachineDetails
 * @description create Machine Details
 */
export function createMachineDetails(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachineDetails, data, headers);
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
 * @method updateMachineDetails
 * @description update Machine details
 */
export function updateMachineDetails(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateMachineDetails}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method bulkUploadMachineZBC
 * @description upload bulk MACHINE ZBC
 */
export function bulkUploadMachineZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadMachineZBC, data, headers);
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

/**
 * @method bulkUploadMachineVBC
 * @description upload bulk MACHINE VBC
 */
export function bulkUploadMachineVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadMachineVBC, data, headers);
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

/**
 * @method bulkUploadMachineMoreZBC
 * @description upload bulk MACHINE MORE ZBC
 */
export function bulkUploadMachineMoreZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadMachineMoreZBC, data, headers);
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
