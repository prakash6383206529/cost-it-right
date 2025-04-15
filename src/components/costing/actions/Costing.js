import axios from 'axios'
import {
  API, API_REQUEST, API_FAILURE, API_SUCCESS, GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS, GET_COSTING_BY_COSTINGID, GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
  SET_CED_ROW_DATA_TO_COST_SUMMARY, SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY, SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY, GET_FREIGHT_HEAD_SUCCESS, GET_FREIGHT_AMOUNT_DATA_SUCCESS,
  EMPTY_COSTING_DATA, GET_ZBC_COSTING_SELECTLIST_BY_PART, GET_COSTING_TECHNOLOGY_SELECTLIST, GET_PART_INFO, GET_COSTING_DATA_BY_COSTINGID,
  GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST, GET_RATE_CRITERIA_BY_CAPACITY, SET_RMCC_TAB_DATA, SET_COSTING_DATALIST_BY_COSTINGID, SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID, SET_PO_PRICE, SET_RMCCBOP_DATA,
  SET_SURFACE_COST_DATA, SET_OVERHEAD_PROFIT_COST_DATA, SET_DISCOUNT_COST_DATA, GET_COSTING_DETAILS_BY_COSTING_ID, SET_COSTING_VIEW_DATA,
  STORE_PART_VALUE, GET_COST_SUMMARY_BY_PART_PLANT, SET_COSTING_APPROVAL_DATA, GET_COSTING_STATUS, SET_ITEM_DATA, SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION,
  SET_SURFACE_TAB_DATA, SET_OVERHEAD_PROFIT_TAB_DATA, SET_PACKAGE_AND_FREIGHT_TAB_DATA, SET_TOOL_TAB_DATA, SET_COMPONENT_ITEM_DATA, SET_COMPONENT_OVERHEAD_ITEM_DATA,
  SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA, SET_COMPONENT_TOOL_ITEM_DATA, SET_COMPONENT_DISCOUNT_ITEM_DATA, GET_RM_DRAWER_DATA_LIST, GET_PROCESS_DRAWER_DATA_LIST,
  GET_PART_COSTING_PLANT_SELECTLIST, GET_PART_COSTING_VENDOR_SELECT_LIST, GET_PART_SELECTLIST_BY_TECHNOLOGY, SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA, SET_EXCHANGE_RATE_CURRENCY_DATA,
  SET_TOOL_PROCESS_WISE_DATALIST, SET_IS_TOOLCOST_USED, TOOL_CATEGORY_SELECTLIST, SET_RMCC_ERRORS, CUSTOM_LOADER_SHOW,
  CUSTOM_LOADER_HIDE, SET_COSTING_EFFECTIVE_DATE, CLOSE_OPEN_ACCORDION, IS_COSTING_EFFECTIVE_DATE_DISABLED, config, BOP_DRAWER_LIST,
  SET_CUTOFF_RMC,
  GET_COSTING_SPECIFIC_TECHNOLOGY,
  EMPTY_GUID,
  SET_PLASTIC_ARR,
  SET_ASSEM_BOP_CHARGE,
  SET_ARRAY_FOR_COSTING,
  CHECK_IS_DATA_CHANGE,
  CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE,
  CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE,
  CHECK_IS_TOOL_DATA_CHANGE,
  CHECK_IS_DISCOUNT_DATA_CHANGE,
  SET_NEW_ARRAY_FOR_COSTING,
  FORGING_CALCULATOR_MACHININGSTOCK_SECTION,
  SET_MASTER_BATCH_OBJ,
  SELECTED_IDS_OF_OPERATION,
  SELECTED_PROCESS_AND_GROUPCODE,
  SET_PROCESS_ID,
  SET_PROCESSGROUP_ID,
  CHECK_HISTORY_COSTING_AND_SAP_PO_PRICE,
  GET_FG_WISE_IMPACT_DATA_FOR_COSTING,
  GET_FG_WISE_IMPACT_DATA,
  SAVE_PART_NUMBER_STOP_API_CALL,
  SET_PART_NUMBER_ARRAY_API_CALL,
  SET_MESSAGE_FOR_ASSEMBLY,
  SET_PROCESS_GROUP_GRID,
  SAVE_BOM_LEVEL_STOP_API_CALL,
  SAVE_ASSEMBLY_NUMBER_STOP_API_CALL,
  SET_SURFACE_COST_FOR_REJECTION_DATA,
  ZBCTypeId,
  SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
  SET_OVERHEAD_PROFIT_ERRORS,
  SET_TOOLS_ERRORS,
  SET_DISCOUNT_ERRORS,
  SET_TOOL_COST_FOR_OVERHEAD_PROFIT,
  SET_NPV_DATA,
  SET_OVERHEAD_PROFIT_ICC,
  SET_YOY_COST_GRID,
  SET_YOY_COST_GRID_FOR_SAVE,
  SET_OTHER_COST,
  RESET_EXCHANGE_RATE_DATA,
  SET_REJECTED_COSTING_VIEW_DATA,
  SET_CALL_ST_API,
  SET_BREAKUP_BOP,
  SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API,
  SET_COSTING_MODE,
  CORRUGATED_DATA,
  COSTING_ACC_OPEN_CLOSE_STATUS,
  GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA,
  SET_TOOL_COST_ICC,
  SET_OTHER_DISCOUNT_DATA,
  SET_REJECTION_RECOVERY_DATA,
  GET_COSTING_PAYMENT_TERM_DETAIL,
  SET_DISCOUNT_AND_OTHER_TAB_DATA,
  SET_COMPONENT_PAYMENT_TERMS_DATA,
  SET_PAYMENT_TERM_COST,
  CHECK_IS_PAYMENT_TERMS_DATA_CHANGE,
  GET_TCO_DATA,
  SET_COSTING_VIEW_DATA_FOR_ASSEMBLY,
  SET_RFQ_COSTING_TYPE,
  PARTSPECIFICATIONRFQDATA,
  GET_SAP_EVALUATIONTYPE,
  SET_EXCHANGE_RATE_SOURCE,
  SET_CURRENCY_SOURCE,
  SET_EXCHANGE_RATE_DATA,
  GET_COSTING_COST_DETAILS,
  SET_OPERATION_APPLICABILITY_SELECT,
  SET_PROCESS_APPLICABILITY_SELECT,
  GET_PAINT_COAT_LIST
} from '../../../config/constants'
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util'
import { MESSAGES } from '../../../config/message'
import Toaster from '../../common/Toaster'
import { reactLocalStorage } from 'reactjs-localstorage'
import _ from 'lodash'
import axiosInstance from '../../../utils/axiosInstance'
import { loggedInUserId } from '../../../helper'
// let config() = config

/**
 * @method showLoader
 * @description SHOW LOADER 
 */
export function showLoader() {
  return (dispatch) => {
    dispatch({ type: CUSTOM_LOADER_SHOW })
  }
}

/**
 * @method hideLoader
 * @description HIDE LOADER
 */
export function hideLoader() {
  return (dispatch) => {
    dispatch({ type: CUSTOM_LOADER_HIDE })
  }
}

/**
 * @method getCostingTechnologySelectList
 * @description GET TECHNOLOGY SELECTLIST
 */
export function getCostingTechnologySelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getCostingTechnologySelectList}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_COSTING_TECHNOLOGY_SELECTLIST,
            payload: response.data.SelectList,
          })
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
 * @method getPartInfo
 * @description GET PART INFO
 */
export function getPartInfo(PartId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (PartId !== '') {
      dispatch({ type: API_REQUEST })
      const request = axios.get(`${API.getCostingPartDetails}/${PartId}/${loggedInUser?.loggedInUserId}`, config(),)
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_PART_INFO,
            payload: response.data.Data,
          })
          callback(response)
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
    } else {
      dispatch({
        type: GET_PART_INFO,
        payload: {},
      })
    }
  }
}

/**
 * @method checkPartWithTechnology
 * @description CHECK PART WITH TECHNOLOGY IS ASSOCIATED OR NOT
 */
export function checkPartWithTechnology(data, callback) {
  const requestData = { LoggedInUserId: loggedInUserId(), ...data }
  return (dispatch) => {
    const request = axiosInstance.post(API.checkPartWithTechnology, requestData, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error.response)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method createCosting
 * @description CREATE ZBC COSTING
 */
export function createCosting(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createCosting, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
      callback(error)
    })
  }
}

/**
 * @method getExistingCosting
 * @description get VBC Costing Select List By Part
 */
export function getExistingCosting(PartId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getExistingCosting}/${PartId}/${loggedInUser?.loggedInUserId}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      //apiErrors(error);
    })
  }
}

/**
 * @method updateZBCSOBDetail
 * @description UPDATE ZBC SOB DETAILS
 */
export function updateSOBDetail(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    axiosInstance.put(`${API.updateSOBDetail}`, requestData, config())
      .then((response) => {
        callback(response)
      }).catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
      })
  }
}

/**
 * @method updateVBCSOBDetail
 * @description UPDATE VBC SOB DETAILS
 */
export function updateVBCSOBDetail(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    axiosInstance.put(`${API.updateVBCSOBDetail}`, requestData, config())
      .then((response) => {
        callback(response)
      }).catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
      })
  }
}

/**
 * @method getBriefCostingById
 * @description GET COSTING DETAIL BY COSTING ID
 */
export function getBriefCostingById(CostingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (CostingId !== '') {
      dispatch({
        type: GET_COSTING_DATA_BY_COSTINGID,
        payload: {},
      })
      dispatch({
        type: SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID,
        payload: [],
      })
      dispatch({
        type: SET_COSTING_DATALIST_BY_COSTINGID,
        payload: [],
      })
      const request = axios.get(`${API.getBriefCostingById}/${CostingId}/${loggedInUser?.loggedInUserId}`, config());
      request.then((response) => {

        if (response.data.Result) {
          dispatch({
            type: GET_COSTING_DATA_BY_COSTINGID,
            payload: response.data.DataList[0],
          })
          dispatch({
            type: SET_ACTUAL_COSTING_DATALIST_BY_COSTINGID,
            payload: response.data.DataList,
          })
          dispatch({
            type: SET_COSTING_DATALIST_BY_COSTINGID,
            payload: response.data.DataList,
          })
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_COSTING_DATA_BY_COSTINGID,
        payload: {},
      })
      dispatch({
        type: SET_COSTING_DATALIST_BY_COSTINGID,
        payload: [],
      })
      callback();
    }
  };
}

/**
 * @method setCostingDataList
 * @description SET COSTING DATA LIST
 */
export function setCostingDataList(flag, CostingDataList, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COSTING_DATALIST_BY_COSTINGID,
      payload: CostingDataList,
    })
    callback();
  }
};

/**
 * @method setPOPrice
 * @description SET PO PRICE
 */
export function setPOPrice(POPrice, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_PO_PRICE,
      payload: POPrice,
    })
    callback();
  }
};

/**
 * @method setRMCCBOPCostData
 * @description SET HEAD COST RMCCBOP DATA
 */
export function setRMCCBOPCostData(Data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_RMCCBOP_DATA,
      payload: Data,
    })
    callback();
  }
};

/**
 * @method setSurfaceCostData
 * @description SET HEAD COST SURFACE DATA
 */
export function setSurfaceCostData(Data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_SURFACE_COST_DATA,
      payload: Data,
    })
    callback();
  }
};

/**
 * @method setOverheadProfitCostData
 * @description SET OVERHEAD PROFIT COST DATA
 */
export function setOverheadProfitCostData(Data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_OVERHEAD_PROFIT_COST_DATA,
      payload: Data,
    })
    callback();
  }
};

/**
 * @method setDiscountCost
 * @description SET DISCOUNT COST DATA
 */
export function setDiscountCost(Data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_DISCOUNT_COST_DATA,
      payload: Data,
    })
    callback();
  }
};

/**
 * @method getZBCDetailByPlantId
 * @description GET PLANT DETAIL BY PLANT ID IN COSTING PLATN DRAWER
 */
export function getZBCDetailByPlantId(PlantId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getZBCDetailByPlantId}/${PlantId}/${loggedInUser?.loggedInUserId}`, config(),)
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error)
      apiErrors(error)
    })
  }
}

/**
 * @method getVBCDetailByVendorId
 * @description GET VENDOR DETAIL IN COSTING VENDOR ADD DRAWER
 */
export function getVBCDetailByVendorId(data, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getVBCDetailByVendorId}/${data.VendorId}/${data.VendorPlantId}/${loggedInUser?.loggedInUserId}`, config(),)
    request.then((response) => {
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
 * @method getRMCCTabData
 * @description GET RM+CC TAB DATA IN COSTING DETAIL
 */
export function getRMCCTabData(data, IsUseReducer, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    let queryParams = data.EffectiveDate ? data.EffectiveDate : null
    const request = axios.get(`${API.getRMCCTabData}/${data.CostingId}/${data.PartId}/${data.AssemCostingId}/${data.subAsmCostingId}/${queryParams}/${data?.isComponentCosting ? data?.isComponentCosting : false}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (IsUseReducer && response.data.Result) {
        let TabData = response.data.DataList;
        dispatch({
          type: SET_RMCC_TAB_DATA,
          payload: TabData,
        });
        dispatch({
          type: SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
          payload: TabData,
        });
        callback(response);
      } else {
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
 * @method setRMCCData
 * @description SET RMCC TAB DATA  
 */
export function setRMCCData(TabData, callback) {



  return (dispatch) => {
    dispatch({
      type: SET_RMCC_TAB_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method setComponentItemData
 * @description SET COMPONENT ITEM DATA  
 */
export function setComponentItemData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_ITEM_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method CloseOpenAccordion
 * @description SET COMPONENT ITEM DATA  
 */
export function CloseOpenAccordion() {
  return (dispatch) => {
    dispatch({
      type: CLOSE_OPEN_ACCORDION,
      payload: Math.random(),
    });
  }
};

/**
 * @method setComponentOverheadItemData
 * @description SET COMPONENT OVERHEAD ITEM DATA  
 */
export function setComponentOverheadItemData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_OVERHEAD_ITEM_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method setComponentPackageFreightItemData
 * @description SET COMPONENT PACKAGE FREIGHT ITEM DATA  
 */
export function setComponentPackageFreightItemData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_PACKAGE_FREIGHT_ITEM_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method setComponentToolItemData
 * @description SET COMPONENT TOOL ITEM DATA  
 */
export function setComponentToolItemData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_TOOL_ITEM_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method setComponentDiscountOtherItemData
 * @description SET COMPONENT DISCOUNT OTHER ITEM DATA  
 */
export function setComponentDiscountOtherItemData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_DISCOUNT_ITEM_DATA,
      payload: TabData,
    });
    callback();
  }
};
/**
 * @method setPaymentTermsDataInDiscountOtherTab
 * @description SET COMPONENT PAYMENtERMS  DATA IN DISCOUNT OTHER ITEM DATA  
 */
export function setPaymentTermsDataInDiscountOtherTab(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_COMPONENT_PAYMENT_TERMS_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method getBOPData
 * @description GET BOP DATA IN COSTING DETAIL
 */
export function getBOPData(data, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPData}/${data.PartId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
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
 * @method getRMDrawerDataList
 * @description GET RM DATALIST IN RM DRAWER IN COSTING VBC
 */
export function getRMDrawerDataList(data, isNFR, rmNameList, surfaceTreatment = false, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&technologyId=${data.TechnologyId}&vendorPlantId=${data.VendorPlantId}&plantId=${data.PlantId}&effectiveDate=${data.EffectiveDate}&vendorId=${data.VendorId}&customerId=${data.CustomerId}&materialId=${data.material_id}&gradeId=${data.grade_id}&costingId=${data.CostingId}&costingTypeId=${data.CostingTypeId}&partId=${data.PartId}&isRFQ=${data.IsRFQ}&quotationPartId=${data.QuotationPartId}`
    //const queryParams = `${data.VendorId}/${data.TechnologyId}/${data.VendorPlantId}/${data.DestinationPlantId}/${data.EffectiveDate}/${data.material_id}/${data.grade_id}/${data.CostingId}`
    const request = axios.get(`${API.getRMDrawerDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_RM_DRAWER_DATA_LIST,
          payload: surfaceTreatment ? [] : response.status === 204 ? [] : response.data.DataList,
          isNFR: isNFR,
          rmNameList: rmNameList
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
 * @method getBOPDrawerDataList
 * @description GET BOP DATALIST IN BOP DRAWER IN COSTING VBC
 */
export function getBOPDrawerDataList(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&vendorId=${data.VendorId}&vendorPlantId=${data.VendorPlantId}&plantId=${data.PlantId}&effectiveDate=${data.EffectiveDate}&categoryId=${data.categoryId}&customerId=${data.CustomerId}&costingId=${data.CostingId}&costingTypeId=${data.CostingTypeId}`;
    const request = axios.get(`${API.getBOPDrawerDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: BOP_DRAWER_LIST,
          payload: response.data.DataList
        })
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
 * @method getOperationDrawerDataList
 * @description GET OPERATION DATALIST IN OPERATION DRAWER IN COSTING VBC
 */
export function getOperationDrawerDataList(data, callback) {
  return (dispatch) => {
    const queryParams = `loggedInUserId=${loggedInUserId()}&vendorId=${data.VendorId}&technologyId=${data.TechnologyId}&vendorPlantId=${data.VendorPlantId}&plantId=${data.PlantId}&effectiveDate=${data.EffectiveDate}&customerId=${data.CustomerId}&costingId=${data.CostingId}&costingTypeId=${data.CostingTypeId}`;
    const request = axios.get(`${API.getOperationDrawerDataList}?${queryParams}`, config());
    request.then((response) => {

      if (response.data.Result || response.status === 204) {

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
 * @method getProcessDrawerDataList
 * @description GET PROCESS DATALIST IN PROCESS DRAWER IN COSTING VBC
 */
export function getProcessDrawerDataList(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&vendorId=${data.VendorId}&technologyId=${data.TechnologyId}&effectiveDate=${data.EffectiveDate}&customerId=${data.CustomerId}&vendorPlantId=${data.VendorPlantId}&plantId=${data.PlantId}&costingId=${data.CostingId}&costingTypeId=${data.CostingTypeId}`;
    const request = axios.get(`${API.getProcessDrawerDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_PROCESS_DRAWER_DATA_LIST,
          payload: response.status === 204 ? [] : response.data.DataList
        })
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
 * @method saveCostingRMCCTab
 * @description SAVE COSTING RM+CC TAB
 */
export function saveCostingRMCCTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingRMCCTab, data, config())
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method saveComponentCostingRMCCTab
 * @description SAVE COMPONENT COSTING RM+CC TAB
 */
export function saveComponentCostingRMCCTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveComponentCostingRMCCTab, data, config());
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method saveAssemblyCostingRMCCTab
 * @description SAVE ASSEMBLY COSTING RM+CC TAB
 */
export function saveAssemblyCostingRMCCTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveAssemblyCostingRMCCTab, data, config());
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getSurfaceTreatmentTabData
 * @description GET SURFACE TREATMENT DATA IN COSTING DETAIL
 */
export function getSurfaceTreatmentTabData(data, IsUseReducer, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    const request = axios.get(`${API.getSurfaceTreatmentTabData}/${data.CostingId}/${data.SubAsmCostingId}/${data.AssemCostingId}/${data?.isComponentCosting ? data?.isComponentCosting : false}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        if (IsUseReducer && response.data.Result) {
          let TabData = response.data.DataList;
          dispatch({
            type: SET_SURFACE_TAB_DATA,
            payload: TabData,
          });
          callback(response);
        } else {
          callback(response);
        }
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method setSurfaceData
 * @description SET SURFACE TAB DATA  
 */
export function setSurfaceData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_SURFACE_TAB_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method setSurfaceCostInOverheadProfit
 * @description SET SURFACE TREATMENT COST FOR OVERHEAD AND PROFIT
 */
export function setSurfaceCostInOverheadProfit(IsIncluded, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_SURFACE_COST_FOR_OVERHEAD_TAB_DATA,
      payload: IsIncluded,
    });
    callback();
  }
};

/**
 * @method saveComponentCostingSurfaceTab
 * @description SAVE COMPONENT COSTING SURFACE TAB
 */
export function saveCostingSurfaceTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingSurfaceTab, data, config());
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getSurfaceTreatmentDrawerDataList
 * @description GET PROCESS DATALIST IN PROCESS DRAWER IN COSTING VBC
 */
export function getSurfaceTreatmentDrawerDataList(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&vendorId=${data.VendorId}&technologyId=${data.TechnologyId}&vendorPlantId=${data.VendorPlantId}&plantId=${data.PlantId}&effectiveDate=${data.EffectiveDate}&customerId=${data.CustomerId}&costingId=${data.CostingId}&costingTypeId=${data.CostingTypeId}`;
    const request = axios.get(`${API.getSurfaceTreatmentDrawerDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
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
 * @method getOverheadProfitTabData
 * @description GET OVERHEAD & PROFIT DATA IN COSTING DETAIL
 */
export function getOverheadProfitTabData(data, IsUseReducer, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({
      type: SET_OVERHEAD_PROFIT_TAB_DATA,
      payload: [],
    });
    const request = axios.get(`${API.getOverheadProfitTabData}/${data.CostingId}/${data.PartId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (IsUseReducer && response.data.Result) {
        let TabData = response.data.DataList;
        dispatch({
          type: SET_OVERHEAD_PROFIT_TAB_DATA,
          payload: TabData,
        });
      } else {
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
 * @method setOverheadProfitData
 * @description SET OVERHEAD PROFIT TAB DATA  
 */
export function setOverheadProfitData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_OVERHEAD_PROFIT_TAB_DATA,
      payload: TabData,
    });
    callback();
  }
};
/**
 * @method setDiscountAndOtherCostData
 * @description SET DISCOUNT AND OTHER TAB DATA  
 */
export function setDiscountAndOtherCostData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_DISCOUNT_AND_OTHER_TAB_DATA,
      payload: TabData || {},
    });
    callback();
  }
};

/**
 * @method getOverheadProfitDataByModelType
 * @description GET OVERHEAD & PROFIT DATA BY MODEL TYPE
 */
export function getOverheadProfitDataByModelType(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    let queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&modelTypeId=${data.ModelTypeId}&vendorId=${data.VendorId}&effectiveDate=${data.EffectiveDate}&costingTypeId=${data.costingTypeId}&plantId=${data.plantId}&customerId=${data.customerId}&rawMaterialGradeId=${data.rawMaterialGradeId}&rawMaterialChildId=${data.rawMaterialChildId}&technologyId=${data.technologyId}`
    const request = axios.get(`${API.getOverheadProfitDataByModelType}?${queryParams}`, config(),)
    request.then((response) => {
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
 * @method saveCostingOverheadProfitTab
 * @description SAVE COSTING OVERHEAD PROFIT TAB
 */
export function saveCostingOverheadProfitTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingOverheadProfitTab, data, config())
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method saveAssemblyOverheadProfitTab
 * @description SAVE ASSEMBLY OVERHEAD PROFIT TAB
 */
export function saveAssemblyOverheadProfitTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveAssemblyOverheadProfitTab, data, config())
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method saveComponentOverheadProfitTab
 * @description SAVE COMPONENT COSTING OVERHEAD PROFIT TAB
 */
export function saveComponentOverheadProfitTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveComponentOverheadProfitTab, data, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method getInventoryDataByHeads
 * @description GET INVENTORY DETAIL BY COSTING HEADS
 */
export function getInventoryDataByHeads(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getInventoryDataByHeads}?loggedInUserId=${loggedInUser?.loggedInUserId}&vendorId=${data?.VendorId}&costingTypeId=${data?.costingTypeId}&plantId=${data?.plantId}&effectiveDate=${data?.effectiveDate}&customerId=${data.customerId}&rawMaterialGradeId=${data.rawMaterialGradeId}&rawMaterialChildId=${data.rawMaterialChildId}&technologyId=${null}`, config());
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        callback(error)
        apiErrors(error)
      })
  }
}

/**
 * @method getPaymentTermsDataByHeads
 * @description GET PAYMENT TERM DETAIL BY COSTING HEADS
 */
export function getPaymentTermsDataByHeads(data, callback) {

  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getPaymentTermsDataByHeads}?loggedInUserId=${loggedInUser?.loggedInUserId}&vendorId=${data?.VendorId}&costingTypeId=${data?.costingTypeId}&plantId=${data?.plantId}&effectiveDate=${data?.effectiveDate}&customerId=${data.customerId}&rawMaterialGradeId=${data.rawMaterialGradeId}&rawMaterialChildId=${data.rawMaterialChildId}&technologyId=${data.technologyId}`, config());

    request.then((response) => {
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error)
      apiErrors(error)
    })
  }
}

/**
 * @method getPackageFreightTabData
 * @description GET PACKAGE AND FREIGHT DATA IN COSTING DETAIL
 */
export function getPackageFreightTabData(data, IsUseReducer, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({
      type: SET_PACKAGE_AND_FREIGHT_TAB_DATA,
      payload: [],
    });
    const request = axios.get(`${API.getPackageFreightTabData}/${data.CostingId}/${data.PartId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        if (IsUseReducer && response.data.Result) {
          let TabData = response.data.DataList;
          dispatch({
            type: SET_PACKAGE_AND_FREIGHT_TAB_DATA,
            payload: TabData,
          });
          //callback(response);
        } else {
          callback(response);
        }
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method setPackageAndFreightData
 * @description SET PACKAGE AND FREIGHT TAB DATA  
 */
export function setPackageAndFreightData(TabData, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_PACKAGE_AND_FREIGHT_TAB_DATA,
      payload: TabData,
    });
    callback();
  }
};

/**
 * @method saveCostingPackageFreightTab
 * @description SAVE COSTING PACKAGE & FREIGHT TAB
 */
export function saveCostingPackageFreightTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingPackageFreightTab, data, config())
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method getFreigtFullTruckCapacitySelectList
 * @description GET FREIGHT FULL TRUCK CAPACITY SELECTLIST
 */
export function getFreigtFullTruckCapacitySelectList() {
  return (dispatch) => {
    const request = axios.get(API.getFreigtFullTruckCapacitySelectList, config())
    request
      .then((response) => {
        dispatch({
          type: GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
          payload: response.data.SelectList,
        })
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method getRateCriteriaByCapacitySelectList
 * @description GET RATE CRITERIA BY CAPACITY SELECTLIST
 */
export function getRateCriteriaByCapacitySelectList(Capacity) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    const request = axios.get(`${API.getRateCriteriaByCapacitySelectList}/${Capacity}/${loggedInUser?.loggedInUserId}`, config())
    request.then((response) => {
      dispatch({
        type: GET_RATE_CRITERIA_BY_CAPACITY,
        payload: response.data.SelectList,
      })
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method getRateByCapacityCriteria
 * @description GET RATE BY CAPACITY AND CRITERIA
 */
export function getRateByCapacityCriteria(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getRateByCapacityCriteria}?loggedInUserId=${loggedInUser?.loggedInUserId}&Capacity=${data?.Capacity}&Criteria=${data?.Criteria}&plantId=${data?.PlantId}&vendorId=${data?.VendorId}&customerId=${data?.CustomerId}&effectiveDate=${data?.EffectiveDate}&costingTypeId=${data?.CostingTypeId}&EFreightLoadType=${data?.EFreightLoadType}`, config(),)
    request.then((response) => {
      if (response?.data?.Result) {
        callback(response)
      } else if (response?.status === 204) {
        Toaster.warning("There is no data for Freight.")
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method getToolTabData
 * @description GET TOOL DATA IN COSTING DETAIL
 */
export function getToolTabData(data, IsUseReducer, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({
      type: SET_TOOL_TAB_DATA,
      payload: [],
    });
    const request = axios.get(`${API.getToolTabData}/${data.CostingId}/${data.PartId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        if (IsUseReducer && response.data.Result) {
          let TabData = response.data.DataList;
          dispatch({
            type: SET_TOOL_TAB_DATA,
            payload: TabData,
          });
          //callback(response);
        } else {
          callback(response);
        }
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getToolsProcessWiseDataListByCostingID
 * @description GET TOOLS PROCESS WISE DATALIST BY COSTINGID
 */
export function getToolsProcessWiseDataListByCostingID(CostingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({
      type: SET_TOOL_PROCESS_WISE_DATALIST,
      payload: [],
    });
    const request = axios.get(`${API.getToolsProcessWiseDataListByCostingID}/${CostingId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        let TabData = response.data.DataList;
        dispatch({
          type: SET_TOOL_PROCESS_WISE_DATALIST,
          payload: TabData,
        });
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
 * @method setToolTabData
 * @description SET TOOL TAB DATA  
 */
export function setToolTabData(TabData, callback) {
  const updatedToolTabData = _.cloneDeep(TabData)
  return (dispatch) => {
    dispatch({
      type: SET_TOOL_TAB_DATA,
      payload: updatedToolTabData,
    });
    callback();
  }
};

/**
 * @method saveToolTab
 * @description SAVE TOOL TAB
 */
export function saveToolTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveToolTab, data, config())
    request
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

/**
 * @method getDiscountOtherCostTabData
 * @description GET DISCOUNT OTHER COST IN COSTING DETAIL
 */
export function getDiscountOtherCostTabData(data, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getDiscountOtherCostTabData}/${data.CostingId}/${data.PartId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        // dispatch({
        //   type: SET_DISCOUNT_AND_OTHER_TAB_DATA,
        //   payload: response.data.Data,
        // });
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
 * @method getExchangeRateByCurrency
 * @description GET EXCHANGE RATE BY CURRENCY
 */
export function getExchangeRateByCurrency(currency, costingHeadId, effectiveDate, VendorId, customerId, isBudgeting, toCurrency, exchangeRateSourceName, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getExchangeRateByCurrency}?loggedInUserId=${loggedInUserId()}&currency=${currency}&costingHeadId=${costingHeadId}&effectiveDate=${effectiveDate}&VendorId=${!VendorId ? EMPTY_GUID : VendorId}&customerId=${!customerId ? EMPTY_GUID : customerId}&isBudgeting=${isBudgeting}&toCurrency=${toCurrency}&exchangeRateSourceName=${exchangeRateSourceName ?? ''}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SET_EXCHANGE_RATE_CURRENCY_DATA,
          payload: response.data.Data,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      // callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveDiscountOtherCostTab
 * @description SAVE DISCOUNT OTHER COST TAB
 */
export function saveDiscountOtherCostTab(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveDiscountOtherCostTab, data, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method fileUploadCosting
 * @description File Upload COSTING
 */
export function fileUploadCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.fileUploadCosting, data, config())
    request.then((response) => {
      if (response && response.status === 200) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
      callback(error.toString())
    })
  }
}

/**
 * @method fileDeleteCosting
 * @description DELETE COSTING FILES
 */
export function fileDeleteCosting(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    axios.delete(`${API.fileDeleteCosting}/${data.Id}/${data.DeletedBy}`, config())
      .then((response) => {
        callback(response)
      }).catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
      })
  }
}

/**
 * @method deleteDraftCosting
 * @description DELETE COSTING FILES
 */
export function deleteDraftCosting(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    axios.delete(`${API.deleteDraftCosting}/${data.Id}/${data.UserId}`, config())
      .then((response) => {
        callback(response)
      }).catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
        callback(error)
      })
  }
}

/**
 * @method getExistingSupplierDetailByPartId
 * @description get Existing Supplier Detail By PartId
 */
export function getExistingSupplierDetailByPartId(partId, loginUserId, callback,) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getExistingSupplierDetailByPartId}/${partId}/${loginUserId}`, config(),)
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
          payload: response.data.DynamicData,
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({
        type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
        payload: null,
      })
      dispatch({ type: API_FAILURE })
      callback(error)
      apiErrors(error)
    })
  }
}

/**
 * @method createPartWithSupplier
 * @description create part with supplier
 */
export function setEmptyExistingSupplierData(callback) {
  return (dispatch) => {
    dispatch({
      type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
      payload: null,
    })
    callback()
  }
}



/**
 * @method createPartWithSupplier
 * @description create part with supplier
 */
export function createPartWithSupplier(data, callback) {
  const requestData = { LoggedInUserId: loggedInUserId(), ...data }
  return (dispatch) => {
    const request = axiosInstance.post(API.createPartWithSupplier, requestData, config())
    request
      .then((response) => {
        if (response.data.Result) {
          Toaster.success(MESSAGES.ADD_PART_WITH_SUPPLIER_SUCCESS)
        }
        callback(response)
      })
      .catch((error) => {
        dispatch({
          type: API_FAILURE,
        })
        apiErrors(error)
        callback(error);
      })
  }
}

/**
 * @method getCostingByCostingId
 * @description get costing by costingId
 */
export function getCostingByCostingId(costingId, supplier, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(
      `${API.getCostingByCostingId}/${costingId}/${loggedInUser?.loggedInUserId}`,
      config(),
    )
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_COSTING_BY_COSTINGID,
            payload: response.data.Data,
            supplier: supplier,
          })
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
 * @method getCostSummaryOtherOperation
 * @description get all other operation for cost summary
 */
export function getCostSummaryOtherOperation(supplierId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(
      `${API.getCostSummaryOtherOperationList}/${supplierId}/${loggedInUser?.loggedInUserId}`,
      config(),
    )
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
            payload: response.data.DataList,
          })
          callback(response)
        } else {
          Toaster.error(MESSAGES.SOME_ERROR)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        callback(error)
      })
  }
}

/**
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setRowDataCEDOtherOps(supplier, data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_CED_ROW_DATA_TO_COST_SUMMARY,
      payload: data,
      supplierColumn: supplier,
    })
    callback()
  }
}

/**
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setRowDataFreight(supplier, data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_FREIGHT_ROW_DATA_TO_COST_SUMMARY,
      payload: data,
      supplierColumn: supplier,
    })
    callback()
  }
}

/**
 * @method setRowDataCEDOtherOps
 * @description set row data to ced for cost summary CED
 */
export function setInventoryRowData(supplierColumn, data) {
  return (dispatch) => {
    dispatch({
      type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
      payload: data,
      supplierColumn: supplierColumn,
    })
  }
}

/**
 * @method getCostingOverHeadProByModelType
 * @description get overhead type by model type
 */
export function getCostingOverHeadProByModelType(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.getCostingOverHeadProByModelType, data, config(),)
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error.response)
    })
  }
}

/**
 * @method saveCosting
 * @description save Costing
 */
export function saveCosting(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCosting, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          // dispatch({
          //     type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
          //     payload: response.data.Data,
          // });
          callback(response)
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
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function fetchFreightHeadsAPI(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.fetchFreightHeadsAPI}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_FREIGHT_HEAD_SUCCESS,
            payload: response.data.SelectList,
          })
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
 * @method reassignCostingAPI
 * @description Reassign costing for approval
 */
export function reassignCostingAPI(CostingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: AUTH_API_REQUEST });
    axiosInstance
      .put(`${API.reassignCosting}/${CostingId}/${loggedInUser?.loggedInUserId}`, config())
      .then((response) => {
        if (response.data.Result) {
          callback(response)
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
 * @method cancelCostingAPI
 * @description Reassign costing for approval
 */
export function cancelCostingAPI(CostingId, callback) {
  return (dispatch) => {
    //dispatch({ type: AUTH_API_REQUEST });
    axiosInstance
      .post(`${API.cancelCosting}/${CostingId}`, config())
      .then((response) => {
        if (response.data.Result) {
          callback(response)
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
 * @method getCostingFreight
 * @description Used to fetch costing heads
 */
export function getCostingFreight(data, callback) {
  return (dispatch) => {
    // dispatch({ type: API_REQUEST });
    const request = axiosInstance.post(`${API.getCostingFreight}`, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_FREIGHT_AMOUNT_DATA_SUCCESS,
            payload: response.data.Data,
          })
          callback(response)
        } else if (response.data === '') {
          dispatch({ type: API_FAILURE })
          Toaster.warning('No content available for selected freight.')
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

export function emptyCostingData() {
  return (dispatch) => {
    dispatch({
      type: EMPTY_COSTING_DATA,
      payload: {},
    })
  }
}

/**
 * @method copyCostingAPI
 * @description Used to copy costing API
 */
export function copyCostingAPI(data, callback) {
  return (dispatch) => {
    // dispatch({ type: API_REQUEST });
    const request = axiosInstance.post(`${API.copyCostingAPI}`, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({ type: API_SUCCESS })
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
 * @method getSingleCostingDetails
 * @description Used to fetch costing details by costingId
 */
export function getSingleCostingDetails(costingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(
      `${API.getCostingDetailsByCostingId}/${costingId}/${loggedInUser?.loggedInUserId}`,
      config(),
    )
    request
      .then((response) => {

        if (response.data.Data) {

          dispatch({
            type: GET_COSTING_DETAILS_BY_COSTING_ID,
            payload: response.data.Data,
          })
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

export const setCostingViewData = (data) => (dispatch) => {
  let temp = []
  // temp.push(VIEW_COSTING_DATA)
  data && data?.map((val) => (
    temp.push(val)
  ))
  dispatch({
    type: SET_COSTING_VIEW_DATA,
    payload: temp,
  })
}

/**
 * @method:storePartNumber
 * @description: Used for storing part no from costing summary
 * @param {*} partNo
 */
export function storePartNumber(partNo) {
  return (dispatch) => {
    dispatch({
      type: STORE_PART_VALUE,
      payload: partNo,
    })
  }
}

export function getCostingSummaryByplantIdPartNo(partNo, plantId, vendorId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (partNo !== '' && plantId !== '' && vendorId !== '') {
      const request = axios.get(`${API.getCostingSummaryByplantIdPartNo}/${partNo}/${plantId}/${false}/${reactLocalStorage.getObject('CostingTypePermission').zbc}/${reactLocalStorage.getObject('CostingTypePermission').vbc}/${reactLocalStorage.getObject('CostingTypePermission').cbc}/${vendorId}/${loggedInUser?.loggedInUserId}`, config(),)
      request
        .then((response) => {
          if (response.data.Result || response.status === 204) {
            dispatch({
              type: GET_COST_SUMMARY_BY_PART_PLANT,
              payload: response.status === 204 ? [] : response.data.Data.CostingOptions,
            })
            callback(response)
          }
        })
        .catch((error) => {

          dispatch({ type: API_FAILURE })
          callback(error)
          apiErrors(error)
        })
    } else {
      dispatch({
        type: GET_COST_SUMMARY_BY_PART_PLANT,
        payload: [],
      })
    }
  }
}

/**
 * @method saveCopyCosting
 * @description SAVE COPY OF COSTING
 */
export function saveCopyCosting(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingCopy, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error)
      })
  }
}

export const setCostingApprovalData = (data) => (dispatch) => {
  let temp = []
  // temp.push(VIEW_COSTING_DATA)
  data.map((val) => (
    temp.push(val)
  ))
  dispatch({
    type: SET_COSTING_APPROVAL_DATA,
    payload: temp,
  })
}

export function getCostingByVendorAndVendorPlant(partId, VendorId, VendorPlantId, destinationPlantId, customerId, costingTypeId, infoCategory, callback) {
  return (dispatch) => {
    if (partId !== '') {
      const loggedInUser = { loggedInUserId: loggedInUserId() }
      const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&partId=${partId}&VendorId=${VendorId}&vendorPlantId=${VendorPlantId}&destinationPlantId=${!destinationPlantId ? EMPTY_GUID : destinationPlantId}&customerId=${!customerId ? EMPTY_GUID : customerId}&costingTypeId=${costingTypeId}&infoCategory=${infoCategory}`
      const request = axios.get(`${API.getCostingByVendorVendorPlant}?${queryParams}`, config());
      request.then((response) => {
        if (response.data.Result || response.status === 204) {
          dispatch({
            type: GET_COST_SUMMARY_BY_PART_PLANT,
            payload: response.status === 204 ? [] : response.data.DataList,
          })
          callback(response)
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
    } else {
      dispatch({
        type: GET_COST_SUMMARY_BY_PART_PLANT,
        payload: [],
      })
    }
  }
}

/**
 * @method getAllPartSelectList
 * @description GET TECHNOLOGY SELECTLIST
 */
export function getCostingStatusSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getCostingStatus}`, config())
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_STATUS,
          payload: response.data.SelectList,
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method setItemData
 * @description SET RMCC TAB DATA  
 */
export function setItemData(item, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_ITEM_DATA,
      payload: item,
    });
    callback();
  }
};

export function getPartCostingPlantSelectList(partNumber, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getPartCostingPlantSelectList}/${partNumber}/${loggedInUser?.loggedInUserId}`, config())
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_PART_COSTING_PLANT_SELECTLIST,
          payload: response.status === 204 ? [] : response.data.SelectList
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error)
    })
  }
}

export function getPartCostingVendorSelectList(partNumber, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getPartCostingVendorSelectList}/${partNumber}/${loggedInUser?.loggedInUserId}`, config())
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_PART_COSTING_VENDOR_SELECT_LIST,
          payload: response.status === 204 ? [] : response.data.SelectList
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error)
    })
  }
}

export function getPartSelectListByTechnology(technologyId, partNumber, partTypeId, callback) {
  return axios.get(`${API.getPartByTechnologyId}?loggedInUserId=${loggedInUserId()}&technologyId=${technologyId}&partNumber=${partNumber}&partTypeId=${partTypeId}`, config()).catch(error => {
    apiErrors(error);
    callback(error);
    return Promise.reject(error)
  });
}

/**
 * @method setIsToolCostUsed
 * @description SET TOOL COST APPLICABLE
 */
export function setIsToolCostUsed(IsApplicable) {
  return (dispatch) => {
    dispatch({
      type: SET_IS_TOOLCOST_USED,
      payload: IsApplicable,
    })
  }
};

/**
 * @method getToolCategoryList
 * @description GET BOP DATA IN COSTING DETAIL
 */
export function getToolCategoryList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getToolCategoryList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        let ToolList = response.data.SelectList;
        dispatch({
          type: TOOL_CATEGORY_SELECTLIST,
          payload: ToolList,
        })
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
 * @method setRMCCErrors
 * @description SET OVERHEAD PROFIT TAB DATA  
 */
export function setRMCCErrors(errObj) {
  return (dispatch) => {
    dispatch({
      type: SET_RMCC_ERRORS,
      payload: errObj,
    });
  }
};

/**
 * @method setCostingEffectiveDate
 * @description SET COSTING EFFECTIVE DATE
 */
export function setCostingEffectiveDate(Date) {
  return (dispatch) => {
    dispatch({
      type: SET_COSTING_EFFECTIVE_DATE,
      payload: Date,
    });
  }
};

/**
 * @method isGridDataAdded
 * @description IS GRID DATA ADDED TO DISABLED COSTING EFFECTIVE DATE
 */
export function gridDataAdded(IsCostingDateDisabled) {
  return (dispatch) => {
    dispatch({
      type: IS_COSTING_EFFECTIVE_DATE_DISABLED,
      payload: IsCostingDateDisabled,
    });
  }
};

/**
 * @method setRMCutOff
 * @description SET OVERHEAD PROFIT TAB DATA  
 */
export function setRMCutOff(cutOffObj) {

  return (dispatch) => {
    dispatch({
      type: SET_CUTOFF_RMC,
      payload: cutOffObj,
    });
  }
};

/**
 * @method getCostingTechnologySelectList
 * @description GET TECHNOLOGY SELECTLIST
 */
export function getCostingSpecificTechnology(loggedInUserId, callback, ListFor = '') {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getCostingSpecificTechnology}?loggedInUserId=${loggedInUserId}&ListFor=${ListFor}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_COSTING_SPECIFIC_TECHNOLOGY,
            payload: response.data.SelectList,
          })
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

export function setPlasticArray(array, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_PLASTIC_ARR,
      payload: array
    })
  }
}

export function checkDataForCopyCosting(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&CostingId=${data.CostingId}&EffectiveDate=${data.EffectiveDate}&ToCostingHeadId=${data.ToCostingHeadId}&ToPlantId=${data.ToPlantId}&ToVendorId=${data.ToVendorId}&ToCustomerId=${data.ToCustomerId}`
    const request = axios.get(`${API.checkDataForCopyCosting}?${queryParams}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch(error => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
      callback(error)
    })
  }
}

/*
* @method saveAssemblyPartRowCostingCalculation
* @description SAVE ASSEMBLY COSTING RM+CC TAB
*/
export function saveAssemblyPartRowCostingCalculation(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveAssemblyPartRowCostingCalculation, data, config());
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

export function saveAssemblyBOPHandlingCharge(data, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_ASSEM_BOP_CHARGE,
      payload: data
    })
  }
}


export function setAllCostingInArray(data, isNewArray) {
  return (dispatch) => {
    // IF isNewArray THEN WE ARE REPLACING WHOLE ARRAY WITH NEW VALUE ELSE WE ARE APPENDING VALUE IN OLD ARRAY
    if (isNewArray) {
      dispatch({
        type: SET_NEW_ARRAY_FOR_COSTING,
        payload: data
      })
    } else {

      dispatch({
        type: SET_ARRAY_FOR_COSTING,
        payload: data
      })
    }
  }
}

/**
 * @method getExistingCosting
 * @description get Costing Select List By Part
 */
export function getNCCExistingCosting(PartId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getNCCCExistingCosting}/${PartId}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      //apiErrors(error);
    })
  }
}


/**
 * @method createCosting
 * @description CREATE ZBC COSTING
 */
export function createNCCCosting(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createNCCCosting, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method isDataChange
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function isDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_DATA_CHANGE,
      payload: isDataChange
    })
  }
}
/**
 * @method isDataChange
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function isOverheadProfitDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_OVERHEAD_AND_PROFIT_DATA_CHANGE,
      payload: isDataChange
    })
  }
}
/**
 * @method isDataChange
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function isPackageAndFreightDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_PACKAGE_AND_FREIGHT_DATA_CHANGE,
      payload: isDataChange
    })
  }
}



/**
 * @method isDataChange
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function isToolDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_TOOL_DATA_CHANGE,
      payload: isDataChange
    })
  }
}


/**
 * @method isDataChange
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function isDiscountDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_DISCOUNT_DATA_CHANGE,
      payload: isDataChange
    })
  }
}
/**
 * @method isPaymentTermsDataChange
 * @description THIS METHOD IS FOR CALLING PAYMENT TERMS API IF CHNAGES HAVE BEEN MADE 
*/
export function isPaymentTermsDataChange(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: CHECK_IS_PAYMENT_TERMS_DATA_CHANGE,
      payload: isDataChange
    })
  }
}

/**
 * @method:setForgingCalculatorMachiningStockSection
 * @description: Used for storing part no from costing summary
 * @param {*} data
 */
export function setForgingCalculatorMachiningStockSection(data) {
  return (dispatch) => {
    dispatch({
      type: FORGING_CALCULATOR_MACHININGSTOCK_SECTION,
      payload: data,
    })
  }
}


export function setSelectedIds(data) {                  //THIS METHOD WILL SAVE OPERATION ID'S OF SELECTED OPERATION AND OTHER OPERATION
  return (dispatch) => {
    dispatch({
      type: SELECTED_IDS_OF_OPERATION_AND_OTHEROPERATION,
      payload: data,
    })
  }
}


export function setMasterBatchObj(data) {
  return (dispatch) => {
    dispatch({
      type: SET_MASTER_BATCH_OBJ,
      payload: data
    })
  }
}

export function setSelectedIdsOperation(data) {                  //THIS METHOD WILL SAVE OPERATION ID'S OF SELECTED OPERATION 
  return (dispatch) => {
    dispatch({
      type: SELECTED_IDS_OF_OPERATION,
      payload: data,
    })
  }
}

export function setSelectedDataOfCheckBox(data) {
  return (dispatch) => {
    dispatch({
      type: SELECTED_PROCESS_AND_GROUPCODE,
      payload: data
    })
  }
}

export function setIdsOfProcess(data) {
  return (dispatch) => {
    dispatch({
      type: SET_PROCESS_ID,
      payload: data
    })
  }
}
export function setIdsOfProcessGroup(data) {
  return (dispatch) => {
    dispatch({
      type: SET_PROCESSGROUP_ID,
      payload: data
    })
  }
}

export function getMachineProcessGroupDetail(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const queryParams = `loggedInUserId=${loggedInUserId()}&vendorId=${data.VendorId}&technologyId=${data.TechnologyId}&effectiveDate=${data.EffectiveDate}&customerId=${data.CustomerId}&vendorPlantId=${data.VendorPlantId}&costingTypeId=${data.CostingTypeId}&costingId=${data.CostingId}&plantId=${data.PlantId}`;
    const request = axios.get(`${API.getMachineProcessGroupDetail}?${queryParams}`, config())
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error);
    })
  }
}

export function checkHistoryCostingAndSAPPoPrice(params, callback) {
  return (dispatch) => {
    const queryParameter = `${params.costingId}`;
    const request = axios.get(`${API.checkHistoryCostingAndSAPPoPrice}?costingId=${queryParameter}`, config())
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: CHECK_HISTORY_COSTING_AND_SAP_PO_PRICE,
          payload: response.status === 204 ? [] : response.data.DataList,
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      // apiErrors(error)
      callback(error)
    })
  }
}

//FG WISE IMPACT DATA SHOW IN COSTING SUMMARY
export function getFgWiseImpactDataForCosting(costingId, callback) {
  return (dispatch) => {

    dispatch({
      type: GET_FG_WISE_IMPACT_DATA,
      payload: [],
    })
    const request = axiosInstance.post(`${API.getFgWiseImpactDataForCosting}`, costingId, config());
    // const request = axiosInstance.post(API.getFgWiseImpactDataForCosting, costingId, config())
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_FG_WISE_IMPACT_DATA,
          payload: response.data.DataList,
        })
        callback(response)
      } else if (response.status === 204) {
        dispatch({
          type: GET_FG_WISE_IMPACT_DATA,
          payload: [],
        })
        callback(response)
      }

    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error)
    })
  }
}

export function sapPushedCostingInitialMoment(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.sapPushedCostingInitialMoment, data, config());
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error)
      apiErrors(error);
    })
  }
}
/**
 * @method savePartNumberAndBOMLevel
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function savePartNumber(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: SAVE_PART_NUMBER_STOP_API_CALL,
      payload: isDataChange
    })
  }
}

/**
 * @method setPartNumberArrayAPICALL
 * @description THIS METHOD IS FOR CALLING SAVE API IF CHNAGES HAVE BEEN MADE 
*/

export function setPartNumberArrayAPICALL(isDataChange) {
  return (dispatch) => {
    dispatch({
      type: SET_PART_NUMBER_ARRAY_API_CALL,
      payload: isDataChange
    })
  }
}

/**
 * @method setMessageForAssembly
 * @description SET COMPONENT ITEM DATA  
 */
export function setMessageForAssembly(message) {
  return (dispatch) => {
    dispatch({
      type: SET_MESSAGE_FOR_ASSEMBLY,
      payload: message,
    });
  }
};

/**
 * @method setProcessGroupGrid
 * @description SET COMPONENT ITEM DATA  
 */
export function setProcessGroupGrid(grid) {
  return (dispatch) => {
    dispatch({
      type: SET_PROCESS_GROUP_GRID,
      payload: grid,
    });
  }
};

/**
 * @method saveBOMLevel
 * @description saveBOMLevel
*/

export function saveBOMLevel(data) {
  return (dispatch) => {
    dispatch({
      type: SAVE_BOM_LEVEL_STOP_API_CALL,
      payload: data
    })
  }
}
/**
 * @method checkFinalUser
 * @description CHECK FINAL USER
 */
export function checkFinalUser(data, callback) {
  return (dispatch) => {
    const queryParams = `loggedInUserId=${loggedInUserId()}&DepartmentId=${data.DepartmentId}&UserId=${data.UserId}&TechnologyId=${data.TechnologyId}&Mode=${data.Mode}&approvalTypeId=${data?.approvalTypeId}&plantId=${data?.plantId}&divisionId=${data?.divisionId ?? null}`

    const request = axios.get(`${API.checkFinalUser}?${queryParams}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method saveAssemblyNumber
 * @description saveAssemblyNumber
*/
export function saveAssemblyNumber(assemblyNumber) {
  return (dispatch) => {
    dispatch({
      type: SAVE_ASSEMBLY_NUMBER_STOP_API_CALL,
      payload: assemblyNumber
    })
  }
}

/**
 * @method setSurfaceCostInOverheadProfitRejection
 * @description SET SURFACE TREATMENT COST FOR REJECTION
 */
export function setSurfaceCostInOverheadProfitRejection(IsIncluded, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_SURFACE_COST_FOR_REJECTION_DATA,
      payload: IsIncluded,
    });
    callback();
  }
};

/**
 * @method setToolCostInOverheadProfit
 * @description ADD TOOL COST IN OVERHEAD & PROFIT
 */
export function setToolCostInOverheadProfit(IsIncluded, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_TOOL_COST_FOR_OVERHEAD_PROFIT,
      payload: IsIncluded,
    });
    callback();
  }
};

export function setIncludeOverheadProfitIcc(IsIncluded, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_OVERHEAD_PROFIT_ICC,
      payload: IsIncluded,
    });
    callback();
  }
};

/**
 * @method createCosting
 * @description CREATE ZBC COSTING
 */
export function createMultiTechnologyCosting(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createMultiTechnologyCosting, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
      callback(error)
    })
  }
}

/**
 * @method setOverheadProfitErrors
 * @description setOverheadProfitErrors  
 */
export function setOverheadProfitErrors(errObj) {
  return (dispatch) => {
    dispatch({
      type: SET_OVERHEAD_PROFIT_ERRORS,
      payload: errObj,
    });
  }
};

/**
 * @method setToolsErrors
 * @description setToolsErrors
 */
export function setToolsErrors(errObj) {
  return (dispatch) => {
    dispatch({
      type: SET_TOOLS_ERRORS,
      payload: errObj,
    });
  }
};

/**
 * @method setDiscountErrors
 * @description setDiscountErrors  
 */
export function setDiscountErrors(errObj) {
  return (dispatch) => {
    dispatch({
      type: SET_DISCOUNT_ERRORS,
      payload: errObj,
    });
  }
};

export function setNPVData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_NPV_DATA,
      payload: data,
    });
  }
};
export function setOtherCostData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_OTHER_COST,
      payload: data,
    });
  }
};
export function setOtherDiscountData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_OTHER_DISCOUNT_DATA,
      payload: data,
    });
  }
};
export function setRejectionRecoveryData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_REJECTION_RECOVERY_DATA,
      payload: data,
    });
  }
};


export function getCostingLabourDetails(data, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const queryParams = `loggedInUserId=${loggedInUser?.loggedInUserId}&costingId=${data}`
    const request = axios.get(`${API.getCostingLabourDetails}?${queryParams}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method setYOYCostGrid
 * @description setYOYCostGrid
 */
export function setYOYCostGrid(grid) {
  return (dispatch) => {
    dispatch({
      type: SET_YOY_COST_GRID,
      payload: grid,
    });
  }
};

/**
 * @method getYOYCostList
 * @description get YOY Cost List
 */
export function getYOYCostList(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const query = `quotationId=${data?.quotationId ? data?.quotationId : ''}&partId=${data?.partId ? data?.partId : ''}&vendorId=${data?.vendorId ? data?.vendorId : ''}`
    const request = axios.get(`${API.getYOYCostList}?${query}`, config())
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SET_YOY_COST_GRID,
          payload: response?.data?.Data,
        })
        dispatch({
          type: SET_YOY_COST_GRID_FOR_SAVE,
          payload: response?.data?.Data,
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

export function saveCostingLabourDetails(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingLabourDetails, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}


export function createPFS2Costing(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createPFS2Costing, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

export function getLabourDetailsByFilter(data, callback) {
  return (dispatch) => {
    const queryParams = `effectiveDate=${data.effectiveDate ? data.effectiveDate : ''}&costingHeadId=${data.costingHeadId ? data.costingHeadId : ''}&partId=${data.partId ? data.partId : ''}&plant_id=${data.plantId ? data.plantId : ''}&vendorId=${data.vendorId ? data.vendorId : ''}&customerId=${data.customerId ? data.customerId : ''}&machine_type_id=${0}&state_id=${0}&labour_type_id=${0}`
    const request = axios.get(`${API.getLabourDetailsByFilter}?${queryParams}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}


export function checkPartNoExistInBop(data, callback) {
  return (dispatch) => {
    // const queryParams = `partNumber=${data.partNumber}&plantId=${data.plantId}&vendorId=${data.vendorId}&customerId=${data.customerId}`
    const queryParams = encodeQueryParamsAndLog({ loggedInUserId: loggedInUserId(), partNumber: data.partNumber, plantId: data.plantId, vendorId: data.vendorId, customerId: data.customerId });
    const request = axios.get(`${API.checkPartNoExistInBop}?${queryParams}`, config())
    request.then((response) => {
      if (response.data) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}
export const resetExchangeRateData = () => ({
  type: RESET_EXCHANGE_RATE_DATA,
});

export const setRejectedCostingViewData = (data) => (dispatch) => {
  let temp = []
  // temp.push(VIEW_COSTING_DATA)
  data.map((val) => (
    temp.push(val)
  ))
  dispatch({
    type: SET_REJECTED_COSTING_VIEW_DATA,
    payload: temp,
  })
}

/**
 * @method setCallSTAPI
 * @description setCallSTAPI  
 */
export function setCallSTAPI(TabData) {
  return (dispatch) => {
    dispatch({
      type: SET_CALL_ST_API,
      payload: TabData,
    });
  }
};

/**
 * @method setBreakupBOP
 * @description setBreakupBOP
 */
export function setBreakupBOP(grid) {
  return (dispatch) => {
    dispatch({
      type: SET_BREAKUP_BOP,
      payload: grid,
    });
  }
};

/**
 * @method setIsBreakupBoughtOutPartCostingFromAPI
 * @description setIsBreakupBoughtOutPartCostingFromAPI
 */
export function setIsBreakupBoughtOutPartCostingFromAPI(value) {
  return (dispatch) => {
    dispatch({
      type: SET_IS_BREAKUP_BOUGHTOUTPART_COSTING_FROM_API,
      payload: value,
    });
  }
};

/**
 * @method setCostingMode
 * @description setCostingMode
 */
export function setCostingMode(value) {
  return (dispatch) => {
    dispatch({
      type: SET_COSTING_MODE,
      payload: value,
    });
  }
};

/**
 * @method getReleaseStrategyApprovalDetails
 * @description getReleaseStrategyApprovalDetails
 */
export function getReleaseStrategyApprovalDetails(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.getReleaseStrategyApprovalDetails, data, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      callback(error.response)
      if (error.response.status === 412) {
        Toaster.warning(error?.response?.data?.Message)
        return false
      }
      apiErrors(error)
    })
  }
}
//MINDA
/**
 * @method updateZBCSOBDetail
 * @description UPDATE ZBC SOB DETAILS
 */
export function updateCostingIdFromRfqToNfrPfs(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    axiosInstance.post(`${API.updateCostingIdFromRfqToNfrPfs}`, requestData, config())
      .then((response) => {
        callback(response)
      }).catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
      })
  }
}

export function corrugatedData(data) {
  return (dispatch) => {
    dispatch({
      type: CORRUGATED_DATA,
      payload: data,
    });
  }
}
export function openCloseStatus(status) {
  return (dispatch) => {
    dispatch({
      type: COSTING_ACC_OPEN_CLOSE_STATUS,
      payload: status,
    });
  }
};

/**
 * @method getExternalIntegrationFgWiseImpactData
 * @description getExternalIntegrationFgWiseImpactData
 */
export function getExternalIntegrationFgWiseImpactData(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.getExternalIntegrationFgWiseImpactData, data, config())
    request.then((response) => {
      if (response.data.Result || response?.status === 204) {
        dispatch({
          type: GET_EXTERNAL_INTEGRATION_FG_WISE_IMPACT_DATA,
          payload: response?.status === 200 ? response?.data?.DataList : [],
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}


export function setIncludeToolCostIcc(IsIncluded, callback) {
  return (dispatch) => {
    dispatch({
      type: SET_TOOL_COST_ICC,
      payload: IsIncluded,
    });
    callback();
  }
};
export function setPaymentTermCost(data, callback) {

  return (dispatch) => {
    dispatch({
      type: SET_PAYMENT_TERM_COST,
      payload: data || {},
    });
    callback();
  }
};


/**
 * @method getAssemblyChildPartbyAsmCostingId
 * @description To Get part List of all the parts of a BOM
 */
export function getAssemblyChildPartbyAsmCostingId(costingId, isAddedBoughtOutPartType = false, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getAssemblyChildPartbyAsmCostingId}?loggedInUserId=${loggedInUser?.loggedInUserId}&asmCostingId=${costingId}&isAddedBoughtOutPartType=${isAddedBoughtOutPartType}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

/**
 * @method getProcessAndOperationbyAsmAndChildCostingId
 * @description To get process and operation by assembly and child costing id
 */
export function getProcessAndOperationbyAsmAndChildCostingId(asmCostingId, childCostingId, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getProcessAndOperationbyCostingId}?loggedInUserId=${loggedInUser?.loggedInUserId}&asmCostingId=${asmCostingId}&childCostingId=${childCostingId}`, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}
export function getCostingPaymentTermDetail(costingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {

    const request = axios.get(`${API.getCostingPaymentTermDetail}/${costingId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data?.Data || response?.status === 204) {
        const netCost = response.data?.Data?.PaymentTermDetail?.NetCost;
        //const applicabilityCost = response.data?.Data?.ApplicabilityCost;
        dispatch({
          type: GET_COSTING_PAYMENT_TERM_DETAIL,
          payload: response?.data?.Data || {},
        });
        dispatch({
          type: SET_PAYMENT_TERM_COST,
          payload: { NetCost: netCost/* , ApplicabilityCost: applicabilityCost  */ } || {},
        });
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);

    });
  };
}
export function saveCostingPaymentTermDetail(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingPaymentTermDetail, data, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      callback(error.response)
      if (error.response.status === 412) {
        Toaster.warning(error?.response?.data?.Message)
        return false
      }
      apiErrors(error)
    })
  }
}
export function getCostingTcoDetails(costingId, callback) {
  return (dispatch) => {
    const loggedInUser = { loggedInUserId: loggedInUserId() }
    const request = axios.get(`${API.getCostingTcoDetails}?loggedInUserId=${loggedInUser?.loggedInUserId}&costingId=${costingId}`, config());
    request.then((response) => {
      if (response.data?.Data || response?.status === 204) {
        dispatch({
          type: GET_TCO_DATA,
          payload: response?.data?.Data || {},
        });
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);

    });
  };
}

export const setCostingViewDataForAssemblyTechnology = (data) => (dispatch) => {
  let temp = []
  data && data?.map((val) => (
    temp.push(val)
  ))
  dispatch({
    type: SET_COSTING_VIEW_DATA_FOR_ASSEMBLY,
    payload: temp,
  })
}
export function setCostingtype(costingType) {

  return (dispatch) => {
    dispatch({
      type: SET_RFQ_COSTING_TYPE,
      payload: costingType || {},
    });
    // callback();
  }
}

// export const getSpecificationDetailTco = () => {
//   return (dispatch) => {
//     dispatch({
//       type: PARTSPECIFICATIONRFQDATA,
//       payload:specification.Data // Dispatch mock or predefined data
//     });
//   };
// };

export function getSpecificationDetailTco(quotationId, baseCostingIds, callback) {
  return (dispatch) => {
    const url = `${API.getSpecificationDetailTco}`;
    const requestData = {
      QuotationId: quotationId,
      BaseCostingIdList: baseCostingIds
    };

    axiosInstance.post(url, requestData, config())
      .then((response) => {
        if (response.data.Result || response.status === 204) {
          dispatch({
            type: PARTSPECIFICATIONRFQDATA,
            payload: response.status === 204 ? [] : response.data.Data
          });
          callback(response);
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE });
        // Handle errors
      });
  };
}

export function getSpecificationDetailBpo(quotationId, bopId, callback) {
  return (dispatch) => {
    const url = `${API.getSpecificationDetailBop}`;
    const requestData = {
      QuotationId: quotationId,
      BoughtOutPartIdList: bopId
    };

    axiosInstance.post(url, requestData, config())
      .then((response) => {
        if (response.data.Result || response.status === 204) {
          dispatch({
            type: PARTSPECIFICATIONRFQDATA,
            payload: response.status === 204 ? [] : response.data.Data
          });
          callback(response);
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE });
        // Handle errors
      });
  };
}
/**
 * @method getExternalIntegrationEvaluationType
 * @description getExternalIntegrationEvaluationType
 */
export function getExternalIntegrationEvaluationType(data, callback) {

  return (dispatch) => {
    const request = axios.get(`${API.getEvaluationType}?plantCode=${data?.plantCode}&partNumber=${data?.partNumber}`, config())
    request.then((response) => {
      if (response.data.Result || response?.status === 204) {
        dispatch({
          type: GET_SAP_EVALUATIONTYPE,
          payload: response?.status === 200 ? response?.data?.SelectList : [],
        })
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: GET_SAP_EVALUATIONTYPE, payload: [] })
      callback(error)
      apiErrors(error)
    })

  }
}

/**
 * @method saveCostingBasicDetails
 * @description saveCostingBasicDetails
 */
export function saveCostingBasicDetails(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingBasicDetails, data, config())
    request.then((response) => {
      if (response.data.Result) {
        callback(response)
      }
    }).catch((error) => {
      callback(error.response)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}

export function setExchangeRateSourceValue(value) {
  return (dispatch) => {
    dispatch({
      type: SET_EXCHANGE_RATE_SOURCE,
      payload: value
    });
  }
}

export function setCurrencySource(value) {
  return (dispatch) => {
    dispatch({
      type: SET_CURRENCY_SOURCE,
      payload: value
    });
  }
}
export function exchangeRateReducer(value) {
  return (dispatch) => {
    dispatch({
      type: SET_EXCHANGE_RATE_DATA,
      payload: value
    });
  }
}

/**
 * @method getCostingCostDetails
 * @description get Costing Cost Details
 */
export function getCostingCostDetails(obj, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getCostingCostDetails}?costingId=${obj?.costingId}&subAsmCostingId=${obj?.subAsmCostingId}&asmCostingId=${obj?.asmCostingId}&loggedInUserId=${loggedInUserId()}`, config())
    request
      .then((response) => {
        if (response?.data?.Result) {
          dispatch({
            type: GET_COSTING_COST_DETAILS,
            payload: response?.data?.Data,
          })
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}
export function setOperationApplicabilitySelect(data) {
  return (dispatch) => {
    dispatch({
      type: SET_OPERATION_APPLICABILITY_SELECT,
      payload: data,
    });
  }
};
export function setProcessApplicabilitySelect(data) {
  return (dispatch) => {
    dispatch({
      type: SET_PROCESS_APPLICABILITY_SELECT,
      payload: data,
    });
  }
};
export function saveSurfaceTreatmentRawMaterialCalculator(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveSurfaceTreatmentRawMaterialCalculator, data, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      callback(error.response)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}
export function getSurfaceTreatmentRawMaterialCalculator(params, callback) {
  let param = `baseCostingId=${params.BaseCostingId}&loggedInUserId=${params.LoggedInUserId}`
  return (dispatch) => {
    const request = axios.get(`${API.getSurfaceTreatmentRawMaterialCalculator}?${param}`, config())
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      callback(error.response)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })

  }
}

export function getPaintCoatList(callback) {
  return (dispatch) => {
    const request = axiosInstance.get(API.getPaintCoatList, config())
    request.then((response) => {
      if (response.data.Result || response?.status === 204) {
        dispatch({
          type: GET_PAINT_COAT_LIST,
          payload: response?.status === 200 ? response?.data?.SelectList : [],
        })
        callback(response)
      }
    }).catch((error) => {
      callback(error)
      dispatch({ type: API_FAILURE })
      apiErrors(error)
    })
  }
}
export function getCostingBopAndBopHandlingDetails(data, callback) {

  return (dispatch) => {
    const request = axios.get(`${API.getCostingBopAndBopHandlingDetails}?costingId=${data?.costingId}&subAssemblyCostingId=${data?.subAssemblyCostingId}&assemblyCostingId=${data?.assemblyCostingId}&loggedInUserId=${data?.loggedInUserId}`, config())
    request.then((response) => {
      if (response.data.Result || response?.status === 204) {
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
      callback(error)
      apiErrors(error)
    })

  }
}