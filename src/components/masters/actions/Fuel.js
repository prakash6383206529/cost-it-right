import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_FUEL_DATALIST_SUCCESS,
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS,
    GET_FUEL_BY_PLANT,
    GET_STATELIST_BY_FUEL,
    GET_FULELIST_BY_STATE,
    GET_PLANT_SELECTLIST_BY_STATE,
    GET_ZBC_PLANT_SELECTLIST,
    GET_STATE_SELECTLIST,
    GET_ZBC_POWER_DATA_SUCCESS,
    config,
    GET_POWER_DATA_LIST,
    GET_POWER_VENDOR_DATA_LIST,
    EMPTY_GUID,
    GET_PLANT_CURRENCY_BY_PLANT_IDS
} from '../../../config/constants';
import { userDetails } from '../../../helper';
import { apiErrors } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';

// const config() = config;

/**
 * @method createFuel
 * @description create fuel
 */
export function createFuel(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createFuel, data, config());
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
        const request = axios.post(API.createFuelDetail, data, config());
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
        const request = axios.put(API.updateFuelDetail, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
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
 * @method getFuelDetailDataList
 * @description create fuel detail list
 */
export function getFuelDetailDataList(isAPICall, data, callback) {
    const { cbc, zbc, vbc } = reactLocalStorage.getObject('CostingTypePermission');
    return (dispatch) => {
        if (isAPICall) {
            const request = axios.get(`${API.getFuelDetailDataList}?fuelId=${data.fuelName}&stateId=${data.stateName}&IsCustomerDataShow=${cbc}&IsVendorDataShow=${vbc}&IsZeroDataShow=${zbc}`, config());
            request.then((response) => {
                if (response && (response.data.Result === true || response.status === 204)) {
                    dispatch({
                        type: GET_FUEL_DATALIST_SUCCESS,
                        payload: response.status === 204 ? [] : response.data.DataList,
                    });
                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: GET_FUEL_FAILURE });
                callback(error);
            });
        }
        else {
            dispatch({
                type: GET_FUEL_DATALIST_SUCCESS,
                payload: [],
            });
        }
    };
}

/**
 * @method getAllFuelAPI
 * @description create fuel list
 */
export function getAllFuelAPI(callback) {
    return (dispatch) => {
        const request = axios.get(API.getAllFuelAPI, config());
        request.then((response) => {
            dispatch({
                type: GET_FUEL_DETAIL_SUCCESS,
                payload: response.data.DataList,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: GET_FUEL_FAILURE });
            apiErrors(error);
            callback(error);
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
            axios.get(`${API.getFuelAPI}/${fuelId}`, config())
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
            axios.get(`${API.getFuelDetailData}/${fuelId}`, config())
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
export function deleteFuelDetailAPI(fuelDetailId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `fuelDetailId=${fuelDetailId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteFuelDetailAPI}?${queryParams}`, config())
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
        axios.delete(`${API.deleteFuelAPI}/${Id}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getFuelByPlant
 * @description USED TO GET FUEL COMBO DATA
 */
export function getFuelByPlant(obj, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelByPlant}?plantId=${obj.plantId ? obj.plantId : EMPTY_GUID}&vendorId=${obj.vendorId ? obj.vendorId : EMPTY_GUID}&customerId=${obj.customerId ? obj.customerId : EMPTY_GUID}&cityId=${obj.cityId ? obj.cityId : EMPTY_GUID}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FUEL_BY_PLANT,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function getFuelList(obj, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getFuelList}?plantId=${obj?.plantId ? obj?.plantId : EMPTY_GUID}&vendorId=${obj?.vendorId ? obj?.vendorId : EMPTY_GUID}&customerId=${obj?.customerId ? obj?.customerId : EMPTY_GUID}&cityId=${obj?.cityId ? obj?.cityId : EMPTY_GUID}&stateId=${obj?.stateId ? obj?.stateId : null}&costingTypeId=${obj?.costingTypeId ? obj?.costingTypeId : null}&entryType=${obj?.entryType ? obj?.entryType : 0}&countryId=${obj?.countryId ? obj?.countryId : null}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_FUEL_BY_PLANT,
                    payload: response.data.DataList,
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
        const request = axios.get(`${API.getStateListByFuel}/${ID}`, config());
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
        const request = axios.get(`${API.getFuelListByState}/${ID}`, config());
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
        const request = axios.post(API.fuelBulkUpload, data, config());
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
        const request = axios.post(API.createPowerDetail, data, config());
        request.then((response) => {
            if (response.data.Result) {
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
 * @method createVendorPowerDetail
 * @description CREATE VENDOR POEWR DETAIL
 */
export function createVendorPowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createVendorPowerDetail, data, config());
        request.then((response) => {
            if (response.data.Result) {
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
 * @method updatePowerDetail
 * @description UPDATE POWER DETAIL
 */
export function updatePowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updatePowerDetail, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
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
 * @method updateVendorPowerDetail
 * @description UPDATE VENDOR POWER DETAIL
 */
export function updateVendorPowerDetail(data, callback) {
    return (dispatch) => {
        const request = axios.put(API.updateVendorPowerDetail, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
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
 * @method getPowerDetailDataList
 * @description GET POWER DETAIL DATALIST
 */
export function getPowerDetailDataList(data, callback) {
    let plantID = data && data.plantID === undefined ? null : data.plantID;
    let stateID = data && data.stateID === undefined ? null : data.stateID;
    const { cbc, zbc, vbc } = reactLocalStorage.getObject('CostingTypePermission');
    return (dispatch) => {
        const request = axios.get(`${API.getPowerDetailDataList}?plantId=${plantID}&stateId=${stateID}&IsCustomerDataShow=${cbc}&IsVendorDataShow=${vbc}&IsZeroDataShow=${zbc}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_POWER_DATA_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
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
        const request = axios.get(`${API.getVendorPowerDetailDataList}?vendorId=${vendorID}&plantId=${plantID}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_POWER_VENDOR_DATA_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
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
 * @method getPlantListByAddress
 * @description USED TO GET PLANT SELECT LIST BY STATE
 */
export function getPlantListByAddress(cityId, stateId, countryId, callback) {
    return (dispatch) => {
        if (cityId !== '') {
            //dispatch({ type: API_REQUEST });
            const request = axios.get(`${API.getPlantListByAddress}?cityId=${cityId}&stateId=${stateId}&countryId=${countryId}`, config());
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
        const request = axios.get(`${API.getDieselRateByStateAndUOM}?stateId=${Number(data.StateID)}&uomId=${data.UOMID}&plantId=${data.plantId ? data.plantId : ''}&vendorId=${data.vendorId ? data.vendorId : null}&customerId=${data.customerId ? data.customerId : null}&effectiveDate=${data.effectiveDate ? data.effectiveDate : ''}&fuelId=${data.fuelId ? data.fuelId : 0}&cityId=${data.cityId ? data.cityId : 0}`, config());
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
        const request = axios.get(`${API.getZBCPlantList}`, config());
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
        const request = axios.get(`${API.getStateSelectList}`, config());
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
export function getPowerDetailData(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        let queryParams = `powerId=${data?.Id}&plantId=${data?.plantId}`
        if (data !== '') {
            axios.get(`${API.getPowerDetailData}?${queryParams}`, config())
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
        axios.get(`${API.getVendorPowerDetailData}/${PowerId}`, config())
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
        const QueryParams = `PowerId=${Id.PowerId}&PlantId=${Id.PlantId}&LoggedInUserId=${userDetails().LoggedInUserId}`
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deletePowerDetail}?${QueryParams}`, config())
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
export function deleteVendorPowerDetail(powerId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `powerId=${powerId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteVendorPowerDetail}?${queryParams}`, config())
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
export function getUOMByFuelId(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getUOMByFuelId}?fuelId=${data}`, config());
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
 * @method getPlantCurrencyByPlantIds
 * @description get plant currency by plant ids
 */
export function getPlantCurrencyByPlantIds(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(`${API.getPlantCurrencyByPlantIds}`, data, config());
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: GET_PLANT_CURRENCY_BY_PLANT_IDS,
                    payload: response.data.DataList,
                });
                callback(response);
            } else if (response.status === 204) {
                dispatch({
                    type: GET_PLANT_CURRENCY_BY_PLANT_IDS,
                    payload: [],
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
                callback({ response }); // Pass the response to the callback
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

