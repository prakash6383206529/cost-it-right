import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_OVERHEAD_PROFIT_SUCCESS,
    GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
    GET_OVERHEAD_PROFIT_DATA_SUCCESS,
    GET_MODEL_TYPE_SELECTLIST,
    GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST,
    GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST,
    GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST,
    GET_OVERHEAD_PROFIT_SUCCESS_ALL,
    config
} from '../../../config/constants';
import { apiErrors, encodeQueryParams, encodeQueryParamsAndLog } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { reactLocalStorage } from 'reactjs-localstorage';
// const config() = config

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getOverheadProfitComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOverheadProfitComboDataAPI}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                Toaster.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method createOverhead
 * @description create Overhead
 */
export function createOverhead(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.post(API.createOverhead, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
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
 * @method createProfit
 * @description create Profit
 */
export function createProfit(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.post(API.createProfit, data, config());
        request.then((response) => {
            if (response.data.Result === true) {
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
 * @method updateOverhead
 * @description update Overhead details
 */
export function updateOverhead(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateOverhead}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method updateProfit
 * @description update Profit details
 */
export function updateProfit(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateProfit}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error);
            });
    };
}

/**
 * @method getOverheadData
 * @description Get Overhead data
 */
export function getOverheadData(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getOverheadData}/${ID}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
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
                type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method getProfitData
 * @description Get Profit data
 */
export function getProfitData(ID, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getProfitData}/${ID}`, config())
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
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
                type: GET_OVERHEAD_PROFIT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method getOverheadDataList
 * @description get Overhead all record.
 */
export function getOverheadDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = encodeQueryParamsAndLog({
            costing_head: obj.costing_head, vendor_id: obj.vendor_id, overhead_applicability_type_id: obj.overhead_applicability_type_id, model_type_id: obj.model_type_id,
            CostingHead: obj.CostingHead, VendorName: obj.VendorName, ClientName: obj.ClientName, ModelType: obj.ModelType,
            OverheadApplicability: obj.OverheadApplicabilityType, OverheadApplicabilityPercentage: obj.OverheadPercentage, OverheadOnRMPercentage: obj.OverheadRMPercentage, OverheadOnBOPPercentage: obj.OverheadBOPPercentage,
            OverheadOnCCPercentage: obj.OverheadMachiningCCPercentage, EffectiveDate: obj.EffectiveDateNew, Plant: obj.PlantName, applyPagination: isPagination,
            skip: skip, take: take, CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '', RawMaterialName: obj.RawMaterialName !== undefined ? obj.RawMaterialName : '',
            RawMaterialGrade: obj.RawMaterialGrade !== undefined ? obj.RawMaterialGrade : '', TechnologyName: obj.TechnologyName !== undefined ? obj.TechnologyName : '',
            IsCustomerDataShow: reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false,
            IsVendorDataShow: reactLocalStorage.getObject('CostingTypePermission').vbc, IsZeroDataShow: reactLocalStorage.getObject('CostingTypePermission').zbc
        });

        // const queryParams = `costing_head=${data.costing_head}&vendor_id=${data.vendor_id}&overhead_applicability_type_id=${data.overhead_applicability_type_id}&model_type_id=${data.model_type_id}&CostingHead=${obj.CostingHead ? obj.CostingHead : ""}&VendorName=${obj.VendorName ? obj.VendorName : ""}&ClientName=${obj.ClientName ? obj.ClientName : ""}&ModelType=${obj.ModelType ? obj.ModelType : ""}&OverheadApplicability=${obj.OverheadApplicabilityType ? obj.OverheadApplicabilityType : ""}&OverheadApplicabilityPercentage=${obj.OverheadPercentage ? obj.OverheadPercentage : ""}&OverheadOnRMPercentage=${obj.OverheadRMPercentage ? obj.OverheadRMPercentage : ""}&OverheadOnBOPPercentage=${obj.OverheadBOPPercentage ? obj.OverheadBOPPercentage : ""}&OverheadOnCCPercentage=${obj.OverheadMachiningCCPercentage ? obj.OverheadMachiningCCPercentage : ""}&EffectiveDate=${obj.EffectiveDateNew ? obj.EffectiveDateNew : ""}&Plant=${obj.PlantName ? obj.PlantName : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&RawMaterialName=${obj.RawMaterialName !== undefined ? obj.RawMaterialName : ''}&RawMaterialGrade=${obj.RawMaterialGrade !== undefined ? obj.RawMaterialGrade : ''}&TechnologyName=${obj.TechnologyName !== undefined ? obj.TechnologyName : ''}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}`
        axios.get(`${API.getOverheadDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_SUCCESS,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        });
                    } else {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_SUCCESS_ALL,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        })
                    }
                }
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method getProfitDataList
 * @description get Overhead all record.
 */
export function getProfitDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = encodeQueryParamsAndLog({
            costing_head: obj.costing_head, vendor_id: obj.vendor_id, profit_applicability_type_id: obj.profit_applicability_type_id, model_type_id: obj.model_type_id,
            CostingHead: obj.CostingHead, VendorName: obj.VendorName, ClientName: obj.ClientName, ModelType: obj.ModelType,
            ProfitApplicability: obj.ProfitApplicability, ProfitApplicabilityPercentage: obj.ProfitPercentage, ProfitOnRMPercentage: obj.ProfitRMPercentage, ProfitOnBOPPercentage: obj.ProfitBOPPercentage,
            ProfitOnCCPercentage: obj.ProfitMachiningCCPercentage, EffectiveDate: obj.EffectiveDateNew, Plant: obj.PlantName, applyPagination: isPagination,
            skip: skip, take: take, CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '', RawMaterialName: obj.RawMaterialName !== undefined ? obj.RawMaterialName : '',
            RawMaterialGrade: obj.RawMaterialGrade !== undefined ? obj.RawMaterialGrade : '', TechnologyName: obj.TechnologyName !== undefined ? obj.TechnologyName : '',
            IsCustomerDataShow: reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false,
            IsVendorDataShow: reactLocalStorage.getObject('CostingTypePermission').vbc, IsZeroDataShow: reactLocalStorage.getObject('CostingTypePermission').zbc
        });
        axios.get(`${API.getProfitDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_OVERHEAD_PROFIT_SUCCESS,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        });
                    } else {

                        dispatch({
                            type: GET_OVERHEAD_PROFIT_SUCCESS_ALL,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        });
                    }
                }
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method deleteOverhead
 * @description delete Overhead
 */
export function deleteOverhead(overheadId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `overheadId=${overheadId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteOverhead}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteProfit
 * @description delete Profit
 */
export function deleteProfit(profitId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `profitId=${profitId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteProfit}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method activeInactiveOverhead
 * @description active inactive Overhead
 */
export function activeInactiveOverhead(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.activeInactiveOverhead}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method activeInactiveProfit
 * @description active inactive Profit
 */
export function activeInactiveProfit(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.activeInactiveProfit}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method fileUploadOverHead
 * @description File Upload Over Head
 */
export function fileUploadOverHead(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadOverHead, data, config());
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
 * @method fileUploadProfit
 * @description File Upload Profit
 */
export function fileUploadProfit(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadProfit, data, config());
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
 * @method overheadBulkUpload
 * @description create Overhead by Bulk Upload
 */
export function overheadBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.overheadBulkUpload, data, config());
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
 * @method profitBulkUpload
 * @description create Profit by Bulk Upload
 */
export function profitBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.profitBulkUpload, data, config());
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
 * @method fetchModelTypeAPI
 * @description Used to fetch MODEL TYPES
 */
export function fetchModelTypeAPI(modelTypeHeading, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getModelTypes}?text=${modelTypeHeading}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MODEL_TYPE_SELECTLIST,
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
 * @method getVendorFilterByModelTypeSelectList
 * @description GET VENDOR BY MODELTYPE IN FILTER IN OVERHEAD
 */
export function getVendorFilterByModelTypeSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorFilterByModelTypeSelectList}/${ID}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST,
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
 * @method getModelTypeFilterByVendorSelectList
 * @description GET MODELTYPE BY VENDOR IN FILTER IN OVERHEAD
 */
export function getModelTypeFilterByVendorSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getModelTypeFilterByVendorSelectList}/${ID}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST,
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
 * @method getProfitVendorFilterByModelSelectList
 * @description GET VENDOR BY MODELTYPE IN FILTER IN PROFIT
 */
export function getProfitVendorFilterByModelSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProfitVendorFilterByModelSelectList}/${ID}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST,
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
 * @method getProfitModelFilterByVendorSelectList
 * @description GET MODELTYPE BY VENDOR IN FILTER IN PROFIT
 */
export function getProfitModelFilterByVendorSelectList(ID, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getProfitModelFilterByVendorSelectList}/${ID}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST,
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