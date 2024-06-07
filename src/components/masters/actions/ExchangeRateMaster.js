import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    EXCHANGE_RATE_DATALIST,
    GET_EXCHANGE_RATE_DATA,
    GET_CURRENCY_SELECTLIST_BY,
    config,
} from '../../../config/constants';
import { apiErrors, getValueFromLabel } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId } from '../../../helper';
import _ from 'lodash';
import DayTime from '../../common/DayTimeWrapper';
import { reactLocalStorage } from 'reactjs-localstorage';

// const config() = config;


/**
 * @method createExchangeRate
 * @description CREATE EXCHANGE RATE 
 */
export function createExchangeRate(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(API.createExchangeRate, data, config());
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
 * @method getExchangeRateDataList
 * @description GET EXCHANGE RATE DATALIST
 */
export function getExchangeRateDataList(isAPICall, data, callback) {
    return (dispatch) => {
        if (isAPICall) {
            dispatch({ type: API_REQUEST });
            axios.get(`${API.getExchangeRateDataList}?currencyId=${data?.currencyId}&costingHeadId=${data?.costingHeadId}&vendorId=${data?.vendorId}&customerId=${data?.customerId}&isBudgeting=${data?.isBudgeting}&currency=${data?.currency}&isRequestForSimulation=${data?.isRequestForSimulation ? true : false}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}`, config())
                .then((response) => {
                    if (response.data.Result === true || response.status === 204) {
                        dispatch({
                            type: EXCHANGE_RATE_DATALIST,
                            payload: response.status === 204 ? [] : response.data.DataList,
                        });
                        callback(response);
                    }
                }).catch((error) => {
                    dispatch({ type: API_FAILURE });
                    callback(error);
                    apiErrors(error);
                });
        } else {
            dispatch({
                type: EXCHANGE_RATE_DATALIST,
                payload: [],
            });
        }
    };
}

/**
 * @method getExchangeRateData
 * @description GET EXCHANGE RATE DATA
 */
export function getExchangeRateData(ID, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getExchangeRateData}/${ID}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_EXCHANGE_RATE_DATA,
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
                type: GET_EXCHANGE_RATE_DATA,
                payload: {},
            });
            // callback({});
        }
    };
}

/**
 * @method deleteExchangeRate
 * @description DELETE EXCHANGE RATE
 */
export function deleteExchangeRate(exchangeRateId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `exchangeRateId=${exchangeRateId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteExchangeRate}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateExchangeRate
 * @description UPDATE EXCHANGE RATE
 */
export function updateExchangeRate(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateExchangeRate}`, requestData, config())
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
* @method getCurrencySelectList
* @description CURRENCY SELECTLIST
*/
export function getCurrencySelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getCurrencySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CURRENCY_SELECTLIST_BY,
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
 * @method createMultipleExchangeRate
 * @description create Multiple Exchange Rate 
 */
export function createMultipleExchangeRate(dataList, currencySelectList, effectiveDate, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        let temp = []
        dataList && dataList.map((item) => {
            let data = {
                "CurrencyId": getValueFromLabel(item?.Currency, currencySelectList)?.Value,
                "CurrencyExchangeRate": item?.NewCurrencyExchangeRate,
                "BankRate": item?.BankRate,
                "CustomRate": item?.CustomRate,
                "BankCommissionPercentage": item?.BankCommissionPercentage,
                "EffectiveDate": DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
                "LoggedInUserId": loggedInUserId(),
                "CostingHeadId": item?.CostingHeadId ? item?.CostingHeadId : item?.CostingTypeId,
                "CustomerId": item?.CustomerId,
                "VendorId": item?.VendorId,
                "IsBudgeting": item?.IsBudgeting,
                "IsExchangeRateSimulation": true,
                "OldCurrencyExchangeRate": item?.CurrencyExchangeRate,
            }
            const request = axios.post(API.createExchangeRate, data, config());
            temp.push(request)
        })
        axios.all(temp).then((response) => {
            if (response) {
                let arrayfromapi = _.map(response, 'data.Data')
                callback(arrayfromapi)
            } else {
                Toaster.error(MESSAGES.SOME_ERROR)
            }
        }).catch((error) => {
            callback(error)
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}
