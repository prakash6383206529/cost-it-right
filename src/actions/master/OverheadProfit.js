import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_OVERHEAD_PROFIT_SUCCESS,
    GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
    GET_OVERHEAD_PROFIT_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_MODEL_TYPE_SELECTLIST,
    GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST,
    GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST,
    GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'
const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};


/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getOverheadProfitComboData(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getOverheadProfitComboDataAPI}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
                    payload: response.data.DynamicData,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
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
        const request = axios.post(API.createOverhead, data, headers);
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
 * @method createProfit
 * @description create Profit
 */
export function createProfit(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.post(API.createProfit, data, headers);
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
 * @method updateOverhead
 * @description update Overhead details
 */
export function updateOverhead(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateOverhead}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
        axios.put(`${API.updateProfit}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
        if (ID != '') {
            axios.get(`${API.getOverheadData}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
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
        if (ID != '') {
            axios.get(`${API.getProfitData}/${ID}`, headers)
                .then((response) => {
                    if (response.data.Result == true) {
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
export function getOverheadDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `costing_head=${data.costing_head}&vendor_id=${data.vendor_id}&overhead_applicability_type_id=${data.overhead_applicability_type_id}&model_type_id=${data.model_type_id}`
        axios.get(`${API.getOverheadDataList}?${queryParams}`, { headers })
            .then((response) => {
                dispatch({
                    type: GET_OVERHEAD_PROFIT_SUCCESS,
                    payload: response.data.DataList,
                });
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
export function getProfitDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `costing_head=${data.costing_head}&vendor_id=${data.vendor_id}&profit_applicability_type_id=${data.profit_applicability_type_id}&model_type_id=${data.model_type_id}`
        axios.get(`${API.getProfitDataList}?${queryParams}`, { headers })
            .then((response) => {
                dispatch({
                    type: GET_OVERHEAD_PROFIT_SUCCESS,
                    payload: response.data.DataList,
                });
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
export function deleteOverhead(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteOverhead}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method deleteProfit
 * @description delete Profit
 */
export function deleteProfit(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteProfit}/${Id}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
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
        axios.put(`${API.activeInactiveOverhead}`, requestData, headers)
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
        axios.put(`${API.activeInactiveProfit}`, requestData, headers)
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
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.post(API.fileUploadOverHead, data, headers);
        request.then((response) => {
            if (response && response.status == 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileUploadProfit
 * @description File Upload Profit
 */
export function fileUploadProfit(data, callback) {
    return (dispatch) => {
        let multipartHeaders = {
            'Content-Type': 'multipart/form-data;'
        };
        const request = axios.post(API.fileUploadProfit, data, headers);
        request.then((response) => {
            if (response && response.status == 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileDeleteOverhead
 * @description delete Overhead file API
 */
export function fileDeleteOverhead(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteOverhead}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method fileDeleteProfit
 * @description delete Profit file API
 */
export function fileDeleteProfit(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteProfit}/${data.Id}/${data.DeletedBy}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method overheadBulkUpload
 * @description create Overhead by Bulk Upload
 */
export function overheadBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.overheadBulkUpload, data, headers);
        request.then((response) => {
            if (response.status == 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method profitBulkUpload
 * @description create Profit by Bulk Upload
 */
export function profitBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.profitBulkUpload, data, headers);
        request.then((response) => {
            if (response.status == 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
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
        const request = axios.get(`${API.getModelTypes}?text=${modelTypeHeading}`, headers);
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
 * @method getVendorWithVendorCodeSelectList
 * @description GET VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getVendorWithVendorCodeSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getVendorWithVendorCodeSelectList, headers);
        request.then((response) => {
            dispatch({
                type: GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
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
        const request = axios.get(`${API.getVendorFilterByModelTypeSelectList}/${ID}`, headers);
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
        const request = axios.get(`${API.getModelTypeFilterByVendorSelectList}/${ID}`, headers);
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
        const request = axios.get(`${API.getProfitVendorFilterByModelSelectList}/${ID}`, headers);
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
        const request = axios.get(`${API.getProfitModelFilterByVendorSelectList}/${ID}`, headers);
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