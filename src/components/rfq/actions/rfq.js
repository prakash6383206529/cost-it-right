
import axios from 'axios';
import {
    API,
    API_FAILURE,
    GET_QUOTATION_BY_ID,
    GET_QUOTATION_LIST,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { loggedInUserId, userDetails } from '../../../helper';
import { MESSAGES } from '../../../config/message';



export function getQuotationList(callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getQuotationList}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_QUOTATION_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                })

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);

            apiErrors(error);
        });
    };
}


export function createRfqQuotation(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.createRfqQuotation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function cancelRfqQuotation(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.cancelRfqQuotation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function updateRfqQuotation(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.updateRfqQuotation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}


export function getQuotationById(Id, callback) {
    return (dispatch) => {
        axios.get(`${API.getQuotationById}?quotationId=${Id}`, config())
            .then((response) => {
                dispatch({
                    type: GET_QUOTATION_BY_ID,
                    payload: response.data.Data,
                });
                callback(response)
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}


/**
 * @method fileUploadQuotation
 * @description File Upload Quotation
 */
export function fileUploadQuotation(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadQuotation, data, config())
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
            callback(error)
        })
    }
}



export function sendReminderForQuotation(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.sendReminderForQuotation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}