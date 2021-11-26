import axios from 'axios';
import {
  API, API_REQUEST, API_FAILURE, GET_WEIGHT_CALC_INFO_SUCCESS, CREATE_WEIGHT_CALC_COSTING_SUCCESS, UPDATE_WEIGHT_CALC_SUCCESS, GET_WEIGHT_CALC_LAYOUT_SUCCESS,
  GET_COSTING_BY_SUPPLIER_SUCCESS, GET_RM_LIST_BY_SUPPLIER_SUCCESS, ADD_RAW_MATERIAL_COSTING_SUCCESS, CREATE_SHEETMETAL_COSTING_SUCCESS, GET_COSTING_DATA_SUCCESS,
  UPDATE_COSTING_RM_SUCCESS, GET_BOP_LIST_SUCCESS, ADD_BOP_COSTING_SUCCESS, GET_OTHER_OPERATION_LIST_SUCCESS, ADD_OTHER_OPERATION_COSTING_SUCCESS, ADD_UNIT_OTHER_OPERATION_COSTING_DATA,
  GET_MHR_LIST_SUCCESS, ADD_MHR_FOR_PROCESS_GRID_DATA, GET_PROCESSES_LIST_SUCCESS, SAVE_PROCESS_COSTING_SUCCESS, GET_OTHER_OPERATION_SELECT_LIST_SUCCESS, SAVE_OTHER_OPERATION_COSTING_SUCCESS,
  ADD_PROCESS_COSTING_SUCCESS, SET_COSTING_DETAIL_ROW_DATA, UPDATE_COSTING_OTHER_OPERATION_SUCCESS, SAVE_COSTING_AS_DRAFT_SUCCESS, ADD_BOP_GRID_COSTING_SUCCESS,
  SAVE_BOP_COSTING_SUCCESS, GET_RAW_MATERIAL_CALCI_INFO, GET_BULKUPLOAD_COSTING_LIST, config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';

const headers = config

/**
 * @method getWeightCalculationCosting
 * @description Get Weight Calculation Costing details
 */
export function getWeightCalculationCosting(CostingId = '', callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getWeightCalculationInfo}/${CostingId}`, headers);
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
    const request = axios.get(`${API.getWeightCalculationLayoutType}`, headers);
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
 * @method createWeightCalculationCosting
 * @description Create Weight Calculation Costing
 */
export function createWeightCalculationCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.AddCostingWeightCalculation, data, headers);
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
    axios.put(`${API.UpdateCostingWeightCalculation}`, requestData, headers)
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
    const request = axios.get(`${API.getCostingBySupplier}?supplierId=${reqData.supplierId}&partId=${reqData.partId}&loggedInUserId=${reqData.loggedInUserId}`, headers);
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
    const request = axios.get(`${API.getRawMaterialListBySupplierId}/${supplierId}`, headers);
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
    const request = axios.post(API.createNewCosting, data, headers);
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
    const request = axios.post(API.addCostingRawMaterial, data, headers);
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
      axios.get(`${API.getCostingDetailsById}/${costingId}`, headers)
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
    axios.put(`${API.updateCostingRawMatrial}`, requestData, headers)
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
    const request = axios.get(`${API.getBoughtOutPartListBySupplierAndPlant}/${supplierId}/${PlantId}`, headers);
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
    const request = axios.post(API.addCostingBoughtOutPart, data, headers);
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
    const request = axios.get(`${API.getOtherOperationList}/${supplierId}`, headers);
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
    const request = axios.get(`${API.getCostingOtherOperation}/${costingId}`, headers);
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
    const request = axios.get(`${API.getMHRCostingList}/${supplierId}`, headers);
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
    const request = axios.get(`${API.getProcessesSelectList}`, headers);
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
    const request = axios.post(API.saveProcessCosting, data, headers);
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
    const request = axios.get(`${API.getCostingProcesses}/${costingId}`, headers);
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
    const request = axios.get(`${API.getCostingBOP}/${costingId}`, headers);
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
      //apiErrors(error);
    });
  };
}


/**
 * @method saveBOPCosting
 * @description save Process Costing
 */
export function saveBOPCosting(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveBOPCosting, data, headers);
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
    const request = axios.get(`${API.getOtherOpsSelectList}`, headers);
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
    const request = axios.post(API.saveOtherOpsCosting, data, headers);
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
    axios.put(`${API.updateCostingOtherOperation}`, requestData, headers)
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
    const request = axios.post(API.saveCostingAsDraft, data, headers);
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
 * @method getRawMaterialCalculationByTechnology
 * @description Get raw materical calculator data by technology
*/

export function getRawMaterialCalculationByTechnology(costingId, rawMaterialId, weightCalculationId, technologyId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&rawMaterialId=${rawMaterialId}&weightCalculationId=${weightCalculationId ? weightCalculationId : "00000000-0000-0000-0000-000000000000"}&technologyId=${technologyId}`
    const request = axios.get(`${API.getRawMaterialCalculationByTechnology}?${queryParams}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_RAW_MATERIAL_CALCI_INFO,
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


export function saveRawMaterialCalciData(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveRawMaterialCalciData, data, headers);
    request.then((response) => {
      if (response.data.Result) {
        // dispatch({
        //   type: SAVE_COSTING_AS_DRAFT_SUCCESS,
        // });
        callback(response);
      }
    }).catch((error) => {
      dispatch({
        type: API_FAILURE
      });
      apiErrors(error);
    });
  }
}

/**
 * @method getCostingBulkUploadList
 * @description Get list of all costing sheet which is send for bulkupload
*/

export function getCostingBulkUploadList(callback) {
  // let JSON = {
  //   status: 200,
  //   data: {
  //     DataList: [
  //       {
  //         CostingStatus: 'In Progress',
  //         NoOfCorrectRow: 0,
  //         NoOfIncorrectRow: 0,
  //         FileNameId: 1,
  //         FileName: 'BulkUpload1',

  //       },
  //       {
  //         CostingStatus: 'Pending For Approval',
  //         NoOfCorrectRow: 5,
  //         NoOfIncorrectRow: 2,
  //         FileNameId: 2,
  //         FileName: 'BulkUpload2',

  //       },
  //       {
  //         CostingStatus: 'Approved',
  //         NoOfCorrectRow: 2,
  //         NoOfIncorrectRow: 1,
  //         FileNameId: 3,
  //         FileName: 'BulkUpload3',

  //       },
  //       {
  //         CostingStatus: 'Error',
  //         NoOfCorrectRow: 3,
  //         NoOfIncorrectRow: 1,
  //         FileNameId: 4,
  //         FileName: 'BulkUpload4',

  //       },
  //     ],
  //   },
  // }


  return (dispatch) => {

    // dispatch({
    //   type: GET_BULKUPLOAD_COSTING_LIST,
    //   payload: JSON.data.DataList,
    // });
    // callback(JSON);
    // callback(JSON)
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingBulkUploadList}`, headers);
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

export function getErrorFile(costingId, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getErrorFile}/${costingId}`, headers);
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

export function bulkUploadCosting(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.uploadCosting, data, headers);
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}



/**
 * @method sendForApprovalFromBulkUpload
 * @description Send for Approval or Reject
*/

export function sendForApprovalFromBulkUpload(data, callback) {
  return (dispatch) => {
    const request = axios.put(API.sendStatusForApproval, data, headers);
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}


/**
 * @method saveProcessCostCalculationData
 * @description Save Process Cost Calculation Data
 */
export function saveProcessCostCalculationData(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveProcessCostCalculation, data, headers)
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
 * @method getRawMaterialCalculationByTechnology
 * @description Get raw materical calculator data by technology
*/

export function getProcessCalculation(costingId, processId, processCalculationId, technologyId, processType, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${costingId}&processId=${processId}&processCalculationId=${processCalculationId ? processCalculationId : "00000000-0000-0000-0000-000000000000"}&technologyId=${technologyId}&processType=${processType}`
    const request = axios.get(`${API.getProcessCalculation}?${queryParams}`, headers);
    request.then((response) => {
      if (response.data.Result) {
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
      // apiErrors(error);
    });
  };
}

/**
 * @method bulkUploadCosting
 * @description Costing Bulk Upload
*/

export function plasticBulkUploadCosting(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.uploadPlasticCosting, data, headers);
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}

export function machiningBulkUploadCosting(data, callback) {

  return (dispatch) => {
    const request = axios.post(API.uploadMachiningCosting, data, headers);
    request.then((response) => {
      if (response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      //apiErrors(error);
    });
  };
}