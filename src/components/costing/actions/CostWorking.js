import axios from 'axios';
import {
  API, API_REQUEST, API_FAILURE, GET_WEIGHT_CALC_INFO_SUCCESS, CREATE_WEIGHT_CALC_COSTING_SUCCESS, UPDATE_WEIGHT_CALC_SUCCESS, GET_WEIGHT_CALC_LAYOUT_SUCCESS,
  GET_COSTING_BY_SUPPLIER_SUCCESS, GET_RM_LIST_BY_SUPPLIER_SUCCESS, ADD_RAW_MATERIAL_COSTING_SUCCESS, CREATE_SHEETMETAL_COSTING_SUCCESS, GET_COSTING_DATA_SUCCESS,
  UPDATE_COSTING_RM_SUCCESS, GET_BOP_LIST_SUCCESS, ADD_BOP_COSTING_SUCCESS, GET_OTHER_OPERATION_LIST_SUCCESS, ADD_OTHER_OPERATION_COSTING_SUCCESS, ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
  GET_MHR_LIST_SUCCESS, ADD_MHR_FOR_PROCESS_GRID_DATA, GET_PROCESSES_LIST_SUCCESS, SAVE_PROCESS_COSTING_SUCCESS, GET_OTHER_OPERATION_SELECT_LIST_SUCCESS, SAVE_OTHER_OPERATION_COSTING_SUCCESS,
  ADD_PROCESS_COSTING_SUCCESS, SET_COSTING_DETAIL_ROW_DATA, UPDATE_COSTING_OTHER_OPERATION_SUCCESS, SAVE_COSTING_AS_DRAFT_SUCCESS, ADD_BOP_GRID_COSTING_SUCCESS,
  SAVE_BOP_COSTING_SUCCESS, GET_BULKUPLOAD_COSTING_LIST, config, EMPTY_GUID, FERROUS_CALCULATOR_RESET,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';

// const config() = config

/**
 * @method getWeightCalculationCosting
 * @description Get Weight Calculation Costing details
 */
export function getWeightCalculationCosting(CostingId = '', callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getWeightCalculationInfo}/${CostingId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_WEIGHT_CALC_INFO_SUCCESS,
          payload: response.data.Data,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getWeightCalculationLayoutType
 * @description Get Weight Calculation layout type radio button details
 */
export function getWeightCalculationLayoutType(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getWeightCalculationLayoutType}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_WEIGHT_CALC_LAYOUT_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
/**
 * @method getRawMaterialCalculationForSheetMetal
 * @description Get raw materical calculator data for Sheet Metal
*/
export function getRawMaterialCalculationForSheetMetal(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForSheetMetal}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveRawMaterialCalculationForSheetMetal
 * @description save raw materical calculator data for Sheet Metal
*/
export function saveRawMaterialCalculationForSheetMetal(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForSheetMetal, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForForging
 * @description Get raw materical calculator data for Forging
*/
export function getRawMaterialCalculationForForging(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForForging}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
/**
 * @method saveRawMaterialCalculationForForging
 * @description save raw materical calculator data for Forging
*/
export function saveRawMaterialCalculationForForging(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForForging, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForFerrous
 * @description Get raw materical calculator data for Ferrous
*/
export function getRawMaterialCalculationForFerrous(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${EMPTY_GUID}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForFerrous}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveRawMaterialCalculationForFerrous
 * @description save raw materical calculator data for Ferrous
*/
export function saveRawMaterialCalculationForFerrous(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForFerrous, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForPlastic
 * @description Get raw materical calculator data for Plastic
*/
export function getRawMaterialCalculationForPlastic(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForPlastic}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveRawMaterialCalculationForPlastic
 * @description save raw materical calculator data for Plastic
*/
export function saveRawMaterialCalculationForPlastic(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForPlastic, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForCorrugatedBox
 * @description Get raw materical calculator data for CorrugatedBox
*/
export function getRawMaterialCalculationForCorrugatedBox(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForCorrugatedBox}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
export function getRawMaterialCalculationForMonoCartonCorrugatedBox(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForMonoCartonCorrugatedBox}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
/**
 * @method saveRawMaterialCalculationForCorrugatedBox
 * @description save raw materical calculator data for Corrugated Box
*/
export function saveRawMaterialCalculationForCorrugatedBox(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForCorrugatedBox, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}
export function saveRawMaterialCalculationForMonoCartonCorrugatedBox(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForMonoCartonCorrugatedBox, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForDieCasting
 * @description Get raw materical calculator data for DieCasting
*/
export function getRawMaterialCalculationForDieCasting(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForDieCasting}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveRawMaterialCalculationForDieCasting
 * @description save raw materical calculator data for die casting
*/
export function saveRawMaterialCalculationForDieCasting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForDieCasting, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}
/**
 * @method getRawMaterialCalculationForRubber
 * @description Get raw materical calculator data for Rubber
*/
export function getRawMaterialCalculationForRubber(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForRubber}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
/**
 * @method saveRawMaterialCalculationForRubber
 * @description save raw materical calculator data for Rubber
*/
export function saveRawMaterialCalculationForRubber(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForRubber, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method createWeightCalculationCosting
 * @description Create Weight Calculation Costing
 */
export function createWeightCalculationCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.AddCostingWeightCalculation, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: CREATE_WEIGHT_CALC_COSTING_SUCCESS,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method updateWeightCalculationCosting
 * @description Update Weight Calculation Costing
 */
export function updateWeightCalculationCosting(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.put(`${API.UpdateCostingWeightCalculation}`, requestData, config())
      .then((response) => {
        dispatch({ type: UPDATE_WEIGHT_CALC_SUCCESS });
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getCostingBySupplier(reqData, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingBySupplier}?supplierId=${reqData.supplierId}&partId=${reqData.partId}&loggedInUserId=${reqData.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_BY_SUPPLIER_SUCCESS,
          payload: response.data.Data,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      // dispatch({
      //     type: GET_COSTING_BY_SUPPLIER_SUCCESS,
      //     payload: {},
      // });
      callback(error);
      apiErrors(error);
    });
  };
}


/**
 * @method getAllBOMAPI
 * @description get all bill of material list
 */
export function getRawMaterialListBySupplierId(supplierId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRawMaterialListBySupplierId}/${supplierId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_RM_LIST_BY_SUPPLIER_SUCCESS,
          payload: response.data.DataList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
    });
  };
}

/*
 * @method createNewCosting
 * @description Create new costing for selected supplier
 */
export function createNewCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createNewCosting, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: CREATE_SHEETMETAL_COSTING_SUCCESS,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method createBOMAPI
 * @description create bill of material master
 */
export function addCostingRawMaterial(data, selectedIndex, callback) {
  return (dispatch) => {
    // dispatch({
    //     type:  API_REQUEST,
    // });
    const request = axios.post(API.addCostingRawMaterial, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: ADD_RAW_MATERIAL_COSTING_SUCCESS,
          payload: data,
          selectedIndex: selectedIndex,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method getCostingDetailsById
 * @description get costing details by id
 */
export function getCostingDetailsById(costingId, isEditFlag, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (isEditFlag) {
      axios.get(`${API.getCostingDetailsById}/${costingId}`, config())
        .then((response) => {
          if (response.data.Result) {
            dispatch({
              type: GET_COSTING_DATA_SUCCESS,
              payload: response.data.Data,
            });
            // Empty data in costing edit case by clicked on list
            // dispatch({
            //     type: ADD_RAW_MATERIAL_COSTING_SUCCESS,
            //     payload: {},
            // });
            callback(response);
          } else {
            Toaster.error(MESSAGES.SOME_ERROR);
          }
          callback(response);
        }).catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
        });
    } else {
      dispatch({
        type: GET_COSTING_DATA_SUCCESS,
        payload: {},
      });
      callback({});
    }
  };
}

/**
 * @method updateBOPAPI
 * @description update BOP
 */
export function updateCostingRawMatrial(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.put(`${API.updateCostingRawMatrial}`, requestData, config())
      .then((response) => {
        dispatch({ type: UPDATE_COSTING_RM_SUCCESS });
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getBoughtOutPartList(supplierId, PlantId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBoughtOutPartListBySupplierAndPlant}/${supplierId}/${PlantId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_BOP_LIST_SUCCESS,
          payload: response.data.DataList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
    });
  };
}

/**
 * @method addCostingBoughtOutPart
 * @description add bought out part to costing
 */
export function addCostingBoughtOutPart(data, callback) {
  return (dispatch) => {
    // dispatch({
    //     type:  API_REQUEST,
    // });
    const request = axios.post(API.addCostingBoughtOutPart, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: ADD_BOP_COSTING_SUCCESS,
          payload: response.data.Data
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getOtherOperationList(supplierId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOtherOperationList}/${supplierId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_OTHER_OPERATION_LIST_SUCCESS,
          payload: response.data.DataList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
    });
  };
}

/**
 * @method getCostingOtherOperation
 * @description add other operation to costing
 */
export function getCostingOtherOperation(costingId, callback) {
  return (dispatch) => {
    // dispatch({
    //     type:  API_REQUEST,
    // });
    const request = axios.get(`${API.getCostingOtherOperation}/${costingId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: ADD_OTHER_OPERATION_COSTING_SUCCESS,
          payload: response.data.Data
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method addCostingUnitOtherOperationData
 * @description add unit other operation to costing
 */
export function addCostingUnitOtherOperationData(data, selectedIndex, callback) {
  return (dispatch) => {
    dispatch({
      type: ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
      payload: data,
      selectedIndex: selectedIndex
    });
    callback();
  }
}


/**
 * @method getBoughtOutPartList
 * @description get all BOP list
 */
export function getMHRCostingList(supplierId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getMHRCostingList}/${supplierId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_MHR_LIST_SUCCESS,
          payload: response.data.DataList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
    });
  };
}

/**
 * @method addCostingUnitOtherOperationData
 * @description add unit other operation to costing
 */
export function addMHRForProcess(data, callback) {
  return (dispatch) => {
    dispatch({
      type: ADD_MHR_FOR_PROCESS_GRID_DATA,
      payload: data,
    });
    callback();
  }
}

/**
 * @method getProcessesSelectList
 * @description Get Processes select list in process grid
 */
export function getProcessesSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getProcessesSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PROCESSES_LIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}


/**
 * @method saveProcessCosting
 * @description save Process Costing
 */
export function saveProcessCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveProcessCosting, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SAVE_PROCESS_COSTING_SUCCESS,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method getCostingProcesses
 * @description add process to costing
 */
export function getCostingProcesses(costingId, callback) {
  return (dispatch) => {
    // dispatch({
    //     type:  API_REQUEST,
    // });
    const request = axios.get(`${API.getCostingProcesses}/${costingId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: ADD_PROCESS_COSTING_SUCCESS,
          payload: response.data.Data
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method getCostingBOP
 * @description add process to costing
 */
export function getCostingBOP(costingId, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getCostingBOP}/${costingId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: ADD_BOP_GRID_COSTING_SUCCESS,
          payload: response.data.Data
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
 * @method saveBOPCosting
 * @description save Process Costing
 */
export function saveBOPCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveBOPCosting, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SAVE_BOP_COSTING_SUCCESS,
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
 * @method getOtherOpsSelectList
 * @description Get Processes select list in process grid
 */
export function getOtherOpsSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOtherOpsSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_OTHER_OPERATION_SELECT_LIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveOtherOpsCosting
 * @description save Other operation Costing
 */
export function saveOtherOpsCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveOtherOpsCosting, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SAVE_OTHER_OPERATION_COSTING_SUCCESS,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method setCostingDetailRowData
 * @description fetch UOM and material type list
 */
export function setCostingDetailRowData(data, selectedIndex) {
  return (dispatch) => {
    dispatch({
      type: SET_COSTING_DETAIL_ROW_DATA,
      payload: data,
      //selectedIndex: selectedIndex,
    });
  };
}

/**
 * @method updateBOPAPI
 * @description update BOP
 */
export function updateCostingOtherOperation(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.put(`${API.updateCostingOtherOperation}`, requestData, config())
      .then((response) => {
        dispatch({ type: UPDATE_COSTING_OTHER_OPERATION_SUCCESS });
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method saveCostingAsDraft
 * @description save Costing as draft
 */
export function saveCostingAsDraft(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveCostingAsDraft, data, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: SAVE_COSTING_AS_DRAFT_SUCCESS,
        });
        callback(response);
      } else {
        dispatch({ type: API_FAILURE });
        if (response.data.Message) {
          Toaster.error(response.data.Message);
        }
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
 * @method getCostingBulkUploadList
 * @description Get list of all costing sheet which is send for bulkupload
*/

export function getCostingBulkUploadList(callback) {

  return (dispatch) => {

    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingBulkUploadList}`, config());
    request.then((response) => {

      if (response.data.Result) {
        dispatch({
          type: GET_BULKUPLOAD_COSTING_LIST,
          payload: response.data.DataList,
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


export function generateReport(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.generateReport}`, config());
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

export function getErrorFile(costingId, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getErrorFile}/${costingId}`, config());
    request.then((response) => {
      if (response.status.Result) {
        // dispatch()
        callback(response)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE })
    })
  }
}

/**
 * @method bulkUploadCosting
 * @description Costing Bulk Upload (SHEET METAL)
*/

export function bulkUploadCosting(data, costingVersion, callback) {

  return (dispatch) => {
    let request;
    if (costingVersion === 'V2' || costingVersion === 'V4') {  // BULK UPLOAD NEW COSTING
      request = axios.post(API.uploadCosting, data, config());
    } else if (costingVersion === 'V3') { //  BULK UPLOAD COSTING FOR SHEET METAL
      request = axios.post(API.uploadSheetMetal, data, config());
    } else {  // BULK UPLOAD OLD COSTING
      request = axios.post(API.uploadOldCosting, data, config());
    }
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}



/**
 * @method sendForApprovalFromBulkUpload
 * @description Send for Approval or Reject
*/

export function sendForApprovalFromBulkUpload(data, callback) {
  return (dispatch) => {
    const request = axios.put(API.sendStatusForApproval, data, config());
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}


/**
 * @method saveProcessCostCalculationData
 * @description Save Process Cost Calculation Data
 */
export function saveProcessCostCalculationData(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveProcessCostCalculation, data, config())
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


export function saveMachiningProcessCostCalculationData(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.saveMachiningProcessCostCalculation, data, config())
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
 * @method saveDefaultProcessCostCalculationData
 * @description Save Process Cost Calculation Data
 */
export function saveDefaultProcessCostCalculationData(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveDefaultProcessCostCalculation, data, config())
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

export function getProcessMachiningCalculation(processCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `&weightCalculationId=${processCalculationId ? processCalculationId : 0}`
    const request = axios.get(`${API.getProcessMachiningCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        // dispatch({
        //   type: GET_RAW_MATERIAL_CALCI_INFO,
        //   payload: response.data.Data,
        // });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}


export function getProcessDefaultCalculation(processCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `weightCalculationId=${processCalculationId ? processCalculationId : 0}`
    const request = axios.get(`${API.getProcessDefaultCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method bulkUploadCosting
 * @description Costing Bulk Upload
*/

export function plasticBulkUploadCosting(data, costingVersion, callback) {

  return (dispatch) => {

    let request;
    if (costingVersion === 'V2' || costingVersion === 'V4') {  // BULK UPLOAD NEW COSTING
      request = axios.post(API.uploadPlasticCosting, data, config());
    } else {  // BULK UPLOAD OLD COSTING
      request = axios.post(API.uploadPlasticOldCosting, data, config());
    }
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}

export function machiningBulkUploadCosting(data, costingVersion, callback) {

  return (dispatch) => {

    let request;
    if (costingVersion === 'V2' || costingVersion === 'V4') {  // BULK UPLOAD NEW COSTING
      request = axios.post(API.uploadMachiningCosting, data, config());
    } else {  // BULK UPLOAD OLD COSTING
      request = axios.post(API.uploadMachiningOldCosting, data, config());
    }
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}


export function corrugatedBoxBulkUploadCosting(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.uploadCorrugatedBoxCosting, data, config());
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}

export function assemblyBulkUploadCosting(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.uploadAssemblyCosting, data, config());
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}



export function setFerrousCalculatorReset(data) {
  return (dispatch) => {
    dispatch({
      type: FERROUS_CALCULATOR_RESET,
      payload: data,
    })
  }
}


export function getSimulationRmFerrousCastingCalculation(simulationId, costingId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `simulationId=${simulationId}&costingId=${costingId ? costingId : "0"}`
    const request = axios.get(`${API.getSimulationRmFerrousCastingCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

export function getSimulationRmRubberCalculation(simulationId, costingId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `simulationId=${simulationId}&costingId=${costingId ? costingId : "0"}`
    const request = axios.get(`${API.getSimulationRmRubberCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}


export function saveRawMaterialCalculationForRubberCompound(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForRubberCompound, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}


export function wiringHarnessBulkUploadCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.uploadWiringHarnessCosting, data, config());
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  };
}

export function diecastingBulkUploadCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.uploadDiecastingCosting, data, config());
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      if (error?.response?.status === 400) {
        callback(error.response)
      }
      apiErrors(error);
    });
  }
}
/**
 * @method getRawMaterialCalculationForMachining
 * @description Get raw materical calculator data for Machining
*/
export function getRawMaterialCalculationForMachining(costingId, rawMaterialId, weightCalculationId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForMachining}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method saveRawMaterialCalculationForMachining
 * @description save raw materical calculator data for Machining
*/
export function saveRawMaterialCalculationForMachining(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForMachining, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}
export function getSimulationRmMachiningCalculation(simulationId, costingId, rawMaterialId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `simulationId=${simulationId}&costingId=${costingId ? costingId : "0"}&rawMaterialId=${rawMaterialId}`
    const request = axios.get(`${API.getSimulationRmMachiningCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}
export function getSimulationCorrugatedAndMonoCartonCalculation(simulationId, costingId, rawMaterialId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `simulationId=${simulationId}&costingId=${costingId ? costingId : "0"}&rawMaterialId=${rawMaterialId}`
    const request = axios.get(`${API.getSimulationCorrugatedAndMonoCartonCalculation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}


/**
 * @method saveRawMaterialCalculationForInsulation
 * @description Save raw material calculator data for Insulation
 */
export function saveRawMaterialCalculationForInsulation(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalculationForInsulation, data, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error);
    });
  };
}

/**
 * @method getRawMaterialCalculationForInsulation
 * @description Get raw material calculator data for Insulation
 */
export function getRawMaterialCalculationForInsulation(costingId, rawMaterialId, weightCalculationId, callback) {

  return (dispatch) => {
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "0"}`
    const request = axios.get(`${API.getRawMaterialCalculationForInsulation}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}