import {
  API_REQUEST,
  API_FAILURE,
  SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
  GET_EDIT_PART_COST_DETAILS,
} from '../../../config/constants';

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
  getEditPartCostDetails: []
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
    case SUB_ASSEMBLY_TECHNOLOGY_ARRAY:
      const tempRMData = [...action.payload]
      return {
        ...state,
        subAssemblyTechnologyArray: tempRMData,
      }
    case GET_EDIT_PART_COST_DETAILS:
      return {
        ...state,
        getEditPartCostDetails: action.payload,
      }


    default:
      return state
  }
}
