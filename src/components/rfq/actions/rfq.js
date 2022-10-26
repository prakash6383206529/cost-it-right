
import axios from 'axios';
import {
    API,
    API_FAILURE,
    GET_QUOTATION_LIST,
    config,
    API_REQUEST,
} from '../../../config/constants';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from '../../../helper';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';


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

export function cancelRfqQuotation(id, callback) {
    let data = { QuotationId: id }
    return (dispatch) => {
        const request = axios.post(`${API.cancelRfqQuotation}`, data, config());
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


export function getQuotationById(id, callback) {
    return (dispatch) => {
        axios.get(`${API.getQuotationById}?quotationId=${id}`, config())
            .then((response) => {
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




/**
 * @method fileDeleteQuotation
 * @description DELETE QUOTATION FILES
 */
export function fileDeleteQuotation(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })
        axios.delete(`${API.fileDeleteQuotation}/${data.Id}/${data.DeletedBy}`, config())
            .then((response) => {
                callback(response)
            }).catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE })
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


export function getContactPerson(vendorId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getContactPerson}?vendorId=${vendorId}`, config());
        request.then((response) => {
            callback(response)
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}



export function getQuotationDetailsList(id, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getQuotationDetailsList}?quotationId=${id}&loggedInUserId=${loggedInUserId()}`, config());
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


/**
 * @method getSingleCostingDetails
 * @description Used to fetch costing details by costingId
 */
export function getMultipleCostingDetails(selectedRows, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST })

        let temp = []
        selectedRows && selectedRows.map((item) => {

            let request = axios.get(`${API.getCostingDetailsByCostingId}/${item.CostingId}`, config(),)
            temp.push(request)

        })

        axios.all(temp).then((response) => {
            if (response) {
                callback(response)
            } else {
                Toaster.error(MESSAGES.SOME_ERROR)
            }
        })
            .catch((error) => {

                dispatch({ type: API_FAILURE })
                apiErrors(error)
            })
    }
}



export function getCommunicationHistory(id, callback) {
    return (dispatch) => {
        axios.get(`${API.getCommunicationHistory}?costingId=${id}`, config())
            .then((response) => {
                callback(response)
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}



export function checkExistCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.checkExistCosting, data, config());
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