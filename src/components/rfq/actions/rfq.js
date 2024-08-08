
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
    GET_RFQ_VENDOR_DETAIL,
    GET_TARGET_PRICE,
    GET_ASSEMBLY_CHILD_PART,
    GET_RFQ_PART_DETAILS,
    GET_RFQ_RAISE_NUMBER,
    GET_QUOTATION_DETAILS_LIST,
    GET_PART_IDENTITY,
    GET_QUOTATION_ID_FOR_RFQ,
    SET_RM_SPECIFIC_ROW_DATA,
    SELECT_PURCHASE_REQUISITION,
    SELECT_BOP_NUMBER,
    SELECT_BOP_CATEGORY,
    SET_BOP_SPECIFIC_ROW_DATA,
    GET_BOP_PR_QUOTATION_DETAILS,
    SET_BOP_PR_QUOTATION_IDENTITY,
    GET_RFQ_TOOLING_DETAILS,
    UPDATED_TOOLING_DATA,
} from '../../../config/constants';
import { MESSAGES } from '../../../config/message';
import { loggedInUserId, userDetails } from '../../../helper';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';


export function getQuotationList(DepartmentCode, Timezone, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getQuotationList}?DepartmentCode=${""}&LoggedInUserId=${loggedInUserId()}&Timezone=${Timezone}`, config());
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
            dispatch({
                type: GET_QUOTATION_ID_FOR_RFQ,
                payload: response.status === 204 ? "" : response.data.Identity
            })
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

export function deleteQuotationPartDetail(partId, callback) {
    const quotationPartId = Number(partId)
    return (dispatch) => {
        axios.delete(`${API.deleteQuotationPartDetail}?quotationPartId=${quotationPartId}`, config())
            .then((response) => {
                callback(response)
            }).catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE })
            })

    };
}

export function getQuotationDetailsList(id, callback) {

    return (dispatch) => {
        const request = axios.get(`${API.getQuotationDetailsList}?quotationId=${id}&loggedInUserId=${loggedInUserId()}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({ type: GET_QUOTATION_DETAILS_LIST, payload: response.data.DataList })
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
export function getTargetPrice(plantId, partId, technologyId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getTargetPrice}?plantId=${plantId}&partId=${partId}&technologyId=${technologyId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_TARGET_PRICE,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function setVendorDetails(data) {
    return (dispatch) => {
        dispatch({
            type: GET_RFQ_VENDOR_DETAIL,
            payload: data || {},
        });
    }
};
export function setTargetPriceDetail(data) {
    return (dispatch) => {
        dispatch({
            type: GET_TARGET_PRICE,
            payload: data || {},
        });
    }
};
export function setRfqPartDetails(data) {
    return (dispatch) => {
        dispatch({
            type: GET_RFQ_PART_DETAILS,
            payload: data || {},
        });
    }
};
export function getAssemblyChildpart(partId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAssemblyChildpart}?partId=${partId}`, config());
        request.then((response) => {

            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_ASSEMBLY_CHILD_PART,
                    payload: response.status === 204 ? [] : response?.data?.DataList
                })

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function getrRqVendorDetails(vendorId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getrRqVendorDetails}?vendorId=${vendorId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_RFQ_VENDOR_DETAIL,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function saveRfqPartDetails(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.saveRfqPartDetails, data, config());
        request.then((response) => {

            if (response.data.Result) {
                dispatch({
                    type: GET_PART_IDENTITY,
                    payload: response.status === 204 ? [] : response?.data?.Identity
                })
                callback(response);
            }
        }).catch((error) => {

            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
}

export function getRfqPartDetails(partId, callback) {

    const quotationPartId = Number(partId)

    return (dispatch) => {
        dispatch({
            type: GET_RFQ_PART_DETAILS,
            payload: []
        })
        const request = axios.get(`${API.getRfqPartDetails}?quotationPartId=${quotationPartId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_RFQ_PART_DETAILS,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })

                callback(response);
            }
        }).catch((error) => {

            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function setQuotationIdForRfq(data) {
    return (dispatch) => {
        dispatch({
            type: GET_QUOTATION_ID_FOR_RFQ,
            payload: data || "",
        });
    }
};
export function checkRegisteredVendor(vendorId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.checkRegisteredVendor}?vendorId=${vendorId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

export function setRmSpecificRowData(data) {

    return (dispatch) => {
        dispatch({
            type: SET_RM_SPECIFIC_ROW_DATA,
            payload: data || [],
        });
    }
};
export function getPurchaseRequisitionSelectList(callback) {


    return (dispatch) => {
        dispatch({
            type: SELECT_PURCHASE_REQUISITION,
            payload: []
        })
        const request = axios.get(`${API.getPurchaseRequisitionSelectList}`, config());
        request.then((response) => {

            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: SELECT_PURCHASE_REQUISITION,
                    payload: response.status === 204 ? [] : response?.data?.SelectList
                })

                callback(response);
            }
        }).catch((error) => {


            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function getBopNumberSelectList(callback) {

    return (dispatch) => {
        dispatch({
            type: SELECT_BOP_NUMBER,
            payload: []
        })
        const request = axios.get(`${API.getRfqBopNumberSelectList}`, config());
        request.then((response) => {

            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: SELECT_BOP_NUMBER,
                    payload: response.status === 204 ? [] : response?.data?.SelectList
                })

                callback(response);
            }
        }).catch((error) => {


            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function getBopCategorySelectList(boughtOutPartChildId, callback) {
    return (dispatch) => {
        dispatch({
            type: SELECT_BOP_CATEGORY,
            payload: []
        })
        const request = axios.get(`${API.getRfqBOPCategorySelectList}/${boughtOutPartChildId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: SELECT_BOP_CATEGORY,
                    payload: response.status === 204 ? [] : response?.data?.SelectList
                })

                callback(response);
            }
        }).catch((error) => {

            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function setBopSpecificRowData(data) {

    return (dispatch) => {
        dispatch({
            type: SET_BOP_SPECIFIC_ROW_DATA,
            payload: data || [],
        });
    }
};
export function createQuotationPrParts(data, callback) {
    const prNumbersId = Number(data.prNumbersId)
    return (dispatch) => {
        const request = axios.post(API.createQuotationPrParts, data, config());
        request.then((response) => {

            if (response.data.Result) {
                dispatch({
                    type: SET_BOP_PR_QUOTATION_IDENTITY,
                    payload: response.status === 204 ? [] : response?.data?.Identity
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };
};
// return (dispatch) => {
//     const request = axios.post(`${API.createQuotationPrParts}?prNumbersId=${prNumbersId}&quotationId=${obj.quotationId}&loggedInUserId=${obj.loggedInUserId}`, config());
//     request.then((response) => {
//         if (response.data.Result) {
//             callback(response);
//         }
//     }).catch((error) => {
//         dispatch({ type: API_FAILURE });
//         apiErrors(error);
//         callback(error)
//     });
// };
//}
export function getRfqToolingDetails(PrNumber, callback) {

    const prNumberId = Number(PrNumber)

    return (dispatch) => {
        dispatch({
            type: GET_RFQ_TOOLING_DETAILS,
            payload: []
        })
        const request = axios.get(`${API.getRfqPartDetails}?prNumberId=${prNumberId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_RFQ_TOOLING_DETAILS,
                    payload: response.status === 204 ? [] : response?.data?.Data
                })

                callback(response);
            }
        }).catch((error) => {

            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}
export function updatedToolingData(data) {
    return (dispatch) => {
        dispatch({
            type: GET_RFQ_TOOLING_DETAILS,
            payload: data,
        });
    };
}
