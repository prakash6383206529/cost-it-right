import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_CLIENT_DATA_SUCCESS,
    GET_CLIENT_SELECTLIST_SUCCESS,
    GET_CLIENT_DATALIST_SUCCESS,
    config,
    GET_POAM_STATUS_SELECTLIST
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';
// const config() = config

/**
 * @method createClient
 * @description create Client 
 */
export function createClient(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createClient, data, config());
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
        axiosInstance.put(`${API.updateClient}`, requestData, config())
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
 * @method getClientData
 * @description Get Client Data
 */
export function getClientData(ClientId, callback) {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (ClientId !== '') {
            axios.get(`${API.getClientData}/${ClientId}/${loggedInUser?.loggedInUserId}`, config())
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
        const QueryParams = `loggedInUserId=${loggedInUserId()}&clientName=${filterData.clientName}&companyName=${filterData.companyName}`
        axios.get(`${API.getClientDataList}?${QueryParams}`, config())
            .then((response) => {
                if (response.status === 204 && response.data === '') {
                    dispatch({
                        type: GET_CLIENT_DATALIST_SUCCESS,
                        payload: [],
                    });
                } else if (response && response.data && response.data.DataList) {
                    let Data = response.data.DataList;
                    dispatch({
                        type: GET_CLIENT_DATALIST_SUCCESS,
                        payload: Data,
                    });
                } else {

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
 * @method deleteClient
 * @description delete Client
 */
export function deleteClient(clientId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `clientId=${clientId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteClient}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {

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
        const request = axios.get(`${API.getClientSelectList}`, config());
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
/**
 * @method checkAndGetCustomerCode
 * @description CHECK AND GET CUSTOMER CODE
 */
export function checkAndGetCustomerCode(code, name, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const requestBody = {
            LoggedInUserId: loggedInUserId(),
            customerName: name,
            customerCode: code
        };

        const request = axiosInstance.post(`${API.checkAndGetCustomerCode}`, requestBody, config());

        request.then((response) => {

            if (response && (response.status === 200 || response.status === 202)) {

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            if (error.response && error.response.status === 412) {
                // Handle the 412 status code here
                callback(error.response); // Pass the response to the callback function
            } else {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            }
        });
    };
}
/**
 * @method getPoamStatusSelectList
 * @description Used to Get Poam Status selectlist
 */
export function getPoamStatusSelectList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getPoamStatusSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_POAM_STATUS_SELECTLIST,
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