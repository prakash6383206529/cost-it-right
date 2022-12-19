import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_BOP_DOMESTIC_DATA_SUCCESS,
    GET_BOP_IMPORT_DATA_SUCCESS,
    GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
    GET_ALL_VENDOR_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_SUCCESS,
    GET_PLANT_SELECTLIST_BY_VENDOR,
    GET_BOP_SOB_VENDOR_DATA_SUCCESS,
    GET_INITIAL_SOB_VENDORS_SUCCESS,
    GET_BOP_DOMESTIC_DATA_LIST,
    GET_ALL_BOP_DOMESTIC_DATA_LIST,
    GET_BOP_IMPORT_DATA_LIST,
    GET_BOP_APPROVAL_LIST,
    config,
    GET_SOB_LISTING,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { loggedInUserId, userDetails } from '../../../helper';
import Toaster from '../../common/Toaster';
import { bopQueryParms } from '../masterUtil';

// const config() = config

/**
 * @method createBOPAPI
 * @description create baught out parts master
 */
export function createBOPDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPDomestic, data, config());
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
 * @method createBOPImport
 * @description create BOP Import
 */
export function createBOPImport(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPImport, data, config());
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
 * @method getBOPDomesticDataList
 * @description get all BOP Domestic Data list.
 */
export function getBOPDomesticDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        console.log(obj, "objobj")
        // dispatch({ type: API_REQUEST});
        if (isPagination === true) {
            dispatch({
                type: GET_BOP_DOMESTIC_DATA_LIST,
                payload: undefined
            })
        }
        const queryParams = `bop_for=${data.bop_for}&NetCost=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&DepartmentCode=${obj.DepartmentName !== undefined ? obj.DepartmentName : ""}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}&IsCustomerDataShow=${obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false}`
        const queryParamsSecond = bopQueryParms(isPagination, skip, take, obj)
        const request = axios.get(`${API.getBOPDomesticDataList}?${queryParams}&${queryParamsSecond}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                if (isPagination === true) {
                    dispatch({
                        type: GET_BOP_DOMESTIC_DATA_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                } else {
                    dispatch({
                        type: GET_ALL_BOP_DOMESTIC_DATA_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                }
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getBOPImportDataList
 * @description get all BOP Import Data list.
 */
export function getBOPImportDataList(data, skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `bop_for=${data.bop_for}&Currency=${obj.Currency !== undefined ? obj.Currency : ""}&NetCostCurrency=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&NetCost=${obj.NetLandedCostConversion !== undefined ? obj.NetLandedCostConversion : ""}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&DepartmentCode=${obj.DepartmentCode !== undefined ? obj.DepartmentCode : ""}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}&IsCustomerDataShow=${obj?.IsCustomerDataShow !== undefined ? obj?.IsCustomerDataShow : false}`
        const queryParamsSecond = bopQueryParms(isPagination, skip, take, obj)
        const request = axios.get(`${API.getBOPImportDataList}?${queryParams}&${queryParamsSecond}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                if (isPagination === true) {
                    dispatch({
                        type: GET_BOP_IMPORT_DATA_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                } else {
                    dispatch({
                        type: GET_ALL_BOP_DOMESTIC_DATA_LIST,
                        payload: response.status === 204 ? [] : response.data.DataList
                    })
                }
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
 * @method getBOPDomesticById
 * @description get one bought out part based on id
 */
export function getBOPDomesticById(bopId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (bopId !== '') {
            axios.get(`${API.getBOPDomesticById}/${bopId}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_BOP_DOMESTIC_DATA_SUCCESS,
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
                type: GET_BOP_DOMESTIC_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method getBOPImportById
 * @description get one bought out part based on id
 */
export function getBOPImportById(bopId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (bopId !== '') {
            axios.get(`${API.getBOPImportById}/${bopId}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_BOP_IMPORT_DATA_SUCCESS,
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
                type: GET_BOP_IMPORT_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method deleteBOP
 * @description delete BOP
 */
export function deleteBOP(Id, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.deleteBOP}/${Id}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method updateBOPDomestic
 * @description update BOP Domestic
 */
export function updateBOPDomestic(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateBOPDomestic}`, requestData, config())
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
 * @method updateBOPImport
 * @description update BOP Import
 */
export function updateBOPImport(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateBOPImport}`, requestData, config())
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
 * @method createBOPCategory
 * @description create BOP Category
 */
export function createBOPCategory(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.createBOPCategory, data, config());
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
 * @method getBOPCategorySelectList
 * @description Used to fetch BOP Category selectlist
 */
export function getBOPCategorySelectList(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOPCategorySelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
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
 * @method getAllVendorSelectList
 * @description GET ALL VENDORS SELECTLIST
 */
export function getAllVendorSelectList() {
    return (dispatch) => {
        const request = axios.get(API.getAllVendorSelectList, config());
        request.then((response) => {
            dispatch({
                type: GET_ALL_VENDOR_SELECTLIST_SUCCESS,
                payload: response.data.SelectList,
            });
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getPlantSelectList
* @description Used to get select list of Vendor's
*/
export function getPlantSelectList(callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectList}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SELECTLIST_SUCCESS,
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
* @method getPlantSelectListByVendor
* @description Used to get select list of Plant by Vendors
*/
export function getPlantSelectListByVendor(VendorId, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getPlantSelectListByVendor}/${VendorId}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_PLANT_SELECTLIST_BY_VENDOR,
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
 * @method fileUploadBOPDomestic
 * @description File Upload BOP Domestic
 */
export function fileUploadBOPDomestic(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.fileUploadBOPDomestic, data, config());
        request.then((response) => {
            if (response && response.status === 200) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method fileDeleteBOPDomestic
 * @description delete FILE DELETE API
 */
export function fileDeleteBOPDomestic(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.delete(`${API.fileDeleteBOPDomestic}/${data.Id}/${data.DeletedBy}`, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

/**
 * @method bulkUploadBOPDomesticZBC
 * @description upload bulk BOP Domestic ZBC
 */
export function bulkUploadBOPDomesticZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPDomesticZBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method bulkUploadBOPDomesticVBC
 * @description upload bulk BOP Domestic VBC
 */
export function bulkUploadBOPDomesticVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPDomesticVBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method bulkUploadBOPDomesticCBC
 * @description upload bulk BOP Domestic CBC
 */
export function bulkUploadBOPDomesticCBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPDomesticCBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method bulkUploadBOPImportZBC
 * @description upload bulk BOP Domestic ZBC
 */
export function bulkUploadBOPImportZBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPImportZBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method bulkUploadBOPImportVBC
 * @description upload bulk BOP Domestic VBC
 */
export function bulkUploadBOPImportVBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPImportVBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method bulkUploadBOPImportCBC
 * @description upload bulk BOP Import CBC
 */
export function bulkUploadBOPImportCBC(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.bulkUploadBOPImportCBC, data, config());
        request.then((response) => {
            if (response.status === 200) {
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
 * @method getManageBOPSOBDataList
 * @description get all BOP SOB Data list.
 */
export function getInitialFilterData(boughtOutPartNumber, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `boughtOutPartNumber=${boughtOutPartNumber}`
        const request = axios.get(`${API.getManageBOPSOBDataList}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_INITIAL_SOB_VENDORS_SUCCESS,
                    payload: response.data.DataList,
                });
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getManageBOPSOBDataList
 * @description get all BOP SOB Data list.
 */
export function getManageBOPSOBDataList(data, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        const queryParams = `bought_out_part_id=${data.bought_out_part_id}&plant_id=${data.plant_id}`
        const request = axios.get(`${API.getManageBOPSOBDataList}?${queryParams}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                dispatch({
                    type: GET_SOB_LISTING,
                    payload: response.status === 204 ? [] : response.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            //apiErrors(error);
        });
    };
}

/**
 * @method getManageBOPSOBById
 * @description GET MANAGE BOP SOB BY ID
 */
export function getManageBOPSOBById(boughtOutPartNumber, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        if (boughtOutPartNumber !== '') {
            const queryParams = `boughtOutPartNumber=${boughtOutPartNumber}`
            axios.get(`${API.getManageBOPSOBById}?${queryParams}`, config())
                .then((response) => {
                    if (response.data.Result) {
                        dispatch({
                            type: GET_BOP_SOB_VENDOR_DATA_SUCCESS,
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
                type: GET_BOP_SOB_VENDOR_DATA_SUCCESS,
                payload: {},
            });
            callback();
        }
    };
}

/**
 * @method updateBOPSOBVendors
 * @description update BOP SOB Vendors
 */
export function updateBOPSOBVendors(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axios.put(`${API.updateBOPSOBVendors}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}



/*
@method getBOPApprovalList

**/
export function getBOPApprovalList(callback) {

    return (dispatch) => {

        dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getBOPApprovalList}?logged_in_user_id=${loggedInUserId()}&logged_in_user_level_id=${userDetails().LoggedInMasterLevelId}&masterId=2`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                //
                dispatch({
                    type: GET_BOP_APPROVAL_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                    // payload: JSON.data.DataList
                })
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);
            apiErrors(error)
        });
    };
}



/**
 * @method masterApprovalRequestBySenderBop
 * @description When sending bop for approval for the first time
 * 
 */
export function masterApprovalRequestBySenderBop(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.masterSendToApproverBop, data, config())
        request.then((response) => {
            if (response.data.Result) {
                callback(response)
            } else {
                dispatch({ type: API_FAILURE })
                if (response.data.Message) {
                    Toaster.error(response.data.Message)
                }
            }
        }).catch((error) => {
            callback(error)
            dispatch({ type: API_FAILURE })
            apiErrors(error)
        })
    }
}