import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_CLIENT_DATA_SUCCESS,
    GET_CLIENT_SELECTLIST_SUCCESS,
    config,
} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';
const headers = config

/**
 * @method createClient
 * @description create Client 
 */
export function createClient(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.post(API.createClient, data, headers);
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
 * @method updateClient
 * @description update Client details
 */
export function updateClient(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axios.put(`${API.updateClient}`, requestData, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method getClientData
 * @description Get Client Data
 */
export function getClientData(ClientId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ClientId !== '') {
            axios.get(`${API.getClientData}/${ClientId}`, headers)
                .then((response) => {
                    if (response.data.Result === true) {
                        dispatch({
                            type: GET_CLIENT_DATA_SUCCESS,
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
                type: GET_CLIENT_DATA_SUCCESS,
                payload: {},
            });
        }
    };
}

/**
 * @method getClientDataList
 * @description get all operation list
 */
export function getClientDataList(filterData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const QueryParams = `clientName=${filterData.clientName}&companyName=${filterData.companyName}`
        axios.get(`${API.getClientDataList}?${QueryParams}`, { headers })
            .then((response) => {
                callback(response);
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                callback(error);
                apiErrors(error);
            });
    };
}

/**
 * @method deleteClient
 * @description delete Client
 */
export function deleteClient(ID, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteClient}/${ID}`, headers)
            .then((response) => {
                callback(response);
            }).catch((error) => {
                console.log('error: ', error);
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


/**
 * @method getClientSelectList
 * @description Used to Client selectlist
 */
export function getClientSelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getClientSelectList}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_CLIENT_SELECTLIST_SUCCESS,
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