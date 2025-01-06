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
    GET_ALL_MACHINE_DATALIST_SUCCESS,
    GET_MACHINE_APPROVAL_LIST,
    config,
    SET_PROCESS_GROUP_FOR_API,
    SET_PROCESS_GROUP_LIST,
    STORE_PROCESS_LIST,
    EMPTY_GUID
} from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { loggedInUserId, userDetails } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper';

// const config() = config

/**
 * @method createMachineType
 * @description create Machine Type 
 */
export function createMachineType(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createMachineType, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_FAILURE });
            apiErrors(error);
            callback(error);
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
        axios.get(API.getMachineTypeListAPI, config())
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
            axios.get(`${API.getMachineTypeDataAPI}/${ID}`, config())
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
        axios.delete(`${API.deleteMachineTypeAPI}/${Id}`, config())
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
        axios.put(`${API.updateMachineTypeAPI}`, requestData, config())
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
        const request = axios.post(API.createMachine, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
                dispatch({ type: CREATE_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: CREATE_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

/**
 * @method copyMachine
 * @description Copy Machine
 */
export function copyMachine(MachineId, callback) {
    return (dispatch) => {
        const queryParams = `machineId=${MachineId}&loggedInUserId=${loggedInUserId()}`
        const request = axios.post(`${API.copyMachine}?${queryParams}`, '', config());
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
export function getMachineDataList(data, skip, take, isPagination, obj, callback) {

    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            VendorId: obj.VendorId !== undefined ? obj.VendorId : EMPTY_GUID,
            PlantId: obj.PlantId !== undefined ? obj.PlantId : EMPTY_GUID,
            CustomerId: obj.CustomerId !== undefined ? obj.CustomerId : EMPTY_GUID,
            technology_id: data.technology_id,
            StatusId: data.StatusId ? data.StatusId : '',
            DepartmentCode: obj.DepartmentName !== undefined ? obj.DepartmentName : '',
            MachineEntryType: data.MachineEntryType
        });
        const queryParamsSecond = encodeQueryParamsAndLog({
            CostingHead: obj.CostingHead !== undefined ? obj.CostingHead : '', Technology: obj.Technology !== undefined ? obj.Technology : '', Vendor: obj.VendorName !== undefined ? obj.VendorName : '', Plant: obj.Plant !== undefined ? obj.Plant : '', MachineNumber: obj.MachineNumber !== undefined ? obj.MachineNumber : '', MachineName: obj.MachineName !== undefined ? obj.MachineName : '',
            MachineType: obj.MachineTypeName !== undefined ? obj.MachineTypeName : '', Tonnage: obj.MachineTonnage !== undefined ? obj.MachineTonnage : '', ProcessName: obj.ProcessName !== undefined ? obj.ProcessName : '', MachineRate: obj.MachineRate !== undefined ? obj.MachineRate : '', EffectiveDate: obj.newDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? '' : obj.newDate) : '', applyPagination: isPagination, skip: skip,
            take: take, CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '', IsCustomerDataShow: obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false, IsVendorDataShow: obj?.IsVendorDataShow, IsZeroDataShow: obj?.IsZeroDataShow,
            FromDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : '', ToDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : '', TechnologyId: obj.TechnologyId !== undefined ? obj.TechnologyId : '',
            UOM: obj.UOM !== undefined ? obj.UOM : '',
            ExchangeRateSourceName: obj.ExchangeRateSourceName !== undefined ? obj?.ExchangeRateSourceName : "",
            Currency: obj.Currency !== undefined ? obj.Currency : "",
            isRequestForPendingSimulation: obj?.isRequestForPendingSimulation ? true : false
        });
        // const queryParams = `VendorId=${obj.VendorId !== undefined ? obj.VendorId : EMPTY_GUID}&PlantId=${obj.PlantId !== undefined ? obj.PlantId : EMPTY_GUID}&CustomerId=${obj.CustomerId !== undefined ? obj.CustomerId : EMPTY_GUID}&technology_id=${data.technology_id}&StatusId=${data.StatusId ? data.StatusId : ''}&DepartmentCode=${obj.DepartmentName !== undefined ? obj.DepartmentName : ""}`
        // const queryParamsSecond = `CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Technology=${obj.Technology !== undefined ? obj.Technology : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&Plant=${obj.Plant !== undefined ? obj.Plant : ""}&MachineNumber=${obj.MachineNumber !== undefined ? obj.MachineNumber : ""}&MachineName=${obj.MachineName !== undefined ? obj.MachineName : ""}&MachineType=${obj.MachineTypeName !== undefined ? obj.MachineTypeName : ""}&Tonnage=${obj.MachineTonnage !== undefined ? obj.MachineTonnage : ""}&ProcessName=${obj.ProcessName !== undefined ? obj.ProcessName : ""}&MachineRate=${obj.MachineRate !== undefined ? obj.MachineRate : ""}&EffectiveDate=${obj.newDate !== undefined ? (obj.dateArray && obj.dateArray.length > 1 ? "" : obj.newDate) : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&IsCustomerDataShow=${obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false}&IsVendorDataShow=${obj?.IsVendorDataShow}&IsZeroDataShow=${obj?.IsZeroDataShow}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}&TechnologyId=${obj.TechnologyId !== undefined ? obj.TechnologyId : ""}&UOM=${obj.UOM !== undefined ? obj.UOM : ""}`
        axios.get(`${API.getMachineDataList}?${queryParams}&${queryParamsSecond}`, config())
            .then((response) => {
                let value = []
                if (response?.status !== 204) {
                    value = response.data.DataList.filter((item) => item.EffectiveDateNew = item.EffectiveDate)
                }
                if (response.data.Result === true || response?.status === 204) {

                    if (isPagination === true) {
                        dispatch({
                            type: GET_MACHINE_DATALIST_SUCCESS,
                            payload: response.status === 204 ? [] : value,
                        });
                    }
                    else {
                        dispatch({
                            type: GET_ALL_MACHINE_DATALIST_SUCCESS,
                            payload: response.status === 204 ? [] : value,
                        });
                    }
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
            axios.get(`${API.getMachineData}/${ID}`, config())
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
            axios.get(`${API.getMachineDetailsData}/${ID}`, config())
                .then((response) => {
                    if (response.data.Result === true || response.status === 204) {
                        dispatch({
                            type: GET_MACHINE_DATA_SUCCESS,
                            payload: response.status === 204 ? [] : response.data.Data,
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
export function deleteMachine(machineId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `machineId=${machineId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteMachine}?${queryParams}`, config())
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
        axios.put(`${API.updateMachine}`, requestData, config())
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
        const request = axios.get(`${API.getMachineTypeSelectList}`, config());
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
        const request = axios.get(`${API.getProcessesSelectList}`, config());
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
        const request = axios.get(`${API.getMachineSelectList}/${id}`, config());
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
        const request = axios.post(API.fileUploadMachine, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error.toString())
        });
    };
}


/**
 * @method checkAndGetMachineNumber
 * @description CHECK AND GET MACHINE NUMBER
 */
export function checkAndGetMachineNumber(number, callback) {
    return (dispatch) => {
        const request = axios.post(`${API.checkAndGetMachineNumber}?machineNumber=${number}`, '', config());
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
        const queryParams = `fuelId=${data?.fuelId}&plantId=${data?.plantId}&effectiveDate=${data?.effectiveDate}&toCurrency=${data?.toCurrency}&exchangeRateSourceName=${data?.ExchangeSource}&costingTypeId=${data?.costingTypeId}&vendorId=${data?.vendorId}&customerId=${data?.customerId}&entryType=${data?.entryType}`
        axios.get(`${API.getFuelUnitCost}?${queryParams}`, config())
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
export function getLabourCost(data, date, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const queryParams = `labourTypeId=${data?.labourTypeId}&machineTypeId=${data?.machineTypeId}&plantId=${data?.plantId}&effectiveDate=${DayTime(date).format('YYYY-MM-DDTHH:mm:ss')}&toCurrency=${data?.toCurrency}&exchangeRateSourceName=${data?.ExchangeSource}&vendorId=${data?.vendorId}&customerId=${data?.customerId}&costingTypeId=${data?.costingTypeId}`
        axios.get(`${API.getLabourCost}?${queryParams}`, config())
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
export function getPowerCostUnit(obj, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.get(`${API.getPowerCostUnit}?plantId=${obj?.plantId}&effectiveDate=${DayTime(obj.effectiveDate).format('YYYY-MM-DDTHH:mm:ss')}&costingTypeId=${obj?.costingTypeId}&vendorId=${obj?.vendorId}&customerId=${obj?.customerId}&toCurrency=${obj?.toCurrency}&exchangeRateSourceName=${obj?.exchangeRateSourceName}&entryType=${obj?.entryType}`, config())
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
        const request = axios.post(API.createMachineDetails, data, config());
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
        axios.put(`${API.updateMachineDetails}`, requestData, config())
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
 * @method bulkUploadMachine
 * @description upload bulk MACHINE ZBC
 */
export function bulkUploadMachine(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadMachine, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method bulkUploadMachineMoreZBC
 * @description upload bulk MACHINE MORE ZBC
 */
export function bulkUploadMachineMoreZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadMachineMoreZBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

export function getMachineApprovalList(callback) {

    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getRMApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}&masterId=${4}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                //
                dispatch({
                    type: GET_MACHINE_APPROVAL_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                    // payload: JSON.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error)
        });
    };
}


export function setGroupProcessList(data) {
    return (dispatch) => {
        dispatch({
            type: SET_PROCESS_GROUP_FOR_API,
            payload: data
        })
    }
}

export function getProcessGroupByMachineId(machineId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProcessGroupList}/${machineId}`, config())
        request.then((response) => {
            if ((response.data.Result) || response?.status === 204) {
                dispatch({
                    type: SET_PROCESS_GROUP_LIST,
                    payload: response?.status === 204 ? [] : response.data.DataList
                })
                callback(response)
            }
        }).catch((error) => {
            callback(error)
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}

export function setProcessList(data) {
    return (dispatch) => {
        dispatch({
            type: STORE_PROCESS_LIST,
            payload: data
        })
    }
}
