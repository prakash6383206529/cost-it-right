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
  GET_APPROVAL_LIST_DRAFT
} from '../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper'

const initialState = {}

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
      return {
        ...state,
        loading: false,
        error: true,
        approvalDepartmentList: action.payload,
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
    default:
      return state
  }
}
