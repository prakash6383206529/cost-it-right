import axios from 'axios'
import {
    API,
    API_FAILURE,
    GET_VOLUME_DATA_LIST,
    config,
    GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,

} from '../../../config/constants'
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util'
import Toaster from '../../common/Toaster'
import { userDetails } from '../../../helper'
import axiosInstance from '../../../utils/axiosInstance'


/**
 * @method getVolumeDataList
 * @description get all operation list
 */
export function getBudgetDataList(skip, take, isPagination, obj, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });  
        const QueryParams = encodeQueryParamsAndLog({
            costingHead: obj.CostingHead,
            financialYear: obj.FinancialYear,
            netPoPrice: obj.NetPoPrice,
            budgetedPoPrice: obj.BudgetedPoPrice,
            partName: obj.PartName,
            partNumber: obj.partNoWithRevNo,
            plantName: obj.plantNameWithCode,
            plantCode: obj.PlantCode,
            vendorName: obj.vendorNameWithCode,
            vendorCode: obj.VendorCode,
            applyPagination: isPagination,
            skip: skip,
            take: take,
            customerName: obj.customerNameWithCode,
            PartId: obj.PartId,
            partType: obj?.PartType,
            IsCustomerDataShow: obj?.IsCustomerDataShow,
            IsVendorDataShow: obj?.IsVendorDataShow,
            IsZeroDataShow: obj?.IsZeroDataShow
        });
        // const QueryParams = `costingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&financialYear=${obj.FinancialYear !== undefined ? obj.FinancialYear : ""}&netPoPrice=${obj.NetPoPrice !== undefined ? obj.NetPoPrice : ""}&budgetedPoPrice	=${obj.BudgetedPoPrice !== undefined ? obj.BudgetedPoPrice : ""}&partName=${obj.PartName !== undefined ? obj.PartName : ""}&partNumber=${obj.partNoWithRevNo !== undefined ? obj.partNoWithRevNo : ""}&plantName=${obj.plantNameWithCode !== undefined ? obj.plantNameWithCode : ""}&plantCode=${obj.PlantCode !== undefined ? obj.PlantCode : ""}&vendorName=${obj.vendorNameWithCode !== undefined ? obj.vendorNameWithCode : ""}&vendorCode=${obj.VendorCode !== undefined ? obj.VendorCode : ""}&applyPagination=${isPagination !== undefined ? isPagination : ""}&skip=${skip !== undefined ? skip : ""}&take=${take !== undefined ? take : ""}&customerName=${obj.customerNameWithCode !== undefined ? obj.customerNameWithCode : ''}&PartId=${obj.PartId !== undefined ? obj.PartId : ""}&partType=${obj?.PartType !== undefined ? obj?.PartType : ""}&IsCustomerDataShow=${obj?.IsCustomerDataShow}&IsVendorDataShow=${obj?.IsVendorDataShow}&IsZeroDataShow=${obj?.IsZeroDataShow}`
        axios.get(`${API.getBudgetDataList}?${QueryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    if (isPagination) {
                        dispatch({
                            type: GET_VOLUME_DATA_LIST,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    } else {
                        dispatch({
                            type: GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
                            payload: response.status === 204 ? [] : response.data.DataList
                        })
                    }
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                callback(error)
                apiErrors(error)
            })
    }
}


export function getApprovedPartCostingPrice(obj, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });    
        const QueryParams = `costingHeadId=${obj.costingHeadId !== undefined ? obj.costingHeadId : ""}&partId=${obj.partId !== undefined ? obj.partId : ""}&plantId=${obj.plantId !== undefined ? obj.plantId : ""}&vendorId=${obj.vendorId !== undefined ? obj.vendorId : ""}&customerId=${obj.customerId !== undefined ? obj.customerId : ""}`
        axios.get(`${API.getApprovedPartCostingPrice}?${QueryParams}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                callback(error)
                apiErrors(error)
            })
    }
}


export function createBudget(data, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axiosInstance.post(API.createBudget, data, config())
        request
            .then((response) => {
                if (response.data.Result === true) {
                    callback(response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                apiErrors(error)
                callback(error);
            })
    }
}


export function updateBudget(requestData, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.updateBudget}`, requestData, config())
            .then((response) => {
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
                callback(error)
            });
    };
}



export function getPartCostingHead(callback) {
    return (dispatch) => {

        axios.get(`${API.getPartCostingHead}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                callback(error)
                apiErrors(error)
            })
    }
}


export function getMasterBudget(Id, callback) {
    return (dispatch) => {

        axios.get(`${API.getMasterBudget}?budgetingId=${Id}`, config())
            .then((response) => {
                if (response.data.Result || response.status === 204) {
                    callback(response.status === 204 ? [] : response)
                }
            })
            .catch((error) => {
                dispatch({ type: API_FAILURE })
                callback(error)
                apiErrors(error)
            })
    }
}


/**
 * @method bulkUploadBudgetMaster
 * @description BULK UPLOAD FOR BUDGET MASTER
 */
export function bulkUploadBudgetMaster(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.bulkUploadBudgetMaster, data, config());
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

export function masterApprovalRequestBySenderBudget(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.masterApprovalRequestBySenderBudget, data, config())
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

export function masterApprovalAPI(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.masterApprovalAPI, data, config())
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

export function deleteBudget(ID, callback) {
    return (dispatch) => {
        const QueryParams = `budgetingId=${ID}&LoggedInUserId=${userDetails().LoggedInUserId}`
        axios
            .delete(`${API.deleteBudget}?${QueryParams}`, config())
            .then((response) => {
                callback(response)
            })
            .catch((error) => {
                apiErrors(error)
                dispatch({ type: API_FAILURE })
            })
    }
}
