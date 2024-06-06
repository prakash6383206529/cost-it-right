import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    config,
    GET_COMMODITY_SELECTLIST_BY_TYPE,
    GET_COMMODITYNAME_SELECTLIST_BY_TYPE,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
    CREATE_COMMODITY_SUCCESS,
    CREATE_COMMODITY_FAILURE,
    GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS,
    GET_INDEXCOMMODITY_DATALIST_SUCCESS,
    GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD,
    GET_COMMODITYININDEX_DATALIST_SUCCESS,
    GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD,
    GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS, GET_STANDARDIZEDCOMMODITY_FOR_DOWNLOAD,
    GET_INDEXDATA_LIST_SUCCESS, GET_INDEXDATA_FOR_DOWNLOAD, CREATE_MATERIAL_SUCCESS
}
    from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import Toaster from '../../common/Toaster';

/**
 * @method getCommoditySelectListByType
 * @description get Commodity Index
 */
export function getCommoditySelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommoditySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITY_SELECTLIST_BY_TYPE,
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
 * @method getCommodityNameSelectListByType
 * @description get Commodity NameInIndex
 */
export function getCommodityNameSelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityNameSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITYNAME_SELECTLIST_BY_TYPE,
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
 * @method getCommodityCustomNameSelectListByType
 * @description get Commodity NameInCIR
 */
export function getCommodityCustomNameSelectListByType(callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCommodityCustomNameSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
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
 * @method createCommodityStandardizationData
 * @description create Commodity Standardization
 */
export function createCommodityStandardizationData(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createCommodityStandardization, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: CREATE_COMMODITY_SUCCESS,
                    payload: response?.data.Data
                });
                callback(response);
            } else {
                dispatch({ type: CREATE_COMMODITY_FAILURE });
                if (response?.data.Message) {
                    Toaster.error(response?.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error)
        });
    };
}

/**
 * @method getCommodityStandardizationDataListAPI
 * @description get row Commodity Standardization list
 */
export function getCommodityStandardizationDataListAPI(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getCommodityStandardizationDataList}`, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({
                    type: GET_COMMODITYSTANDARDIZATION_DATALIST_SUCCESS,
                    payload: response?.data.DataList,
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
 * @method getCommodityIndexDataListAPI
 * @description get row Commodity Index list
 */
export function getCommodityIndexDataListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            IndexExchangeId:"", indexExchangeName: obj.IndexExchangeName, description:"",isApplyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCommodityIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_INDEXCOMMODITY_DATALIST_SUCCESS ,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_INDEXCOMMODITY_DATA_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getCommodityInIndexDataListAPI
 * @description get row Commodity In Index list
 */
export function getCommodityInIndexDataListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            commodityId:"", commodityName: obj.CommodityName,commodityShortName: "", description:"",isApplyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getCommodityInIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_COMMODITYININDEX_DATALIST_SUCCESS ,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getStandardizedCommodityListAPI
 * @description get row Standardized Commodity list
 */
export function getStandardizedCommodityListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            commodityStandardizationId:"", commodityStandardName: obj.CommodityStandardName,commodityName: obj.CommodityName, indexExchangeName:obj.IndexExchangeName,Remark: '', isApplyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getStandardizedCommodityDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS ,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_STANDARDIZEDCOMMODITY_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method getIndexDataListAPI
 * @description get row Index Data list
 */
export function getIndexDataListAPI(obj, isPagination, skip, take, callback) {
    return (dispatch) => {
        const queryParams = encodeQueryParamsAndLog({
            commodityMaterialDetailId:"", rate: obj.Rate,currencyCharge: obj.CurrencyCharge, exchangeRate:obj.ExchangeRate,
            rateConversion: obj.RateConversion, exchangeRateSourceName: obj.ExchangeRateSourceName, effectiveDate:obj.EffectiveDate, commodityName:obj.CommodityName,
            indexExchangeName: obj.IndexExchangeName, uom: obj.UOM, currency: obj.Currency,
            Remark: '', isApplyPagination: isPagination, skip: skip, take: take
        });
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getIndexDataList}?${queryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_INDEXDATA_LIST_SUCCESS ,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_INDEXDATA_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    }
}
/**
 * @method createIndexData
 * @description create Index Data
 */
export function createIndexData(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createIndexData, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({ type: CREATE_MATERIAL_SUCCESS, });
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
 * @method deleteIndexData
 * @description delete Index Data API
 */
export function deleteIndexData(commodityDetailId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `commodityMaterialDetailId=${commodityDetailId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteIndexData}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                callback(error.response);
                dispatch({ type: API_FAILURE });
            });
    };
}
/**
 * @method updateIndexData
 * @description update Index Data
 */
export function updateIndexData(requestData, callback) {
    return (dispatch) => {
        axios.put(`${API.updateIndexData}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}
/**
 * @method bulkUploadIndexData
 * @description upload bulk Index Data
 */
export function bulkUploadIndexData(data, callback) {
    return (dispatch) => {
      const request = axios.post(API.bulkUploadIndexData, data, config());
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
 * @method bulkUploadStandardizedCommodity
 * @description upload bulk Standardization Commodity
 */
export function bulkUploadStandardizedCommodity(data, callback) {
    return (dispatch) => {
      const request = axios.post(API.bulkUploadStandardizedCommodity, data, config());
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
 * @method updateCommodityStandardization
 * @description update commodity standardization
 */
export function updateCommodityStandardization(requestData, callback) {
    return (dispatch) => {
        axios.put(`${API.updateCommodityStandardization}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}
/**
 * @method createCommodityCustomName
 * @description create commodity Custom Name
 */
export function createCommodityCustomName(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createCommodityCustomName, data, config());
        request.then((response) => {
            if (response?.data.Result) {
                dispatch({ type: CREATE_COMMODITY_SUCCESS, });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}
 
