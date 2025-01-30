import axios from 'axios'
import {
  API, API_FAILURE, GET_SEND_FOR_APPROVAL_SUCCESS, GET_ALL_APPROVAL_DEPARTMENT, GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
  GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT, GET_ALL_REASON_SELECTLIST, GET_APPROVAL_LIST, config, GET_APPROVAL_SUMMARY, GET_SELECTED_COSTING_STATUS, GET_APPROVAL_LIST_DRAFT, SET_SAP_DATA,
} from '../../../config/constants'
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util'
import { MESSAGES } from '../../../config/message'
import Toaster from '../../common/Toaster'
import { reactLocalStorage } from 'reactjs-localstorage'
import { userDetails } from '../../../helper'

// const config() = config
// const config() = {
//   'Content-Type': 'application/json',
//   //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
// };

/**
 * @method getSendForApproval
 * @description get SEND FOR APPROVAL DATA BY COSTING ID
 */
export function getSendForApprovalByCostingId(CostingId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSendForApproval}/${CostingId}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_SEND_FOR_APPROVAL_SUCCESS,
            payload: response.data.Data,
          })
          callback(response)
        } else {
          Toaster.error(MESSAGES.SOME_ERROR)
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
 * @method getSendForApproval
 * @description get SEND FOR APPROVAL DATA BY COSTING ID
 */
export function getAllApprovalDepartment(receiverId,callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getAllApprovalDepartment}?receiverId=${receiverId??null}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_ALL_APPROVAL_DEPARTMENT,
            payload: response.data.SelectList,
          })
          callback(response)
        } else {
          Toaster.error(MESSAGES.SOME_ERROR)
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
 * @method getAllApprovalUserByDepartment
 * @description GET ALL APPROVAL USERS BY DEPARTMENT
 */
export function getAllApprovalUserByDepartment(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.getAllApprovalUserByDepartment, data, config(),)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
            payload: response.data.DataList,
          })
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({
          type: API_FAILURE,
        })
        apiErrors(error)
      })
  }
}

/**
 * @method getAllApprovalUserFilterByDepartment
 * @description GET ALL APPROVAL USERS FILTER BY DEPARTMENT
 */
export function getAllApprovalUserFilterByDepartment(data, callback) {
  return (dispatch) => {
    const request = axios.post(`${API.getAllApprovalUserFilterByDepartment}`, data, config(),)

    request
      .then((response) => {

        if (response.data.Result) {
          dispatch({
            type: GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT,
            payload: response.data.DataList,
          })
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({
          type: API_FAILURE,
        })
        apiErrors(error)
      })
  }
}

/**
 * @method sendForApproval
 * @description SEND COSTING FOR APPROVAL
 */
export function sendForApproval(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.sendForApproval, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method approvalProcess
 * @description SEND COSTING FOR APPROVAL PROCESS
 */
export function approvalProcess(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.approvalProcess, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method finalApprovalProcess
 * @description SEND COSTING FOR APPROVAL PROCESS
 */
export function finalApprovalProcess(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.finalApprovalProcess, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method getSendForApproval
 * @description get SEND FOR APPROVAL DATA BY COSTING ID
 */
export function getReasonSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getReasonSelectList}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_ALL_REASON_SELECTLIST,
            payload: response.data.SelectList,
          })
          callback(response)
        } else {
          Toaster.error(MESSAGES.SOME_ERROR)
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
 * @method sendForApprovalBySender
 * @description SEND COSTING FOR APPROVAL BY SENDER
 */
export function sendForApprovalBySender(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.sendForApprovalBySender, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      } else {
        dispatch({ type: API_FAILURE })
        if (response.data.Message) {
          Toaster.error(response.data.Message)
        }
      }
    })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error)
      })
  }
}

/**
 * @method getApprovalList
 * @description for getting list of approval
 */

export function getApprovalList(filterData, skip, take, isPagination, obj, delegation, callback) {
  return (dispatch) => {
    dispatch({
      type: GET_APPROVAL_LIST,
      payload: [],
    })
    dispatch({
      type: GET_APPROVAL_LIST_DRAFT,
      payload: [],
    })
    const queryParameter = `isDashboard=${filterData.isDashboard}&logged_in_user_id=${filterData.loggedUser}&logged_in_user_level_id=${filterData.logged_in_user_level_id}&part_number=${filterData.partNo}&created_by=${filterData.createdBy}&requested_by=${filterData.requestedBy}&Status=${obj.DisplayStatus !== undefined ? obj.DisplayStatus : ""}&type_of_costing=''&NCCPartQuantity=${obj.NCCPartQuantity ? obj.NCCPartQuantity : ""}&IsRegularized=${obj.IsRegularized ? obj.IsRegularized : ""}&CostingHead=${obj.CostingHead ? obj.CostingHead : ""}`
    // const queryParamsSecond = `ApprovalNumber=${obj.ApprovalNumber !== undefined ? obj.ApprovalNumber : ""}&CostingNumber=${obj.CostingNumber !== undefined ? obj.CostingNumber : ""}&PartNumber=${obj.PartNumber !== undefined ? obj.PartNumber : ""}&PartName=${obj.PartName !== undefined ? obj.PartName : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&Plant=${obj.PlantName !== undefined ? obj.PlantName : ""}&Technology=${obj.TechnologyName !== undefined ? obj.TechnologyName : ""}&NewPrice=${obj.NetPOPriceNew !== undefined ? obj.NetPOPriceNew : ""}&OldPrice=${obj.OldPOPrice !== undefined ? obj.OldPOPrice : ""}&Reason=${obj.Reason !== undefined ? obj.Reason : ""}&EffectiveDate=${obj.EffectiveDate !== undefined ? obj.EffectiveDate : ""}&InitiatedBy=${obj.CreatedBy !== undefined ? obj.CreatedBy : ""}&CreatedOn=${obj.CreatedOn !== undefined ? obj.CreatedOn : ""}&LastApprovedBy=${obj.RequestedBy !== undefined ? obj.RequestedBy : ""}&RequestedOn=${obj.RequestedOn !== undefined ? obj.RequestedOn : ""}&applyPagination=${isPagination}&skip=${skip}&take=${take}&CustomerName=${obj.Customer !== undefined ? obj.Customer : ''}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}&IsScrapUOMApply=${obj.IsScrapUOMApply ? (obj.IsScrapUOMApply?.toLowerCase() === 'yes' ? true : false) : ''}&CalculatedFactor=${obj.CalculatedFactor !== undefined ? obj.CalculatedFactor : ''}&ScrapUnitOfMeasurement=${obj.ScrapUnitOfMeasurement !== undefined ? obj.ScrapUnitOfMeasurement : ''}&UOMToScrapUOMRatio=${obj.UOMToScrapUOMRatio !== undefined ? obj.UOMToScrapUOMRatio : ''}`
    const queryParamsSecond = encodeQueryParamsAndLog({
      ApprovalNumber: obj.ApprovalNumber,
      CostingNumber: obj.CostingNumber,
      PartNumber: obj.PartNumber,
      PartName: obj.PartName,
      Vendor: obj.VendorName,
      Plant: obj.PlantName,
      Technology: obj.TechnologyName,
      NewPrice: obj.NetPOPriceNew,
      OldPrice: obj.OldPOPrice,
      Reason: obj.Reason,
      EffectiveDate: obj.EffectiveDate,
      InitiatedBy: obj.CreatedBy,
      CreatedOn: obj.CreatedOn,
      LastApprovedBy: obj.RequestedBy,
      RequestedOn: obj.RequestedOn,
      applyPagination: isPagination,
      skip: skip,
      take: take,
      CustomerName: obj.Customer,
      IsCustomerDataShow: !delegation ? reactLocalStorage.getObject('CostingTypePermission').cbc : true,
      IsVendorDataShow: !delegation ? reactLocalStorage.getObject('CostingTypePermission').vbc : true,
      IsZeroDataShow: !delegation ? reactLocalStorage.getObject('CostingTypePermission').zbc : true,
      IsScrapUOMApply: obj.IsScrapUOMApply ? (obj.IsScrapUOMApply.toLowerCase() === 'yes' ? true : false) : '',
      CalculatedFactor: obj.CalculatedFactor,
      ScrapUnitOfMeasurement: obj.ScrapUnitOfMeasurement,
      UOMToScrapUOMRatio: obj.UOMToScrapUOMRatio,
      IsShowDelegationData:  userDetails()?.IsUserDelegatee
    });
    const request = axios.get(`${API.getApprovalList}?${queryParameter}&${queryParamsSecond}`, config())
    request
      .then((response) => {
        if (response.data.Result || response.status === 204) {
          if (filterData.isDashboard) {
            dispatch({
              type: GET_APPROVAL_LIST,
              payload: response.status === 204 ? [] : response.data.DataList,
            })
          } else {
            dispatch({
              type: GET_APPROVAL_LIST_DRAFT,
              payload: response.status === 204 ? [] : response.data.DataList,
            })
          }
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

/**
 * @method approvalRequestByApprove
 * @description approving the request by approve
 */
export function approvalRequestByApprove(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.approveCostingByApprover, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error)
      })
  }
}
/**
 * @method rejectRequestByApprove
 * @description rejecting approval Request
 */
export function rejectRequestByApprove(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.rejectCostingByApprover, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method getApprovalSummary
 * @description getting summary of approval by approval id
 */

export function getApprovalSummary(
  approvalNumber,
  approvalProcessId,
  loggedInUserId,
  receiverId,
  callback,
) {
  return (dispatch) => {
    const request = axios.get(
      `${API.getApprovalSummaryByApprovalNo}/${approvalNumber}/${approvalProcessId}/${loggedInUserId}/${receiverId}`, config())
    request
      .then((response) => {
        if (response?.data?.Result) {
          dispatch({
            type: GET_APPROVAL_SUMMARY,
            payload: response?.data?.Data,
          })
          callback(response)
        } else {
          Toaster.error(MESSAGES.SOME_ERROR)
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error)
      })
  }
}



/**
 * @method isFinalApprover
 * @description FOR FINDING WHETHER USER IS AT HIGHER LEVEL OR NOT
 */
export function isFinalApprover(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.isFinalApprover, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method pushedApprovedCosting
 * @description FOR PUSHING APPROVED COSTING TO CRM/SCHEDULING (DEPEND ON DIFFERENT COMPANY)
 */
export function pushedApprovedCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.approvalPushed, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

export function getSelectedCostingList(callback) {
  return (dispatch) => {
    const request = axios.get(API.getSelectedCostingStatusList, config())
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SELECTED_COSTING_STATUS,
          payload: response.data.SelectList
        })
      }
    })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}




/**
 * @methodcreateRawMaterialSAP
 * @description create Raw Material SAP 
 */
export function createRawMaterialSAP(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createRawMaterialSAP, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @methodcreateRawMaterialSAP
 * @description create Raw Material SAP 
 */
export function approvalPushedOnSap(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.approvalPushedOnSap, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
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
 * @method setSAPData
 * @description SET SAP DATA
 */
export function setSAPData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_SAP_DATA,
      payload: data,
    });
  }
};





