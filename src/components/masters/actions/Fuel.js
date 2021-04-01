import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_FUEL_DATALIST_SUCCESS,
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS,
    GET_FULE_COMBO_SUCCESS,
    GET_STATELIST_BY_FUEL,
    GET_FULELIST_BY_STATE,
    GET_PLANT_SELECTLIST_BY_STATE,
    GET_ZBC_PLANT_SELECTLIST,
    GET_STATE_SELECTLIST,
    GET_ZBC_POWER_DATA_SUCCESS,
    config,
    GET_POWER_DATA_LIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';

const headers = config;

/**
 * @method createFuel
 * @description create fuel
 */
export function createFuel(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFuel, data, headers);
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
 * @method createFuelDetail
 * @description create fuel detail 
 */
export function createFuelDetail(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFuelDetail, data, headers);
        request.then((response) => {
            if (response && response.data && response.data.Result) {
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
 * @method updateFuelDetail
 * @description File update Fuel Detail
 */
export function updateFuelDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updateFuelDetail, data, headers);
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
 * @method getFuelDetailDataList
 * @description create fuel detail list
 */
export function getFuelDetailDataList(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getFuelDetailDataList}?fuelName=${data.fuelName}&stateName=${data.stateName}`, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                dispatch({
                    type: GET_FUEL_DATALIST_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            callback(error);
        });
    };
}

/**
 * @method getFuelAPI
 * @description create fuel list
 */
export function getFuelAPI() {
    return (dispatch) => {
        const request = axios.get(API.getAllFuelAPI, headers);
        request.then((response) => {
            dispatch({
                type: GET_FUEL_DETAIL_SUCCESS,
                payload: response.data.DataList,
            });
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFuelUnitAPI
 * @description get FUEL 
 */
export function getFuelUnitAPI(fuelId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (fuelId !== '') {
            axios.get(`${API.getFuelAPI}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
                            payload: response.data.Data,
                        });
                        callback(response);
                    }
                    callback(response);
                }).catch((error) => {
                    apiErrors(error);
                    dispatch({ type: API_FAILURE });
                });
        } else {
            dispatch({
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method getFuelDetailData
 * @description get Fuel Detail Data
 */
export function getFuelDetailData(fuelId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (fuelId !== '') {
            axios.get(`${API.getFuelDetailData}/${fuelId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_FUEL_UNIT_DATA_SUCCESS,
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
                type: GET_FUEL_UNIT_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete FUEL DETAIL 
 */
export function deleteFuelDetailAPI(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelDetailAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteFuelDetailsAPI
 * @description delete UOM 
 */
export function deleteFuelTypeAPI(index, Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteFuelAPI}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getFuelComboData
 * @description USED TO GET FUEL COMBO DATA
 */
export function getFuelComboData(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelComboData}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FULE_COMBO_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getStateListByFuel
 * @description USED TO FILTER STATE BY FUEL
 */
export function getStateListByFuel(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getStateListByFuel}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_STATELIST_BY_FUEL,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getFuelListByState
 * @description USED TO FILTER FUEL BY STATE
 */
export function getFuelListByState(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelListByState}/${ID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FULELIST_BY_STATE,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fuelBulkUpload
 * @description create Fuel by Bulk Upload
 */
export function fuelBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fuelBulkUpload, data, headers);
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method createPowerDetail
 * @description CREATE POEWR DETAIL
 */
export function createPowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createPowerDetail, data, headers);
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
 * @method createVendorPowerDetail
 * @description CREATE VENDOR POEWR DETAIL
 */
export function createVendorPowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createVendorPowerDetail, data, headers);
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
 * @method updatePowerDetail
 * @description UPDATE POWER DETAIL
 */
export function updatePowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updatePowerDetail, data, headers);
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
 * @method updateVendorPowerDetail
 * @description UPDATE VENDOR POWER DETAIL
 */
export function updateVendorPowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updateVendorPowerDetail, data, headers);
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
 * @method getPowerDetailDataList
 * @description GET POWER DETAIL DATALIST
 */
export function getPowerDetailDataList(data, callback) {
    let plantID = data && data.plantID === undefined ? null : data.plantID;
    let stateID = data && data.stateID === undefined ? null : data.stateID;
    return (dispatch) => {
        const request = axios.get(`${API.getPowerDetailDataList}?plantId=${plantID}&stateId=${stateID}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_POWER_DATA_LIST,
                    payload: response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getVendorPowerDetailDataList
 * @description GET VENDOR POWER DETAIL DATALIST
 */
export function getVendorPowerDetailDataList(data, callback) {
    let vendorID = data && data.vendorID === undefined ? null : data.vendorID;
    let plantID = data && data.plantID === undefined ? null : data.plantID;
    return (dispatch) => {
        const request = axios.get(`${API.getVendorPowerDetailDataList}?vendorId=${vendorID}&plantId=${plantID}`, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                dispatch({
                    type: GET_POWER_DATA_LIST,
                    payload: response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getPlantListByState
 * @description USED TO GET PLANT SELECT LIST BY STATE
 */
export function getPlantListByState(ID, callback) {
    return (dispatch) => {
        if (ID !== '') {
            //dispatch({ type: API_REQUEST });
            const request = axios.get(`${API.getPlantListByState}/${ID}`, headers);
            request.then((response) => {
                if (response.data.Result) {
                    dispatch({
                        type: GET_PLANT_SELECTLIST_BY_STATE,
                        payload: response.data.SelectList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
        } else {
            dispatch({
                type: GET_PLANT_SELECTLIST_BY_STATE,
                payload: [],
            });
        }
    };
}

/**
 * @method getDieselRateByStateAndUOM
 * @description GET DIESEL RATE BY STATE AND UOM FOR SOURCE GENERATOR DIESEL
 */
export function getDieselRateByStateAndUOM(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getDieselRateByStateAndUOM}/${data.StateID}/${data.UOMID}`, headers);
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getZBCPlantList
 * @description GET ZBC PLANT SELECTLIST
 */
export function getZBCPlantList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getZBCPlantList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ZBC_PLANT_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getStateSelectList
 * @description GET STATE SELECTLIST
 */
export function getStateSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getStateSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_STATE_SELECTLIST,
                    payload: response.data.SelectList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getPowerDetailData
 * @description GET POWER DETAIL DATA
 */
export function getPowerDetailData(PowerId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (PowerId !== '') {
            axios.get(`${API.getPowerDetailData}/${PowerId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_ZBC_POWER_DATA_SUCCESS,
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
                type: GET_ZBC_POWER_DATA_SUCCESS,
                payload: {},
            });
            callback({});
        }
    };
}


/**
 * @method getVendorPowerDetailData
 * @description GET VENDOR POWER DETAIL DATA
 */
export function getVendorPowerDetailData(PowerId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getVendorPowerDetailData}/${PowerId}`, headers)
            .then((response) => {
                if (response.data.Result === true) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deletePowerDetail
 * @description DELETE ZBC POWER DETAIL
 */
export function deletePowerDetail(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePowerDetail}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteVendorPowerDetail
 * @description DELETE VENDOR POWER DETAIL
 */
export function deleteVendorPowerDetail(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteVendorPowerDetail}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}