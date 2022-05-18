import {
  API_REQUEST,
  API_FAILURE,
  API_SUCCESS,
  CUSTOM_LOADER_SHOW,
  CUSTOM_LOADER_HIDE,
  SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
  GET_EDIT_PART_COST_DETAILS,
} from '../../../config/constants';
import { tempObject } from '../../../config/masterData';

const initialState = {
  ComponentItemData: {},
  ComponentItemOverheadData: {},
  ComponentItemPackageFreightData: {},
  ComponentItemToolData: {},
  ComponentItemDiscountData: {},
  costingData: {},
  singleCostingDetail: {},
  viewCostingDetailData: [],
  partNo: '',
  costingApprovalData: [],
  IsIncludedSurfaceInOverheadProfit: false,
  IsCostingDateDisabled: false,
  IsToolCostApplicable: false,
  SurfaceCostData: {},
  RMCCutOffObj: { IsCutOffApplicable: false, CutOffRMC: '' },
  getAssemBOPCharge: {},
  checkIsOverheadProfitChange: false,
  checkIsFreightPackageChange: false,
  checkIsToolTabChange: false,
  subAssemblyTechnologyArray: [],


}

export default function costingReducer(state = initialState, action) {
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
    case API_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
      }
    case CUSTOM_LOADER_SHOW:
      return {
        ...state,
        showLoading: true,
      }
    case CUSTOM_LOADER_HIDE:
      return {
        ...state,
        showLoading: false,
        error: true,
      }
    case SUB_ASSEMBLY_TECHNOLOGY_ARRAY:
      const tempRMData = [...action.payload]
      return {
        ...state,
        subAssemblyTechnologyArray: tempRMData,
      }
    case GET_EDIT_PART_COST_DETAILS:
      return {
        ...state,
        subAssemblyTechnologyArray: action.payload,
      }


    default:
      return state
  }
}
