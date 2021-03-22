import {
  API_REQUEST,
  API_FAILURE,
  API_SUCCESS,
  GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
  CREATE_PART_WITH_SUPPLIER_SUCCESS,
  GET_COSTING_BY_COSTINGID,
  GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
  SET_CED_ROW_DATA_TO_COST_SUMMARY,
  SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY,
  SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
  GET_FREIGHT_HEAD_SUCCESS,
  GET_FREIGHT_AMOUNT_DATA_SUCCESS,
  EMPTY_COSTING_DATA,
  GET_ZBC_COSTING_SELECTLIST_BY_PART,
  GET_COSTING_TECHNOLOGY_SELECTLIST,
  GET_COSTING_PART_SELECTLIST,
  GET_PART_INFO,
  GET_COSTING_DATA_BY_COSTINGID,
  GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
  GET_RATE_CRITERIA_BY_CAPACITY,
  SET_RMCC_TAB_DATA,
  SET_COSTING_DATALIST_BY_COSTINGID,
  SET_PO_PRICE,
  SET_RMCCBOP_DATA,
  SET_SURFACE_COST_DATA,
  SET_OVERHEAD_PROFIT_COST_DATA,
  SET_DISCOUNT_COST_DATA,
  SET_COSTING_VIEW_DATA,
  STORE_PART_VALUE,
  GET_COSTING_DETAILS_BY_COSTING_ID,
  GET_COST_SUMMARY_BY_PART_PLANT,
  SET_COSTING_APPROVAL_DATA,
  GET_COSTING_BY_VENDOR_VENDOR_PLANT,
  GET_COSTING_STATUS,
  SET_ITEM_DATA,
  SET_SURFACE_TAB_DATA,
  SET_OVERHEAD_PROFIT_TAB_DATA,
  GET_BULKUPLOAD_COSTING_LIST,
  SET_PACKAGE_AND_FREIGHT_TAB_DATA,
  SET_TOOL_TAB_DATA,
  SET_OTHER_DISCOUNT_TAB_DATA,
  SET_COMPONENT_ITEM_DATA,
  GET_RM_DRAWER_DATA_LIST,
  GET_PROCESS_DRAWER_DATA_LIST,
  GET_PART_COSTING_VENDOR_SELECT_LIST,
  GET_PART_COSTING_PLANT_SELECTLIST
} from '../../../config/constants';

const initialState = {
  costingData: {
    // supplierOne: {},
    // supplierTwo: {},
    // supplierThree: {},
  },
  singleCostingDetail: {},
  viewCostingDetailData: [],
  partNo: '',
  costingApprovalData: [],
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
    case GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        existingSupplierDetail: action.payload,
      }
    case CREATE_PART_WITH_SUPPLIER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        addedSupplier: action.payload,
      }
    case GET_COSTING_BY_COSTINGID:
      let data1 = { ...state.costingData }
      return {
        ...state,
        loading: false,
        error: true,
        costingData: {
          ...data1,
          [action.supplier]: { CostingDetail: action.payload },
        },
      }
    case GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        otherOperationList: action.payload,
      }
    case SET_CED_ROW_DATA_TO_COST_SUMMARY:
      let CEDRowData = action.payload
      let data = state.costingData[action.supplierColumn]
      data = {
        ...data,
        CostingDetail: {
          ...data.CostingDetail,
          CEDOperationId: CEDRowData.CEDOtherOperationId,
          CEDOperationName: CEDRowData.OperationName,
          CEDOperationRate: CEDRowData.OperationRate,
          TransportationOperationCost: null,
          TransportationOperationRate: CEDRowData.TrasnportationRate,
          CEDOtherOperationDetails: CEDRowData,
        },
      }

      return {
        ...state,
        loading: false,
        error: true,
        costingData: { ...state.costingData, [action.supplierColumn]: data },
      }
    case SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY:
      let FreightRowData = action.payload
      let Olddata = state.costingData[action.supplierColumn]
      Olddata = {
        ...Olddata,
        CostingDetail: {
          ...Olddata.CostingDetail,
          AdditionalFreightId: FreightRowData.FreightId,
          NetAdditionalFreightCost: FreightRowData.NetAdditionalFreightCost,
        },
      }
      return {
        ...state,
        loading: false,
        error: true,
        costingData: { ...state.costingData, [action.supplierColumn]: Olddata },
      }

    case SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY:
      let InterestRowData = action.payload;
      let InventoryOlddata = state.costingData[action.supplierColumn];
      InventoryOlddata = {
        ...InventoryOlddata,
        CostingDetail: {
          ...InventoryOlddata.CostingDetail,
          RMICCPercentage: InterestRowData.RMInventoryPercent,
          WIPICCPercentage: InterestRowData.WIPInventoryPercent,
          PaymentTermsICCPercentage: InterestRowData.PaymentTermPercent,
        }
      }
      return {
        ...state,
        loading: false,
        error: true,
        costingData: { ...state.costingData, [action.supplierColumn]: InventoryOlddata }
      };
    case GET_FREIGHT_HEAD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        FreightHeadsList: action.payload
      };
    case GET_FREIGHT_AMOUNT_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        error: true,
        FreightData: action.payload
      };
    case EMPTY_COSTING_DATA:
      return {
        ...state,
        loading: false,
        error: true,
        costingData: action.payload
      };
    case GET_ZBC_COSTING_SELECTLIST_BY_PART:
      return {
        ...state,
        loading: false,
        error: true,
        zbcCostingSelectList: action.payload
      };
    case GET_COSTING_TECHNOLOGY_SELECTLIST:
      return {
        ...state,
        loading: false,
        error: true,
        technologySelectList: action.payload
      };
    case GET_COSTING_PART_SELECTLIST:
      return {
        ...state,
        loading: false,
        error: true,
        partSelectList: action.payload
      };
    case GET_PART_INFO:
      return {
        ...state,
        loading: false,
        error: true,
        partInfo: action.payload
      };
    case GET_COSTING_DATA_BY_COSTINGID:
      return {
        ...state,
        loading: false,
        error: true,
        costingData: action.payload
      };
    case GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST:
      return {
        ...state,
        loading: false,
        freightFullTruckCapacitySelectList: action.payload
      };
    case GET_RATE_CRITERIA_BY_CAPACITY:
      return {
        ...state,
        loading: false,
        rateCriteriaByCapacitySelectList: action.payload
      };
    case SET_RMCC_TAB_DATA:
      return {
        ...state,
        loading: false,
        RMCCTabData: action.payload
      };
    case SET_COSTING_DATALIST_BY_COSTINGID:
      return {
        ...state,
        loading: false,
        CostingDataList: action.payload
      };
    case SET_PO_PRICE:
      return {
        ...state,
        loading: false,
        NetPOPrice: action.payload
      };
    case SET_RMCCBOP_DATA:
      return {
        ...state,
        loading: false,
        RMCCBOPCost: action.payload
      };
    case SET_SURFACE_COST_DATA:
      return {
        ...state,
        loading: false,
        SurfaceCostData: action.payload
      };
    case SET_OVERHEAD_PROFIT_COST_DATA:
      return {
        ...state,
        loading: false,
        OverheadProfitCostData: action.payload
      };
    case SET_DISCOUNT_COST_DATA:
      return {
        ...state,
        loading: false,
        DiscountCostData: action.payload
      };
    case GET_COSTING_DETAILS_BY_COSTING_ID:
      return {
        ...state,
        loading: false,
        singleCostingDetail: action.payload,
      }
    case SET_COSTING_VIEW_DATA:
      return {
        ...state,
        loading: false,
        viewCostingDetailData: action.payload,
      }
    case SET_COSTING_APPROVAL_DATA:
      return {
        ...state,
        loading: false,
        costingApprovalData: action.payload,
      }
    case STORE_PART_VALUE:
      return {
        ...state,
        partNo: action.payload,
      }
    case GET_COST_SUMMARY_BY_PART_PLANT:
      return {
        ...state,
        loading: false,
        costingSelectList: action.payload,
      }
    case GET_COSTING_BY_VENDOR_VENDOR_PLANT:
      return {
        ...state,
        loading: false,
        costingByVendorAndVendorPlant: action.payload,
      }
    case GET_COSTING_STATUS:
      return {
        ...state,
        loading: false,
        costingStatusSelectList: action.payload,
      }
    case SET_ITEM_DATA:
      return {
        ...state,
        loading: false,
        itemDataObject: action.payload,
      }
    case SET_SURFACE_TAB_DATA:
      return {
        ...state,
        loading: false,
        SurfaceTabData: action.payload
      };
    case SET_OVERHEAD_PROFIT_TAB_DATA:
      return {
        ...state,
        loading: false,
        OverheadProfitTabData: action.payload
      };
    case SET_PACKAGE_AND_FREIGHT_TAB_DATA:
      return {
        ...state,
        loading: false,
        PackageAndFreightTabData: action.payload
      };
    case SET_TOOL_TAB_DATA:
      return {
        ...state,
        loading: false,
        ToolTabData: action.payload
      };
    case SET_OTHER_DISCOUNT_TAB_DATA:
      return {
        ...state,
        loading: false,
        DiscountOtherTabData: action.payload
      };
    case GET_BULKUPLOAD_COSTING_LIST:
      return {
        ...state,
        loading: false,
        costingBulkUploadList: action.payload
      }
    case SET_COMPONENT_ITEM_DATA:
      return {
        ...state,
        loading: false,
        ComponentItemData: action.payload
      }
    case GET_RM_DRAWER_DATA_LIST:
      return {
        ...state,
        loading: false,
        rmDrawerList: action.payload
      }
    case GET_PROCESS_DRAWER_DATA_LIST:
      return {
        ...state,
        loading: false,
        processDrawerList: action.payload
      }
    case GET_PART_COSTING_VENDOR_SELECT_LIST:
      return {
        ...state,
        loading: false,
        costingVendorList: action.payload
      }
    case GET_PART_COSTING_PLANT_SELECTLIST:
      return {
        ...state,
        loading: false,
        costingPlantList: action.payload
      }
    default:
      return state
  }
}
