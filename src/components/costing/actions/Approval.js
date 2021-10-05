import axios from 'axios'
import {
  API, API_REQUEST, API_FAILURE, GET_SEND_FOR_APPROVAL_SUCCESS, GET_ALL_APPROVAL_DEPARTMENT, GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
  GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT, GET_ALL_REASON_SELECTLIST, GET_APPROVAL_LIST, config, GET_APPROVAL_SUMMARY, GET_SELECTED_COSTING_STATUS,
} from '../../../config/constants'
import { apiErrors } from '../../../helper/util'
import { MESSAGES } from '../../../config/message'
import { toastr } from 'react-redux-toastr'

const headers = config
// const headers = {
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
    const request = axios.get(`${API.getSendForApproval}/${CostingId}`, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_SEND_FOR_APPROVAL_SUCCESS,
            payload: response.data.Data,
          })
          callback(response)
        } else {
          toastr.error(MESSAGES.SOME_ERROR)
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
export function getAllApprovalDepartment(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getAllApprovalDepartment}`, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_ALL_APPROVAL_DEPARTMENT,
            payload: response.data.SelectList,
          })
          callback(response)
        } else {
          toastr.error(MESSAGES.SOME_ERROR)
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
    const request = axios.post(API.getAllApprovalUserByDepartment, data, headers,)
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
            toastr.error(response.data.Message)
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
    const request = axios.post(`${API.getAllApprovalUserFilterByDepartment}`, data, headers,)

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
            toastr.error(response.data.Message)
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
    const request = axios.post(API.sendForApproval, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
    const request = axios.post(API.approvalProcess, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
    const request = axios.post(API.finalApprovalProcess, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
    const request = axios.get(`${API.getReasonSelectList}`, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_ALL_REASON_SELECTLIST,
            payload: response.data.SelectList,
          })
          callback(response)
        } else {
          toastr.error(MESSAGES.SOME_ERROR)
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
    const request = axios.post(API.sendForApprovalBySender, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
 * @method getApprovalList
 * @description for getting list of approval
 */

export function getApprovalList(filterData, callback) {

  return (dispatch) => {
    const queryParameter = `isDashboard=${filterData.isDashboard}&logged_in_user_id=${filterData.loggedUser}&logged_in_user_level_id=${filterData.logged_in_user_level_id}&part_number=${filterData.partNo}&created_by=${filterData.createdBy}&requested_by=${filterData.requestedBy}&status=${filterData.status}&type_of_costing=''`
    const request = axios.get(`${API.getApprovalList}?${queryParameter}`, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_APPROVAL_LIST,
            payload: response.data.DataList,
          })
          callback(response)
        } else {
          toastr.error(MESSAGES.SOME_ERROR)
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
    const request = axios.post(API.approveCostingByApprover, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
 * @method rejectRequestByApprove
 * @description rejecting approval Request
 */
export function rejectRequestByApprove(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.rejectCostingByApprover, data, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            toastr.error(response.data.Message)
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
  callback,
) {
  return (dispatch) => {
    const request = axios.get(
      `${API.getApprovalSummaryByApprovalNo}/${approvalNumber}/${approvalProcessId}/${loggedInUserId}`, headers)
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_APPROVAL_SUMMARY,
            payload: response.data.Data,
          })
          callback(response)
        } else {
          toastr.error(MESSAGES.SOME_ERROR)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}



/**
 * @method isFinalApprover
 * @description FOR FINDING WHETHER USER IS AT HIGHER LEVEL OR NOT
 */
export function isFinalApprover(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.isFinalApprover, data, headers)
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
    const request = axios.post(API.approvalPushed, data, headers)
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
    const request = axios.get(API.getSelectedCostingStatusList, headers)
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
    const request = axios.post(API.createRawMaterialSAP, data, headers)
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
    const request = axios.post(API.approvalPushedOnSap, data, headers)
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





