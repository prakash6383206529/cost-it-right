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
    GET_COMMODITYININDEX_DATA_FOR_DOWNLOAD
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
            commodityExchangeId:"", commodityExchangeName: obj.commodityExchangeName, description:"",isApplyPagination: isPagination, skip: skip, take: take
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
            commodityId:"", commodityName: obj.commodityName,commodityShortName: obj.commodityShortName, description:"",isApplyPagination: isPagination, skip: skip, take: take
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
