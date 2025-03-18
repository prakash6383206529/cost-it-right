import {
  API_REQUEST, API_FAILURE, API_SUCCESS, GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS, CREATE_PART_WITH_SUPPLIER_SUCCESS, GET_COSTING_BY_COSTINGID,
  GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS, SET_CED_ROW_DATA_TO_COST_SUMMARY, SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY, SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
  GET_FREIGHT_HEAD_SUCCESS, GET_FREIGHT_AMOUNT_DATA_SUCCESS, EMPTY_COSTING_DATA, GET_ZBC_COSTING_SELECTLIST_BY_PART, GET_COSTING_TECHNOLOGY_SELECTLIST,
  GET_COSTING_PART_SELECTLIST, GET_PART_INFO, GET_COSTING_DATA_BY_COSTINGID, GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST, GET_RATE_CRITERIA_BY_CAPACITY,
  SET_RMCC_TAB_DATA, SET_COSTING_DATALIST_BY_COSTINGID, SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID, SET_PO_PRICE, SET_RMCCBOP_DATA, SET_SURFACE_COST_DATA,
  SET_OVERHEAD_PROFIT_COST_DATA, SET_DISCOUNT_COST_DATA, SET_COSTING_VIEW_DATA, STORE_PART_VALUE, GET_COSTING_DETAILS_BY_COSTING_ID, GET_COST_SUMMARY_BY_PART_PLANT, SET_COSTING_APPROVAL_DATA,
  GET_COSTING_BY_VENDOR_VENDOR_PLANT, GET_COSTING_STATUS, SET_ITEM_DATA, SET_SURFACE_TAB_DATA, SET_OVERHEAD_PROFIT_TAB_DATA, GET_BULKUPLOAD_COSTING_LIST, SET_PACKAGE_AND_FREIGHT_TAB_DATA,
  SET_TOOL_TAB_DATA, SET_OTHER_DISCOUNT_TAB_DATA, SET_COMPONENT_ITEM_DATA, SET_COMPONENT_OVERHEAD_ITEM_DATA, SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA,
  SET_COMPONENT_TOOL_ITEM_DATA, SET_COMPONENT_DISCOUNT_ITEM_DATA, GET_RM_DRAWER_DATA_LIST, GET_PROCESS_DRAWER_DATA_LIST, GET_PART_COSTING_VENDOR_SELECT_LIST,
  GET_PART_COSTING_PLANT_SELECTLIST, GET_PART_SELECTLIST_BY_TECHNOLOGY, SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA, SET_EXCHANGE_RATE_CURRENCY_DATA,
  SET_TOOL_PROCESS_WISE_DATALIST, SET_IS_TOOLCOST_USED, TOOL_CATEGORY_SELECTLIST, SET_RMCC_ERRORS, CUSTOM_LOADER_SHOW, CUSTOM_LOADER_HIDE, SET_COSTING_EFFECTIVE_DATE,
  IS_COSTING_EFFECTIVE_DATE_DISABLED, CLOSE_OPEN_ACCORDION, BOP_DRAWER_LIST, SET_CUTOFF_RMC, GET_COSTING_SPECIFIC_TECHNOLOGY, SET_PLASTIC_ARR, SET_ASSEM_BOP_CHARGE,
  CHECK_IS_DATA_CHANGE, SET_ARRAY_FOR_COSTING, CHECK_IS_DISCOUNT_DATA_CHANGE, CHECK_IS_TOOL_DATA_CHANGE, CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE, CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE,
  FORGING_CALCULATOR_MACHININGSTOCK_SECTION, SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION, SET_MASTER_BATCH_OBJ, SELECTED_IDS_OF_OPERATION, SELECTED_PROCESS_AND_GROUPCODE, SET_PROCESS_ID, SET_PROCESSGROUP_ID, GET_FG_WISE_IMPACT_DATA_FOR_COSTING, SAVE_PART_NUMBER_STOP_API_CALL, SET_PART_NUMBER_ARRAY_API_CALL, SET_MESSAGE_FOR_ASSEMBLY, SET_PROCESS_GROUP_GRID, SAVE_BOM_LEVEL_STOP_API_CALL, IMPORT, SAVE_ASSEMBLY_NUMBER_STOP_API_CALL, SET_ACTIVE_TAB, SET_OVERHEAD_PROFIT_ERRORS, SET_TOOLS_ERRORS, SET_DISCOUNT_ERRORS, SET_SURFACE_COST_FOR_REJECTION_DATA, SET_TOOL_COST_FOR_OVERHEAD_PROFIT, SET_NPV_DATA, NFR_DETAILS_FOR_DISCOUNT, SET_OVERHEAD_PROFIT_ICC, SET_YOY_COST_GRID, SET_OTHER_COST, RESET_EXCHANGE_RATE_DATA, SET_OPEN_ALL_TABS, SET_REJECTED_COSTING_VIEW_DATA, SET_CALL_ST_API, SET_BREAKUP_BOP, SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API, SET_COSTING_MODE, CORRUGATED_BOX, CORRUGATED_DATA, GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA, COSTING_ACC_OPEN_CLOSE_STATUS, SET_TOOL_COST_ICC,
  SET_OTHER_DISCOUNT_DATA,
  SET_REJECTION_RECOVERY_DATA,
  SET_PAYMENT_TERM_COST,
  GET_COSTING_PAYMENT_TERM_DETAIL,
  SET_DISCOUNT_AND_OTHER_TAB_DATA,
  SET_COMPONENT_PAYMENT_TERMS_DATA,
  CHECK_IS_PAYMENT_TERMS_DATA_CHANGE,
  GET_TCO_DATA,
  SET_COSTING_VIEW_DATA_FOR_ASSEMBLY,
  PARTSPECIFICATIONRFQDATA,
  GET_SAP_EVALUATIONTYPE,
  SET_RFQ_COSTING_TYPE,
  SET_EXCHANGE_RATE_SOURCE,
  SET_CURRENCY_SOURCE,
  SET_EXCHANGE_RATE_DATA,
  SET_OPERATION_APPLICABILITY_SELECT,
  SET_PROCESS_APPLICABILITY_SELECT,
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
  setArrayForCosting: [],
  checkIsOverheadProfitChange: false,
  checkIsFreightPackageChange: false,
  checkIsToolTabChange: false,
  masterBatchObj: {},
  selectedIdsOfOperationAndOtherOperation: [],
  selectedIdsOfOperation: [],
  selectedProcessAndGroup: [],
  selectedProcessId: [],
  selectedProcessGroupId: [],
  checkIsDataChange: false,
  partNumberAssembly: '',
  partNumberArrayAPICall: [],
  messageForAssembly: '',
  processGroupGrid: [],
  bomLevel: '',
  assemblyNumber: [],
  IsIncludedSurfaceInRejection: false,
  otherCostData: { gridData: [], otherCostTotal: 0 },
  otherDiscountData: { gridData: [], totalCost: 0 },
  costingOpenCloseStatus: { RMC: false, overheadProfit: false },
  rejectionRecovery:
  {
    BaseCostingIdRef: '',
    ApplicabilityIdRef: 0,
    ApplicabilityType: '',
    Type: "",
    Value: 0,
    EffectiveRecoveryPercentage: '',
    ApplicabilityCost: '',
    RejectionRecoveryNetCost: ''
  },
  partSpecificationRFQData: [],
  evaluationType: [],
  plantExchangeRate: null,
    baseExchangeRate: null,
    plantFromCurrency: '',
    plantToCurrency: '',
    baseFromCurrency: '',
    baseToCurrency: ''
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
      const tempRMData = [...action.payload]
      return {
        ...state,
        loading: false,
        RMCCTabData: tempRMData
      };
    case SET_COSTING_DATALIST_BY_COSTINGID:
      const Costingdata1 = action.payload ?? []

      return {
        ...state,
        loading: false,
        CostingDataList: [...Costingdata1]
      };
    case SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID:
      return {
        ...state,
        loading: false,
        ActualCostingDataList: action.payload
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
    case SET_DISCOUNT_AND_OTHER_TAB_DATA:
      return {
        ...state,
        loading: false,
        DiscountAndOtherCostTabData: action.payload
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
    case SET_COMPONENT_OVERHEAD_ITEM_DATA:
      return {
        ...state,
        loading: false,
        ComponentItemOverheadData: action.payload
      }
    case SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA:
      return {
        ...state,
        loading: false,
        ComponentItemPackageFreightData: action.payload
      }
    case SET_COMPONENT_TOOL_ITEM_DATA:
      return {
        ...state,
        loading: false,
        ComponentItemToolData: action.payload
      }
    case SET_COMPONENT_DISCOUNT_ITEM_DATA:
      return {
        ...state,
        loading: false,
        ComponentItemDiscountData: action.payload
      }
    case SET_COMPONENT_PAYMENT_TERMS_DATA:
      return {
        ...state,
        loading: false,
        PaymentTermDataDiscountTab: action.payload
      }
    case GET_RM_DRAWER_DATA_LIST:
      // let isNFR = action?.isNFR
      // let list = []
      // let rmNameList = action?.rmNameList
      // let temp = [...action.payload]
      // let arrayRM = temp && temp.map((item) => {
      //   item.NetLandedCostCombine = item.EntryType === IMPORT ? item.NetLandedCostConversion : item.NetLandedCost
      //   item.NetLandedCostCurrency = item.EntryType === IMPORT ? item.NetLandedCost : '-'
      //   return item
      // })
      // if (isNFR) {
      //   arrayRM && arrayRM?.filter(element => {
      //     if (rmNameList?.includes(element?.RawMaterial)) {
      //       list.push(element)
      //     }
      //   })
      // } else {
      //   list = [...arrayRM]
      // }
      let temp = [...action.payload]
      let arrayRM = temp && temp.map((item) => {
        item.NetLandedCostCombine = /* item.EntryType === IMPORT ? item.NetLandedCostConversion :  */item.NetLandedCost
        item.NetLandedCostCurrency = item.EntryType === IMPORT ? item.NetLandedCost : '-'
        return item
      })

      return {
        ...state,
        loading: false,
        rmDrawerList: arrayRM
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
    case GET_PART_SELECTLIST_BY_TECHNOLOGY:
      return {
        ...state,
        loading: false,
        partSelectListByTechnology: action.payload
      }
    case SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA:
      return {
        ...state,
        loading: false,
        IsIncludedSurfaceInOverheadProfit: action.payload
      }
    case SET_EXCHANGE_RATE_CURRENCY_DATA:
      return {
        ...state,
        loading: false,
        ExchangeRateData: action.payload
      }
    case SET_TOOL_PROCESS_WISE_DATALIST:
      return {
        ...state,
        loading: false,
        ToolsDataList: action.payload
      }
    case SET_IS_TOOLCOST_USED:
      return {
        ...state,
        loading: false,
        IsToolCostApplicable: action.payload
      }
    case TOOL_CATEGORY_SELECTLIST:
      return {
        ...state,
        loading: false,
        ToolCategoryList: action.payload
      }
    case SET_RMCC_ERRORS:
      return {
        ...state,
        loading: false,
        ErrorObjRMCC: action.payload
      }
    case SET_COSTING_EFFECTIVE_DATE:
      return {
        ...state,
        loading: false,
        CostingEffectiveDate: action.payload
      }
    case CLOSE_OPEN_ACCORDION:
      return {
        ...state,
        loading: false,
        CloseOpenAccordion: action.payload
      }
    case BOP_DRAWER_LIST:
      let tempBOP = [...action.payload]
      let arrayBOP = tempBOP && tempBOP.map((item) => {
        item.NetLandedCostCombine = /* item.EntryType === IMPORT ? item.NetLandedCostConversion :  */item.NetLandedCost
        item.NetLandedCostCurrency = item.EntryType === IMPORT ? item.NetLandedCost : '-'
        return item
      })
      return {
        ...state,
        loading: false,
        bopDrawerList: arrayBOP
      }
    case IS_COSTING_EFFECTIVE_DATE_DISABLED:
      return {
        ...state,
        loading: false,
        IsCostingDateDisabled: action.payload
      }
    case SET_CUTOFF_RMC:
      return {
        ...state,
        loading: false,
        RMCCutOffObj: action.payload
      }
    case GET_COSTING_SPECIFIC_TECHNOLOGY:
      return {
        ...state,
        loading: false,
        costingSpecifiTechnology: action.payload
      }
    case SET_PLASTIC_ARR:
      return {
        ...state,
        loading: false,
        getPlasticData: action.payload
      }
    case SET_ASSEM_BOP_CHARGE:
      return {
        ...state,
        loading: false,
        getAssemBOPCharge: action.payload
      }
    case CHECK_IS_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsDataChange: action.payload
      }
    case SET_ARRAY_FOR_COSTING:
      return {
        ...state,
        loading: false,
        setArrayForCosting: [...state.setArrayForCosting, ...action.payload]
      }
    case CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsOverheadProfitChange: action.payload
      }
    case CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsFreightPackageChange: action.payload
      }
    case CHECK_IS_TOOL_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsToolTabChange: action.payload
      }
    case CHECK_IS_DISCOUNT_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsDiscountChange: action.payload
      }
    case CHECK_IS_PAYMENT_TERMS_DATA_CHANGE:
      return {
        ...state,
        loading: false,
        checkIsPaymentTermsDataChange: action.payload
      }
    case FORGING_CALCULATOR_MACHININGSTOCK_SECTION:
      return {
        ...state,
        forgingCalculatorMachiningStockSectionValue: action.payload,
      }
    case SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION:
      return {
        ...state,
        selectedIdsOfOperationAndOtherOperation: action.payload,
      }
    case SET_MASTER_BATCH_OBJ:
      return {
        ...state,
        masterBatchObj: action.payload
      }
    case SELECTED_IDS_OF_OPERATION:
      return {
        ...state,
        selectedIdsOfOperation: action.payload
      }
    case SELECTED_PROCESS_AND_GROUPCODE:
      return {
        ...state,
        selectedProcessAndGroup: action.payload
      }
    case SET_PROCESS_ID:
      return {
        ...state,
        selectedProcessId: action.payload
      }
    case SET_PROCESSGROUP_ID:
      return {
        ...state,
        selectedProcessGroupId: action.payload
      }
    case GET_FG_WISE_IMPACT_DATA_FOR_COSTING:
      return {
        ...state,
        getFgWiseImpactData: action.payload
      }
    case SAVE_PART_NUMBER_STOP_API_CALL:
      return {
        ...state,
        loading: false,
        partNumberAssembly: action.payload
      }
    case SET_PART_NUMBER_ARRAY_API_CALL:
      return {
        ...state,
        loading: false,
        partNumberArrayAPICall: action.payload
      }
    case SET_MESSAGE_FOR_ASSEMBLY:
      return {
        ...state,
        loading: false,
        messageForAssembly: action.payload
      }
    case SET_PROCESS_GROUP_GRID:
      return {
        ...state,
        loading: false,
        processGroupGrid: action.payload
      }
    case SAVE_BOM_LEVEL_STOP_API_CALL:
      return {
        ...state,
        loading: false,
        bomLevel: action.payload
      }
    case SAVE_ASSEMBLY_NUMBER_STOP_API_CALL:
      return {
        ...state,
        loading: false,
        assemblyNumber: action.payload
      }
    case SET_SURFACE_COST_FOR_REJECTION_DATA:
      return {
        ...state,
        loading: false,
        IsIncludedSurfaceInRejection: action.payload
      }
    case SET_TOOL_COST_FOR_OVERHEAD_PROFIT:
      return {
        ...state,
        loading: false,
        IsIncludedToolCost: action.payload
      }
    case SET_OVERHEAD_PROFIT_ICC:
      return {
        ...state,
        loading: false,
        includeOverHeadProfitIcc: action.payload
      }
    case SET_OVERHEAD_PROFIT_ERRORS:
      return {
        ...state,
        loading: false,
        ErrorObjOverheadProfit: action.payload
      }
    case SET_TOOLS_ERRORS:
      return {
        ...state,
        loading: false,
        ErrorObjTools: action.payload
      }
    case SET_DISCOUNT_ERRORS:
      return {
        ...state,
        loading: false,
        ErrorObjDiscount: action.payload
      }
    case SET_YOY_COST_GRID:
      return {
        ...state,
        loading: false,
        yoyCostGrid: action.payload
      }
    case SET_NPV_DATA:
      return {
        ...state,
        loading: false,
        npvData: action.payload
      }
    case SET_OTHER_COST:
      return {
        ...state,
        loading: false,
        otherCostData: action.payload
      }
    case SET_OTHER_DISCOUNT_DATA:
      return {
        ...state,
        loading: false,
        otherDiscountData: action.payload
      }
    case SET_REJECTION_RECOVERY_DATA:
      return {
        ...state,
        loading: false,
        rejectionRecovery: action.payload
      }
    case NFR_DETAILS_FOR_DISCOUNT:
      return {
        ...state,
        loading: false,
        nfrDetailsForDiscount: action.payload
      }
    case RESET_EXCHANGE_RATE_DATA:
      return {
        ...state,
        ExchangeRateData: null, // or set it to an appropriate empty value
      }
    case SET_OPEN_ALL_TABS:
      return {
        ...state,
        loading: false,
        openAllTabs: action.payload
      }
    case SET_REJECTED_COSTING_VIEW_DATA:
      return {
        ...state,
        loading: false,
        viewRejectedCostingDetailData: action.payload,
      }
    case SET_CALL_ST_API:
      return {
        ...state,
        loading: false,
        callSTAPI: action.payload,
      }
    case SET_BREAKUP_BOP:
      return {
        ...state,
        loading: false,
        breakupBOP: action.payload,
      }
    case SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API:
      return {
        ...state,
        loading: false,
        isBreakupBoughtOutPartCostingFromAPI: action.payload,
      }
    case SET_COSTING_MODE:
      return {
        ...state,
        loading: false,
        costingMode: action.payload,
      }
    case CORRUGATED_DATA:
      return {
        ...state,
        loading: false,
        corrugatedDataObj: action.payload ? action.payload : {},
      }
    case GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA:
      return {
        ...state,
        loading: false,
        impactData: action.payload
      }
    case COSTING_ACC_OPEN_CLOSE_STATUS:
      return {
        ...state,
        loading: false,
        costingOpenCloseStatus: action.payload,
      }
    case SET_TOOL_COST_ICC:
      return {
        ...state,
        loading: false,
        includeToolCostIcc: action.payload
      }
    case GET_COSTING_PAYMENT_TERM_DETAIL:
      return {
        ...state,
        loading: false,
        getCostingPaymentDetails: action.payload
      }
    case SET_PAYMENT_TERM_COST:
      return {
        ...state,
        loading: false,
        UpdatePaymentTermCost: action.payload
      }
    case GET_TCO_DATA:
      return {
        ...state,
        loading: false,
        getTcoDetails: action.payload
      }
    case SET_COSTING_VIEW_DATA_FOR_ASSEMBLY:
      return {
        ...state,
        loading: false,
        viewCostingDetailDataForAssembly: action.payload
      }
    case SET_RFQ_COSTING_TYPE:
      return {
        ...state,
        IsRfqCostingType: action.payload
      }
    case PARTSPECIFICATIONRFQDATA:


      return {
        ...state,
        loading: false,
        partSpecificationRFQData: action.payload,
      }
    case GET_SAP_EVALUATIONTYPE:
      return {
        ...state,
        loading: false,
        evaluationType: action.payload,
      }
    case SET_EXCHANGE_RATE_SOURCE:
      return {
        ...state,
        loading: false,
        exchangeRateSource: action.payload,
      }
      case SET_CURRENCY_SOURCE:
        return {
          ...state,
          currencySource: action.payload,
        }
    case SET_EXCHANGE_RATE_DATA:
      return {
        ...state,
        loading: false,
        // plantExchangeRate: action.payload.plantExchangeRate,
        // baseExchangeRate: action.payload.baseExchangeRate,
        // plantFromCurrency: action.payload.plantFromCurrency,
        // plantToCurrency: action.payload.plantToCurrency,
        // baseFromCurrency: action.payload.baseFromCurrency,
        // baseToCurrency: action.payload.baseToCurrency,
        exchangeRateData: action.payload,
      }
    case SET_OPERATION_APPLICABILITY_SELECT:
      return {
        ...state,
        loading: false,
        operationApplicabilitySelect: action.payload,
      }
    case SET_PROCESS_APPLICABILITY_SELECT:
      return {
        ...state,
        loading: false,
        processApplicabilitySelect: action.payload,
      }
    default:
      return state
  }
}
