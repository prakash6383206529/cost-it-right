import axios from 'axios';
import {
  API,
  API_REQUEST,
  API_FAILURE,
  API_SUCCESS,
  GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
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
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
  'Content-Type': 'application/json',
  //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};

/**
* @method getCostingTechnologySelectList
* @description GET TECHNOLOGY SELECTLIST
*/
export function getCostingTechnologySelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingTechnologySelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_TECHNOLOGY_SELECTLIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
* @method getAllPartSelectList
* @description GET TECHNOLOGY SELECTLIST
*/
export function getAllPartSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getAllPartSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_PART_SELECTLIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
* @method getPartInfo
* @description GET PART INFO
*/
export function getPartInfo(PartId, callback) {
  return (dispatch) => {
    if (PartId !== '') {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getCostingPartDetails}/${PartId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_PART_INFO,
            payload: response.data.Data,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE });
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_PART_INFO,
        payload: {},
      });
    }
  };
}

/**
 * @method checkPartWithTechnology
 * @description CHECK PART WITH TECHNOLOGY IS ASSOCIATED OR NOT
 */
export function checkPartWithTechnology(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.checkPartWithTechnology, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      callback(error.response);
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method createZBCCosting
 * @description CREATE ZBC COSTING
 */
export function createZBCCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createZBCCosting, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method createVBCCosting
 * @description CREATE VBC COSTING
 */
export function createVBCCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createVBCCosting, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
* @method getZBCExistingCosting
* @description get ZBC Costing Select List By Part
*/
export function getZBCExistingCosting(PartId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getZBCExistingCosting}/${PartId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}

/**
* @method getVBCExistingCosting
* @description get VBC Costing Select List By Part
*/
export function getVBCExistingCosting(PartId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getVBCExistingCosting}/${PartId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}

/**
 * @method updateZBCSOBDetail
 * @description UPDATE ZBC SOB DETAILS
 */
export function updateZBCSOBDetail(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.put(`${API.updateZBCSOBDetail}`, requestData, headers)
      .then((response) => {
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method updateVBCSOBDetail
 * @description UPDATE VBC SOB DETAILS
 */
export function updateVBCSOBDetail(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.put(`${API.updateVBCSOBDetail}`, requestData, headers)
      .then((response) => {
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method getZBCCostingByCostingId
 * @description GET COSTING DETAIL BY COSTING ID
 */
export function getZBCCostingByCostingId(CostingId, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getZBCCostingByCostingId}/${CostingId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_DATA_BY_COSTINGID,
          payload: response.data.Data,
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
  };
}

/**
 * @method setCostingDataList
 * @description SET COSTING DATA LIST
 */
export function setCostingDataList(CostingDataList, callback) {
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
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getZBCDetailByPlantId}/${PlantId}`, headers);
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
 * @method getVBCDetailByVendorId
 * @description GET VENDOR DETAIL IN COSTING VENDOR ADD DRAWER 
 */
export function getVBCDetailByVendorId(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getVBCDetailByVendorId}/${data.VendorId}/${data.VendorPlantId}`, headers);
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
 * @method getRMCCTabData
 * @description GET RM+CC TAB DATA IN COSTING DETAIL
 */
export function getRMCCTabData(data, IsUseReducer, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRMCCTabData}/${data.CostingId}/${data.PartId}`, headers);
    request.then((response) => {
      if (IsUseReducer && response.data.Result) {
        let TabData = response.data.DataList;
        dispatch({
          type: SET_RMCC_TAB_DATA,
          payload: TabData,
        });
        //callback(response);
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
 * @method getRMDrawerDataList
 * @description GET RM DATALIST IN RM DRAWER IN COSTING
 */
export function getRMDrawerDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRMDrawerDataList}/${data.PlantId}/${data.CostingId}`, headers);
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
 * @method getRMDrawerVBCDataList
 * @description GET RM DATALIST IN RM DRAWER IN COSTING VBC
 */
export function getRMDrawerVBCDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRMDrawerVBCDataList}/${data.VendorId}/${data.VendorPlantId}/${data.CostingId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
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
 * @description GET BOP DATALIST IN RM DRAWER IN COSTING
 */
export function getBOPDrawerDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPDrawerDataList}/${data.PlantId}/${data.CostingId}`, headers);
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
 * @method getBOPDrawerVBCDataList
 * @description GET BOP DATALIST IN BOP DRAWER IN COSTING VBC
 */
export function getBOPDrawerVBCDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPDrawerVBCDataList}/${data.VendorId}/${data.VendorPlantId}/${data.CostingId}`, headers);
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
 * @method getOperationDrawerDataList
 * @description GET OPERATION DATALIST IN OPERATION DRAWER IN COSTING
 */
export function getOperationDrawerDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOperationDrawerDataList}/${data.PlantId}/${data.CostingId}`, headers);
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
 * @method getOperationDrawerVBCDataList
 * @description GET OPERATION DATALIST IN OPERATION DRAWER IN COSTING VBC
 */
export function getOperationDrawerVBCDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOperationDrawerVBCDataList}/${data.VendorId}/${data.VendorPlantId}/${data.CostingId}`, headers);
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
 * @method getProcessDrawerDataList
 * @description GET OPERATION DATALIST IN OPERATION DRAWER IN COSTING
 */
export function getProcessDrawerDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getProcessDrawerDataList}/${data.PlantId}/${data.CostingId}`, headers);
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
 * @method getProcessDrawerVBCDataList
 * @description GET PROCESS DATALIST IN PROCESS DRAWER IN COSTING VBC
 */
export function getProcessDrawerVBCDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getProcessDrawerVBCDataList}/${data.VendorId}/${data.VendorPlantId}/${data.CostingId}`, headers);
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
 * @method saveCostingRMCCTab
 * @description SAVE COSTING RM+CC TAB
 */
export function saveCostingRMCCTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCostingRMCCTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method saveComponentCostingRMCCTab
 * @description SAVE COMPONENT COSTING RM+CC TAB
 */
export function saveComponentCostingRMCCTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveComponentCostingRMCCTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getSurfaceTreatmentTabData
 * @description GET SURFACE TREATMENT DATA IN COSTING DETAIL
 */
export function getSurfaceTreatmentTabData(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSurfaceTreatmentTabData}/${data.CostingId}/${data.PartId}`, headers);
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
 * @method saveCostingSurfaceTreatmentTab
 * @description SAVE COSTING SURFACE TREATMENT TAB
 */
export function saveCostingSurfaceTreatmentTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCostingSurfaceTreatmentTab, data, headers);
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
 * @description GET SURFACE TREATMENT DATALIST IN SURFACE TREATMENT DRAWER IN COSTING
 */
export function getSurfaceTreatmentDrawerDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSurfaceTreatmentDrawerDataList}/${data.PlantId}/${data.CostingId}`, headers);
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
 * @method getSurfaceTreatmentDrawerVBCDataList
 * @description GET PROCESS DATALIST IN PROCESS DRAWER IN COSTING VBC
 */
export function getSurfaceTreatmentDrawerVBCDataList(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSurfaceTreatmentDrawerVBCDataList}/${data.VendorId}/${data.VendorPlantId}/${data.CostingId}`, headers);
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
export function getOverheadProfitTabData(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOverheadProfitTabData}/${data.CostingId}/${data.PartId}`, headers);
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
 * @method getOverheadProfitDataByModelType
 * @description GET OVERHEAD & PROFIT DATA BY MODEL TYPE
 */
export function getOverheadProfitDataByModelType(ModelTypeId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOverheadProfitDataByModelType}/${ModelTypeId}`, headers);
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
 * @method saveCostingOverheadProfitTab
 * @description SAVE COSTING OVERHEAD PROFIT TAB
 */
export function saveCostingOverheadProfitTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCostingOverheadProfitTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getInventoryDataByHeads
 * @description GET INVENTORY DETAIL BY COSTING HEADS
 */
export function getInventoryDataByHeads(Id, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getInventoryDataByHeads}/${Id}`, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getPaymentTermsDataByHeads
 * @description GET PAYMENT TERM DETAIL BY COSTING HEADS
 */
export function getPaymentTermsDataByHeads(Id, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPaymentTermsDataByHeads}/${Id}`, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getPackageFreightTabData
 * @description GET PACKAGE AND FREIGHT DATA IN COSTING DETAIL
 */
export function getPackageFreightTabData(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPackageFreightTabData}/${data.CostingId}/${data.PartId}`, headers);
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
 * @method saveCostingPackageFreightTab
 * @description SAVE COSTING PACKAGE & FREIGHT TAB
 */
export function saveCostingPackageFreightTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCostingPackageFreightTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getFreigtFullTruckCapacitySelectList
 * @description GET FREIGHT FULL TRUCK CAPACITY SELECTLIST
 */
export function getFreigtFullTruckCapacitySelectList() {
  return (dispatch) => {
    const request = axios.get(API.getFreigtFullTruckCapacitySelectList, headers);
    request.then((response) => {
      dispatch({
        type: GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
        payload: response.data.SelectList,
      });
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getRateCriteriaByCapacitySelectList
 * @description GET RATE CRITERIA BY CAPACITY SELECTLIST
 */
export function getRateCriteriaByCapacitySelectList(Capacity) {
  return (dispatch) => {
    const request = axios.get(`${API.getRateCriteriaByCapacitySelectList}/${Capacity}`, headers);
    request.then((response) => {
      dispatch({
        type: GET_RATE_CRITERIA_BY_CAPACITY,
        payload: response.data.SelectList,
      });
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getRateByCapacityCriteria
 * @description GET RATE BY CAPACITY AND CRITERIA
 */
export function getRateByCapacityCriteria(data, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getRateByCapacityCriteria}/${data.Capacity}/${data.Criteria}`, headers);
    request.then((response) => {
      callback(response)
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getToolTabData
 * @description GET TOOL DATA IN COSTING DETAIL
 */
export function getToolTabData(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getToolTabData}/${data.CostingId}/${data.PartId}`, headers);
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
 * @method saveToolTab
 * @description SAVE TOOL TAB
 */
export function saveToolTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveToolTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getDiscountOtherCostTabData
 * @description GET DISCOUNT OTHER COST IN COSTING DETAIL
 */
export function getDiscountOtherCostTabData(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getDiscountOtherCostTabData}/${data.CostingId}/${data.PartId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      console.log('error: ', error);
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
export function getExchangeRateByCurrency(Currency, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getExchangeRateByCurrency}/${Currency}`, headers);
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
 * @method saveDiscountOtherCostTab
 * @description SAVE DISCOUNT OTHER COST TAB
 */
export function saveDiscountOtherCostTab(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveDiscountOtherCostTab, data, headers);
    request.then((response) => {
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method fileUploadCosting
 * @description File Upload COSTING
 */
export function fileUploadCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.fileUploadCosting, data, headers);
    request.then((response) => {
      if (response && response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method fileDeleteCosting
 * @description DELETE COSTING FILES
 */
export function fileDeleteCosting(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.delete(`${API.fileDeleteCosting}/${data.Id}/${data.DeletedBy}`, headers)
      .then((response) => {
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}



























































/**
 * @method getExistingSupplierDetailByPartId
 * @description get Existing Supplier Detail By PartId
 */
export function getExistingSupplierDetailByPartId(partId, loginUserId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getExistingSupplierDetailByPartId}/${partId}/${loginUserId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({
        type: GET_SUPPLIER_DETAIL_BY_PARTID_SUCCESS,
        payload: null,
      });
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
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
    });
    callback()
  }
}

/**
* @method getZBCCostingSelectListByPart
* @description get ZBC Costing Select List By Part
*/
export function getZBCCostingSelectListByPart(PartId, SupplierId, UserId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getZBCCostingSelectListByPart}/${PartId}/${SupplierId}/${UserId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_ZBC_COSTING_SELECTLIST_BY_PART,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}


/**
 * @method createPartWithSupplier
 * @description create part with supplier
 */
export function createPartWithSupplier(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createPartWithSupplier, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        toastr.success(MESSAGES.ADD_PART_WITH_SUPPLIER_SUCCESS);
      }
      callback(response);
    }).catch((error) => {
      dispatch({
        type: API_FAILURE
      });
      apiErrors(error);
    });
  };
}

/**
 * @method getCostingByCostingId
 * @description get costing by costingId
 */
export function getCostingByCostingId(costingId, supplier, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingByCostingId}/${costingId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_BY_COSTINGID,
          payload: response.data.Data,
          supplier: supplier,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}


/**
 * @method getCostSummaryOtherOperation
 * @description get all other operation for cost summary 
 */
export function getCostSummaryOtherOperation(supplierId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostSummaryOtherOperationList}/${supplierId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COST_SUMMARY_OTHER_OPERATION_LIST_SUCCESS,
          payload: response.data.DataList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
    });
  };
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
    });
    callback();
  };
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
    });
    callback();
  };
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
    });
  };
}

/**
 * @method getCostingOverHeadProByModelType
 * @description get overhead type by model type
 */
export function getCostingOverHeadProByModelType(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.getCostingOverHeadProByModelType, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error.response);
    });
  };
}

/**
 * @method saveCosting
 * @description save Costing
 */
export function saveCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCosting, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        // dispatch({
        //     type: SET_INVENTORY_ROW_DATA_TO_COST_SUMMARY,
        //     payload: response.data.Data,
        // });
        callback(response);
      }
    }).catch((error) => {
      dispatch({
        type: API_FAILURE
      });
      apiErrors(error);
    });
  };
}

/**
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function fetchFreightHeadsAPI(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.fetchFreightHeadsAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_FREIGHT_HEAD_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method reassignCostingAPI
 * @description Reassign costing for approval
 */
export function reassignCostingAPI(CostingId, callback) {
  return (dispatch) => {
    //dispatch({ type: AUTH_API_REQUEST });
    axios.put(`${API.reassignCosting}/${CostingId}`, { headers })
      .then((response) => {
        if (response.data.Result) {
          callback(response);
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE });
        apiErrors(error);
        callback(error);
      });
  };
}

/**
 * @method cancelCostingAPI
 * @description Reassign costing for approval
 */
export function cancelCostingAPI(CostingId, callback) {
  return (dispatch) => {
    //dispatch({ type: AUTH_API_REQUEST });
    axios.post(`${API.cancelCosting}/${CostingId}`, { headers })
      .then((response) => {
        if (response.data.Result) {
          callback(response);
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE });
        apiErrors(error);
        callback(error);
      });
  };
}

/**
 * @method getCostingFreight
 * @description Used to fetch costing heads
 */
export function getCostingFreight(data, callback) {
  return (dispatch) => {
    // dispatch({ type: API_REQUEST });
    const request = axios.post(`${API.getCostingFreight}`, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_FREIGHT_AMOUNT_DATA_SUCCESS,
          payload: response.data.Data,
        });
        callback(response);
      } else if (response.data == '') {
        dispatch({ type: API_FAILURE });
        toastr.warning('No content available for selected freight.');
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

export function emptyCostingData() {
  return (dispatch) => {
    dispatch({
      type: EMPTY_COSTING_DATA,
      payload: {}
    });
  }
}

/**
 * @method copyCostingAPI
 * @description Used to copy costing API
 */
export function copyCostingAPI(data, callback) {
  return (dispatch) => {
    // dispatch({ type: API_REQUEST });
    const request = axios.post(`${API.copyCostingAPI}`, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({ type: API_SUCCESS, });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}