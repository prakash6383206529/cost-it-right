import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    EXCHANGE_RATE_DATALIST,
    GET_EXCHANGE_RATE_DATA,
    GET_CURRENCY_SELECTLIST_BY,
    config,
} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';

const headers = config;


/**
 * @method createExchangeRate
 * @description CREATE EXCHANGE RATE 
 */
export function createExchangeRate(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.post(API.createExchangeRate, data, headers);
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
 * @method getExchangeRateDataList
 * @description GET EXCHANGE RATE DATALIST
 */
export function getExchangeRateDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.get(`${API.getExchangeRateDataList}?currencyId=${data.currencyId}`, { headers })
            .then((response) => {
                if (response.data.Result === true) {
                    dispatch({
                        type: EXCHANGE_RATE_DATALIST,
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
 * @method getExchangeRateData
 * @description GET EXCHANGE RATE DATA
 */
export function getExchangeRateData(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ID !== '') {
            axios.get(`${API.getExchangeRateData}/${ID}`, headers)
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
            callback({});
        }
    };
}

/**
 * @method deleteExchangeRate
 * @description DELETE EXCHANGE RATE
 */
export function deleteExchangeRate(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteExchangeRate}/${Id}`, headers)
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
        axios.put(`${API.updateExchangeRate}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
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
        const request = axios.get(`${API.getCurrencySelectList}`, headers);
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