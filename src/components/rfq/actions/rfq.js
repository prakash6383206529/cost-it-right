
import axios from 'axios';
import {
    API,
    API_FAILURE,
    GET_QUOTATION_LIST,
    config,
    API_REQUEST,
    CHECK_RFQ_BULK_UPLOAD,
    SELECTED_ROW_ARRAY,
    SET_QUOTATION_ID_FOR_RFQ,
    GET_NFR_SELECT_LIST,
} from '../../../config/constants';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from '../../../helper';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';


export function getQuotationList(DepartmentCode, Timezone, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getQuotationList}?DepartmentCode=${''}&LoggedInUserId=${loggedInUserId()}&Timezone=${Timezone}`, config());
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
            } else {
                callback(response.status)
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
            if (item.CostingId !== null) {
                let request = axios.get(`${API.getCostingDetailsByCostingId}/${item.CostingId}`, config(),)
                temp.push(request)
            }
        })

        axios.all(temp).then((response) => {
            if (response) {
                callback(response)
            } else {
                Toaster.error(MESSAGES.SOME_ERROR)
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}



export function getCommunicationHistory(data, callback) {
    // export function getCommunicationHistory(id, callback) {      //RE
    return (dispatch) => {
        axios.get(`${API.getCommunicationHistory}?quotationId=${data.quotationId}&partId=${data.partId}&vendorId=${data.vendorId}&timeZone=${data.timeZone}`, config())
            // axios.get(`${API.getCommunicationHistory}?costingId=${id}`, config())      //RE
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

//CHECK FOR VENDOR AND PLANT FOR LPS AND SCN
export function checkLPSAndSCN(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getVendorPlantClassificationLpsratingForRFQ}?vendorId=${data.VendorId}&plantId=${data.PlantId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            } else {
                callback({ error: 'Unexpected result format' });
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback({ error });
        });
    };
}

export function checkRFQBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.checkRFQBulkUpload, data, config());
        request.then((response) => {
            if (response?.data?.Result || response?.status === 204) {
                dispatch({
                    type: CHECK_RFQ_BULK_UPLOAD,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })
            }
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

export function setRFQBulkUpload(data) {
    return (dispatch) => {
        dispatch({
            type: CHECK_RFQ_BULK_UPLOAD,
            payload: data
        })
    };
}

export function getQuotationDetailsByVendor(data, callback) {
    return (dispatch) => {
        axios.get(`${API.getQuotationDetailsByVendor}?vendorId=${userDetails().VendorId}&quotationId=${data}`, config())
            .then((response) => {
                callback(response)
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}

export function setSelectedRow(data) {
    return (dispatch) => {
        dispatch({
            type: SELECTED_ROW_ARRAY,
            payload: data
        })
    }
}

/**
 * @method setQuotationIdForRFQ
 * @description set Quotation Id For RFQ
 */
export function setQuotationIdForRFQ(data) {
    return (dispatch) => {
        dispatch({
            type: SET_QUOTATION_ID_FOR_RFQ,
            payload: data,
        });
    }
};

export function rfqSaveBestCosting(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.rfqSaveBestCosting, data, config());
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

export function getNfrSelectList(callback) {
    return (dispatch) => {
        axios.get(`${API.getNfrSelectList}`, config())
            .then((response) => {

                if (response.data.Result || response.status === 204) {

                    dispatch({
                        type: GET_NFR_SELECT_LIST,
                        payload: response.status === 204 ? [] : response.data.SelectList
                    })

                    callback(response);
                }
            }).catch((error) => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
            });
    };
}

export function rfqGetBestCostingDetails(bestCostId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.rfqGetBestCostingDetails}?bestCostId=${bestCostId}`, config());
        request.then((response) => {
            if (response?.data?.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}
export function getNfrAnnualForecastQuantity(nfrId, partId, sopDate, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNfrAnnualForecastQuantity}?nfrId=${nfrId}&partId=${partId}&sopDate=${sopDate}`, config());
        request.then((response) => {
            if (response?.data?.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function getNFRRMList(nfrId, partId, sopDate, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRRMList}?nfrId=${nfrId}&partId=${partId}&sopDate=${sopDate}`, config());
        request.then((response) => {
            if (response?.data?.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function getPartNFRRMList(nfrId, partId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRPartRMList}?nfrId=${nfrId}&partId=${partId}`, config());
        request.then((response) => {
            if (response?.data?.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}