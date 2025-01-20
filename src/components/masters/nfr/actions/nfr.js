
import axios from 'axios';
import {
    API,
    API_FAILURE,
    API_REQUEST,
    NFR_DETAILS_FOR_DISCOUNT,
    SET_OPEN_ALL_TABS,
    config,

} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';
import { loggedInUserId, userDepartmetList } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import axiosInstance from '../../../../utils/axiosInstance';

export function getAllNfrList(callback) {
    return (dispatch) => {
        const loggedInUser = { loggedInUserId: loggedInUserId() }
        const request = axios.get(`${API.getAllNfrList}?loggedInUserId=${loggedInUser?.loggedInUserId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);

            apiErrors(error);
        });
    };
}

export function getNfrPartDetails(nfrId, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getNfrPartDetails}/${nfrId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
 * @method saveNFRGroupDetails
 * @description save NFR Group Details
 */
export function saveNFRGroupDetails(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.saveNFRGroupDetails, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

export function getNFRPartWiseGroupDetail(data, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getNFRPartWiseGroupDetail}/${data?.nfrId}/${data?.partWiseDetailId}/${data?.plantId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
 * @method nfrSendToApproverBySender
 * @description save NFR Group Details
 */
export function nfrSendToApproverBySender(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.nfrSendToApproverBySender, requestData, config())
            .then((response) => {
                if ((response && response.status === 200) || response.data.Result) {
                    callback(response);
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        Toaster.error(response.data.Message)
                    }
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getNFRApprovals
 * @description get NFR Approvals
 */
export function getNFRApprovals(userId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRApprovals}?loggedInUserId=${userId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
 * @method getNFRApprovalSummary
 * @description get NFR Approval Summary
 */
export function getNFRApprovalSummary(approvalProcessId, loggedInUserId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRApprovalSummary}/${approvalProcessId}/${loggedInUserId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
 * @method approvedCostingByApprover
 * @description approve Costing By Approver
 */
export function approvedCostingByApprover(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.approvedCostingByApprover, requestData, config())
            .then((response) => {
                if ((response && response?.status === 200) || response?.data?.Result) {
                    callback(response);
                } else {
                    dispatch({ type: API_FAILURE })
                    if (response.data.Message) {
                        Toaster.error(response.data.Message)
                    }
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method nfrDetailsForDiscount
 * @description nfrDetailsForDiscount  
 */
export function nfrDetailsForDiscountAction(data) {
    return (dispatch) => {
        dispatch({
            type: NFR_DETAILS_FOR_DISCOUNT,
            payload: data,
        });
    }
};

export function pushNfrOnSap(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.pushNfrOnSap, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

export function fetchNfrDetailFromSap(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSapnfrData}?fromDate=null&toDate=null`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
 * @method saveNFRCostingInfo
 * @description save NFR Costing Info
 */
export function saveNFRCostingInfo(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.saveNFRCostingInfo}?nfrGroupId=${data?.nfrGroupId}&vendorId=${data?.vendorId}&costingId=${data?.costingId}&loggedInUserId=${data?.loggedInUserId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error);
        });
    };
}


export function saveOutsourcingData(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.saveOutsourcingData, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method getNFRCostingOutsourcingDetails
 * @description getNFRCostingOutsourcingDetails
 */
export function getNFRCostingOutsourcingDetails(baseCostingId, nfrRawMaterialAndBoughtOutPartDetailId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRCostingOutsourcingDetails}?baseCostingId=${baseCostingId ? baseCostingId : null}&nfrRawMaterialAndBoughtOutPartDetailId=${nfrRawMaterialAndBoughtOutPartDetailId ? nfrRawMaterialAndBoughtOutPartDetailId : null}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
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
* @method getRMFromNFR
 * @description getRMFromNFR
 */
export function getRMFromNFR(data, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRMFromNFR}?technologyId=${data?.technologyId}&nfrId=${data?.nfrId}&partId=${data?.partId}&vendorId=${data?.vendorId}&plantId=${data?.plantId}&costingId=${data?.costingId}&effectiveDate=${data?.effectiveDate}`, config());
        request.then((response) => {
            if (response?.data?.Result || response?.status === 204) {
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
* @method getRawMaterialByNFRPart
 * @description getRawMaterialByNFRPart
 */
export function getRawMaterialByNFRPart(nfrPartWiseDetailId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getRawMaterialByNFRPart}?nfrPartWiseDetailId=${nfrPartWiseDetailId}`, config());
        request.then((response) => {
            if (response?.data?.Result || response?.status === 204) {
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
 * @method setOpenAll
 * @description setOpenAll  
 */
export function setOpenAllTabs(data) {
    return (dispatch) => {
        dispatch({
            type: SET_OPEN_ALL_TABS,
            payload: data,
        });
    }
};

/**
 * @method pushNfrRmBopOnSap
 * @description push Nfr Rm Bop On Sap
 */
export function pushNfrRmBopOnSap(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.pushNfrRmBopOnSap, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method createNFRBOMDetails
 * @description create NFR BOM Details
 */
export function createNFRBOMDetails(requestData, callback) {
    return (dispatch) => {
        axiosInstance.post(API.createNFRBOMDetails, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method deleteNFRDetailAPI
 * @description delete NFR Detail API 
 */
export function deleteNFRDetailAPI(nfrId, loggedInUserId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `nfrId=${nfrId}&loggedInUserId=${loggedInUserId}`
        axios.delete(`${API.deleteNFRDetailAPI}?${queryParams}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}
