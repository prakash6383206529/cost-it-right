import {
  API_REQUEST,
  API_FAILURE,
  GET_SEND_FOR_APPROVAL_SUCCESS,
  GET_ALL_APPROVAL_DEPARTMENT,
  GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
  GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT,
  GET_ALL_REASON_SELECTLIST,
  GET_APPROVAL_LIST,
  GET_APPROVAL_SUMMARY,
  GET_SELECTED_COSTING_STATUS,
  GET_APPROVAL_LIST_DRAFT,
  SET_SAP_DATA,
} from '../../../config/constants'
import { tokenStatus, tokenStatusName } from '../../../config/masterData'
import { userDetails, checkForDecimalAndNull, getConfigurationKey } from '../../../helper'

const initialState = {
  SAPObj: { PurchasingGroup: '', MaterialGroup: '', infoCategory: '', evaluationType: '', leadTime: '' }
}

export default function ApprovalReducer(state = initialState, action) {
  switch (action.type) {
    case API_REQUEST:
      return {
        ...state,
        loading: true,
      }
    case API_FAILURE:
      return {
        ...state,
        loading: false,
        error: true,
      }
    case GET_SEND_FOR_APPROVAL_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        approvalData: action.payload,
      }
    case GET_ALL_APPROVAL_DEPARTMENT:
      const list = action.payload
      const Departments = userDetails().Department && userDetails().Department.map(item => item.DepartmentName)
      const updateList = list && list.filter(item => Departments.includes(item.Text))
      return {
        ...state,
        loading: false,
        error: true,
        approvalDepartmentList: updateList,
      }
    case GET_ALL_APPROVAL_USERS_BY_DEPARTMENT:
      return {
        ...state,
        loading: false,
        error: true,
        approvalUsersList: action.payload,
      }
    case GET_ALL_APPROVAL_USERS_FILTER_BY_DEPARTMENT:
      return {
        ...state,
        loading: false,
        // error: true,
        approvalUserListByDepartment: action.payload,
      }
    case GET_ALL_REASON_SELECTLIST:
      return {
        ...state,
        loading: false,
        error: true,
        reasonsList: action.payload,
      }
    case GET_APPROVAL_LIST:
      let arr = action.payload && action.payload.map((item) => {
        item.NetPOPriceNew = checkForDecimalAndNull(item.NetPOPrice, getConfigurationKey()?.NoOfDecimalForPrice)
        item.OldPOPriceNew = checkForDecimalAndNull(item.OldPOPrice, getConfigurationKey()?.NoOfDecimalForPrice)
        item.IsScrapUOMApply = item.IsScrapUOMApply === true ? 'Yes' : 'No'
        return item
      })
      return {
        ...state,
        loading: false,
        approvalList: arr,
      }
    case GET_APPROVAL_LIST_DRAFT:
      let temp = action.payload && action.payload.map((item) => {
        item.NetPOPriceNew = checkForDecimalAndNull(item.NetPOPrice, getConfigurationKey()?.NoOfDecimalForPrice)
        item.OldPOPriceNew = checkForDecimalAndNull(item.OldPOPrice, getConfigurationKey()?.NoOfDecimalForPrice)
        switch (item.Status) {
          case tokenStatusName.AWAITING_FOR_APPROVAL:
            item.TooltipText = tokenStatus.AwaitingForApproval;
            break;
          case tokenStatusName.PENDING_FOR_APPROVAL:
            item.TooltipText = tokenStatus.PendingForApproval;
            break;
          case tokenStatusName.DRAFT:
            item.TooltipText = tokenStatus.Draft;
            break;
          case tokenStatusName.APPROVED:
            item.TooltipText = tokenStatus.Approved;
            break;
          case tokenStatusName.REJECTED:
            item.TooltipText = tokenStatus.Rejected;
            break;
          case tokenStatusName.PUSHED:
            item.TooltipText = tokenStatus.Pushed;
            break;
          case tokenStatusName.ERROR:
            item.TooltipText = tokenStatus.Error;
            break;
          case tokenStatusName.HISTORY:
            item.TooltipText = tokenStatus.History;
            break;
          case tokenStatusName.LINKED:
            item.TooltipText = tokenStatus.Linked;
            break;
          case tokenStatusName.PROVISIONAL:
            item.TooltipText = tokenStatus.Provisional;
            break;
          case tokenStatusName.POUPDATED:
            item.TooltipText = tokenStatus.POUpdated;
            break;

          default:
            break;
        }
        return item
      })
      return {
        ...state,
        loading: false,
        approvalListDraft: temp,
      }
    case GET_APPROVAL_SUMMARY:
      return {
        ...state,
        loading: false,
        error: true,
        approvalSummaryData: action.payload,
      }
    case GET_SELECTED_COSTING_STATUS:
      return {
        ...state,
        loading: false,
        error: true,
        costingStatusList: action.payload
      }
    case SET_SAP_DATA:
      return {
        ...state,
        loading: false,
        SAPObj: action.payload
      }
    default:
      return state
  }
}
