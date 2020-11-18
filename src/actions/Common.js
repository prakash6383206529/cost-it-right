
import axios from 'axios';
import {
  API,
  API_REQUEST,
  API_FAILURE,
  GET_UOM_DATA_SUCCESS,
  GET_MATERIAL_TYPE_SUCCESS,
  GET_PART_SUCCESS,
  FETCH_MATER_DATA_FAILURE,
  GET_COUNTRY_SUCCESS,
  GET_STATE_SUCCESS,
  GET_CITY_SUCCESS,
  GET_PLANT_SUCCESS,
  GET_RAW_MATERIAL_SUCCESS,
  GET_GRADE_SUCCESS,
  GET_SUPPLIER_SUCCESS,
  GET_TECHNOLOGY_SUCCESS,
  GET_CATEGORY_TYPE_SUCCESS,
  GET_CATEGORY_SUCCESS,
  GET_OTHER_OPERATION_FORMDATA_SUCCESS,
  GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
  GET_MHR_COMBO_DATA_SUCCESS,
  DATA_FAILURE,
  GET_RM_SPECIFICATION_LIST_SUCCESS,
  GET_LABOUR_TYPE_SUCCESS,
  GET_COSTING_HEAD_SUCCESS,
  GET_MODEL_TYPE_SUCCESS,
  GET_PLANTS_BY_SUPPLIER,
  GET_PLANTS_BY_CITY,
  GET_CITY_BY_SUPPLIER,
  GET_LABOUR_TYPE_SELECTLIST_SUCCESS,
  GET_POWER_TYPE_SELECTLIST_SUCCESS,
  GET_CHARGE_TYPE_SELECTLIST_SUCCESS,
  GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS,
  GET_UOM_SELECTLIST_SUCCESS,
  GET_MACHINE_TYPE_SELECTLIST_SUCCESS,
  GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS,
  GET_SHIFT_TYPE_SELECTLIST_SUCCESS,
  GET_DEPRECIATION_SELECTLIST_SUCCESS,
  GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS,
  GET_PLANTS_BY_SUPPLIER_AND_CITY,
  GET_SUPPLIER_SELECTLIST_SUCCESS,
  GET_CURRENCY_SELECTLIST_SUCCESS,
  GET_TECHNOLOGY_SELECTLIST_SUCCESS,
  GET_PLANT_SELECTLIST_SUCCESS,
  GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST,
  GET_PLANT_SELECTLIST_BY_TYPE,
  GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
  GET_UOM_SELECTLIST_BY_UNITTYPE,
  config,
} from '../config/constants';
import { apiErrors } from '../helper/util';
import { MESSAGES } from '../config/message';
import { toastr } from 'react-redux-toastr'

const headers = config;

/**
 * @method fetchCountryDataAPI
 * @description Used to fetch country list
 */
export function fetchCountryDataAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCountry}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COUNTRY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchStateDataAPI
 * @description Used to fetch state list
 */
export function fetchStateDataAPI(countryId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (countryId === 0) {
      dispatch({
        type: GET_STATE_SUCCESS,
        payload: []
      });
      dispatch({
        type: GET_CITY_SUCCESS,
        payload: [],
      });
      callback([]);
    } else {
      const request = axios.get(`${API.getState}/${countryId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_STATE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          toastr.error(MESSAGES.SOME_ERROR);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }
  };
}

/**
 * @method fetchCityDataAPI
 * @description Used to fetch city list
 */
export function fetchCityDataAPI(stateId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (stateId === 0) {
      dispatch({
        type: GET_CITY_SUCCESS,
        payload: [],
      });
      callback([]);
    } else {
      const request = axios.get(`${API.getCity}/${stateId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_CITY_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }
  };
}

/**
 * @method fetchPlantDataAPI
 * @description Used to fetch plant list
 */
export function fetchPlantDataAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlant}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getRawMaterialSelectList
 * @description Used to fetch row material list
 */
export function getRawMaterialSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRawMaterialSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_RAW_MATERIAL_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchRMGradeAPI
 * @description Used to fetch row material grade list
 */
export function fetchRMGradeAPI(Id, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (Id === 0) {
      dispatch({
        type: GET_GRADE_SUCCESS,
        payload: []
      });
    } else {
      const request = axios.get(`${API.getRowGrade}/${Id}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_GRADE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          toastr.error(MESSAGES.SOME_ERROR);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }
  };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function fetchRMCategoryAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRawMaterialSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_RAW_MATERIAL_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function fetchCategoryAPI(Id, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (Id === 0) {
      dispatch({
        type: GET_CATEGORY_SUCCESS,
        payload: []
      });
    }
    else {
      const request = axios.get(`${API.getCategory}/${Id}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_CATEGORY_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          toastr.error(MESSAGES.SOME_ERROR);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }

  };
}

//COMBO API"S


export function getOtherOperationData(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getOtherOperationsFormDataAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_OTHER_OPERATION_FORMDATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchRMCategoryAPI
 * @description Used to fetch row material category list
 */
export function getCEDOtherOperationComboData(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCEDotherOperationsComboDataAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchPartComboAPI
 * @description Used to part form 
 */
export function fetchPartComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPartComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_UOM_DATA_SUCCESS,
          payload: response.data.DynamicData.UnitOfMeasurements,
        });
        dispatch({
          type: GET_MATERIAL_TYPE_SUCCESS,
          payload: response.data.DynamicData.MaterialTypes,
        });
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.DynamicData.Plants,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchPartComboAPI
 * @description Used to BOP form 
 */
export function fetchBOPComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_TECHNOLOGY_SUCCESS,
          payload: response.data.DynamicData.Technologies,
        });
        dispatch({
          type: GET_CATEGORY_TYPE_SUCCESS,
          payload: response.data.DynamicData.CategoryTypes,
        });
        dispatch({
          type: GET_CATEGORY_SUCCESS,
          payload: response.data.DynamicData.Categories,
        });
        dispatch({
          type: GET_PART_SUCCESS,
          payload: response.data.DynamicData.Parts,
        });
        dispatch({
          type: GET_MATERIAL_TYPE_SUCCESS,
          payload: response.data.DynamicData.MaterialTypes,
        });
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.DynamicData.Plants,
        });
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.DynamicData.Cities,
        });
        dispatch({
          type: GET_SUPPLIER_SUCCESS,
          payload: response.data.DynamicData.Suppliers,
        });
        dispatch({
          type: GET_UOM_DATA_SUCCESS,
          payload: response.data.DynamicData.UnitOfMeasurements,
        });
        callback(response);
      }
      // else {
      //     toastr.error(MESSAGES.SOME_ERROR);
      // }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchBOMComboAPI
 * @description Used to BOM form 
 */
export function fetchBOMComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOMComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PART_SUCCESS,
          payload: response.data.DynamicData.Parts,
        });
        dispatch({
          type: GET_MATERIAL_TYPE_SUCCESS,
          payload: response.data.DynamicData.MaterialTypes,
        });
        dispatch({
          type: GET_UOM_DATA_SUCCESS,
          payload: response.data.DynamicData.UnitOfMeasurements,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchMaterialComboAPI
 * @description Used to BOM form 
 */
export function fetchMaterialComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRMComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_TECHNOLOGY_SUCCESS,
          payload: response.data.DynamicData.Technologies,
        });
        dispatch({
          type: GET_RAW_MATERIAL_SUCCESS,
          payload: response.data.DynamicData.RawMaterials,
        });
        dispatch({
          type: GET_GRADE_SUCCESS,
          payload: response.data.DynamicData.RawMaterialGrades,
        });
        dispatch({
          type: GET_RM_SPECIFICATION_LIST_SUCCESS,
          payload: response.data.DynamicData.RawMaterialSpecifications,
        });
        dispatch({
          type: GET_CATEGORY_SUCCESS,
          payload: response.data.DynamicData.RawMaterialCategories,
        });
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.DynamicData.Cities,
        });
        dispatch({
          type: GET_SUPPLIER_SUCCESS,
          payload: response.data.DynamicData.Suppliers,
        });
        dispatch({
          type: GET_UOM_DATA_SUCCESS,
          payload: response.data.DynamicData.UnitOfMeasurements,
        });
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.DynamicData.Plants,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchGradeDataAPI
 * @description Used to fetch state list
 */
export function fetchGradeDataAPI(rowMaterialId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (rowMaterialId === 0) {
      dispatch({
        type: GET_GRADE_SUCCESS,
        payload: []
      });
      dispatch({
        type: GET_RM_SPECIFICATION_LIST_SUCCESS,
        payload: [],
      });
      callback([]);
    } else {
      const request = axios.get(`${API.getRowGrade}/${rowMaterialId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_GRADE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          toastr.error(MESSAGES.SOME_ERROR);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }
  };
}

/**
 * @method fetchSpecificationDataAPI
 * @description Used to fetch city list
 */
export function fetchSpecificationDataAPI(rmGradeId, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (rmGradeId === 0) {
      dispatch({
        type: GET_RM_SPECIFICATION_LIST_SUCCESS,
        payload: [],
      });
      callback([]);
    } else {
      const request = axios.get(`${API.getRowMaterialSpecification}/${rmGradeId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_RM_SPECIFICATION_LIST_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          toastr.error(MESSAGES.SOME_ERROR);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    }
  };
}

/**
 * @method fetchFreightComboAPI
 * @description Used in freight form 
 */
export function fetchFreightComboAPI(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getFreightComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.DynamicData.Cities,
        });
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.DynamicData.Plants,
        });
        dispatch({
          type: GET_SUPPLIER_SUCCESS,
          payload: response.data.DynamicData.Suppliers,
        });
        dispatch({
          type: GET_COSTING_HEAD_SUCCESS,
          payload: response.data.DynamicData.CostingHeads,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchLabourComboAPI
 * @description Used in labour form 
 */
export function fetchLabourComboAPI(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getLabourComboAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_TECHNOLOGY_SUCCESS,
          payload: response.data.DynamicData.Technologies,
        });
        dispatch({
          type: GET_LABOUR_TYPE_SUCCESS,
          payload: response.data.DynamicData.LabourTypes,
        });
        dispatch({
          type: GET_PLANT_SUCCESS,
          payload: response.data.DynamicData.Plants,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}


/*
* @method fetchRMCategoryAPI
* @description Used to fetch row material category list
*/
export function getMHRMasterComboData(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getMHRComboDataAPI}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_MHR_COMBO_DATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: DATA_FAILURE });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchCityDataAPI
 * @description Used to fetch city list
 */
export function fetchSupplierCityDataAPI(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSupplierCity}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function fetchCostingHeadsAPI(costingHeads, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingHeads}?text=${costingHeads}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COSTING_HEAD_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
* @method getSupplierList
* @description Used to get select list of Vendor's
*/
export function getSupplierList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSupplierLists}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SUPPLIER_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function fetchModelTypeAPI(modelTypeHeading, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getModelTypes}?text=${modelTypeHeading}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_MODEL_TYPE_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method fetchCostingHeadsAPI
 * @description Used to fetch costing heads
 */
export function getPlantBySupplier(supplierId, callback) {
  return (dispatch) => {
    if (supplierId !== '') {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getPlantBySupplier}/${supplierId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_PLANTS_BY_SUPPLIER,
            payload: response.data.SelectList,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_PLANTS_BY_SUPPLIER,
        payload: [],
      });
      callback();
    }
  };
}

/**
 * @method getCityBySupplier
 * @description Used to fetch city by Supplier
 */
export function getCityBySupplier(SupplierId, callback) {
  return (dispatch) => {
    if (SupplierId !== 0) {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getCityBySupplier}/${SupplierId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_CITY_BY_SUPPLIER,
            payload: response.data.SelectList,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_CITY_BY_SUPPLIER,
        payload: [],
      });
      callback();
    }
  };
}

/**
 * @method getPlantByCity
 * @description Used to getPlantByCity
 */
export function getPlantByCity(CityId, callback) {
  return (dispatch) => {
    if (CityId !== 0) {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getPlantByCity}/${CityId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_PLANTS_BY_CITY,
            payload: response.data.SelectList,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: FETCH_MATER_DATA_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_PLANTS_BY_CITY,
        payload: {},
      });
      callback();
    }
  };
}

/**
 * @method getPlantByCityAndSupplier
 * @description Used to getPlantByCityAndSupplier
 */
export function getPlantByCityAndSupplier(SupplierID, CityId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlantByCityAndSupplier}/${SupplierID}/${CityId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANTS_BY_SUPPLIER_AND_CITY,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getLabourTypeSelectList
 * @description Used to fetch Labour type selectlist
 */
export function getLabourTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getLabourTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_LABOUR_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getPowerTypeSelectList
 * @description Used to fetch Power type selectlist
 */
export function getPowerTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPowerTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_POWER_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getChargeTypeSelectList
 * @description Used to fetch Charge type selectlist
 */
export function getChargeTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getChargeTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CHARGE_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getPowerSupplierTypeSelectList
 * @description Used to fetch Power Supplier type selectlist
 */
export function getPowerSupplierTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPowerSupplierTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        toastr.error(MESSAGES.SOME_ERROR);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getUOMSelectList
 * @description Used to fetch Power Supplier type selectlist
 */
export function getUOMSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getUOMSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_UOM_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getMachineTypeSelectList
 * @description Used to fetch Machine type selectlist
 */
export function getMachineTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getMachineTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_MACHINE_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getDepreciationTypeSelectList
 * @description Used to fetch Depreciation type selectlist //used in Depreciation master
 */
export function getDepreciationTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getDepreciationTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_DEPRECIATION_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getDepreciationSelectList
 * @description Used to fetch Depreciation selectlist //Used in machine master
 */
export function getDepreciationSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getDepreciationSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_DEPRECIATION_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getShiftTypeSelectList
 * @description Used to GET SHIFT TYPE selectlist
 */
export function getShiftTypeSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getShiftTypeSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SHIFT_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getMachineSelectListByMachineType
 * @description Used to fetch Machine selectlist by Machine type(Class)
 */
export function getMachineSelectListByMachineType(MachineClassId, callback) {
  return (dispatch) => {
    if (MachineClassId !== '') {
      //dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getMachineSelectListByMachineType}/${MachineClassId}`, headers);
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE, });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_MACHINE_SELECTLIST_BY_MACHINE_TYPE_SUCCESS,
        payload: [],
      });
      callback();
    }
  };
}


/**
* @method getCurrencySelectList
* @description Used to get select list of Vendor's
*/
export function getCurrencySelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCurrencySelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CURRENCY_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

/**
* @method getTechnologySelectList
* @description Used to get select list of Vendor's
*/
export function getTechnologySelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getTechnologySelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_TECHNOLOGY_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

/**
* @method getPlantSelectList
* @description Used to get select list of Vendor's
*/
export function getPlantSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlantSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANT_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

/**
* @method getVendorPlantSelectList
* @description Used to get Un Associated vendor platn list
*/
export function getVendorPlantSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getVendorPlantSelectList}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_UNASSOCIATED_VENDOR_PLANT_SELECTLIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}


/**
 * @method getAllCities
 * @description Used to GET ALL CITIES LIST
 */
export function getAllCities(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getAllCities}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getCityByCountry
 * @description Used to GET ALL CITIES BY COUNTRY
 */
export function getCityByCountry(CountryId, StateId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCityByCountry}/${CountryId}/${StateId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getRawMaterialCategory
 * @description Used to GET ALL RM CATEGORY LIST
 */
export function getRawMaterialCategory(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRawMaterialCategory}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CATEGORY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}

/**
* @method getPlantSelectListByType
* @description GET PLANT LIST BY ZBC, VBC
*/
export function getPlantSelectListByType(TYPE, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlantSelectListByType}?type=${TYPE}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANT_SELECTLIST_BY_TYPE,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

/**
 * @method getVendorWithVendorCodeSelectList
 * @description GET VBC VENDOR WITH VENDOR CODE SELECTLIST
 */
export function getVendorWithVendorCodeSelectList() {
  return (dispatch) => {
    const request = axios.get(API.getVendorWithVendorCodeSelectList, headers);
    request.then((response) => {
      dispatch({
        type: GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
        payload: response.data.SelectList,
      });
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
    });
  };
}

/**
 * @method getUOMListByUnitType
 * @description UOM SELECT LIST BY UNIT TYPE
 */
export function getUOMListByUnitType(UnitTypeId, callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getUOMListByUnitType}/${UnitTypeId}`, headers);
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_UOM_SELECTLIST_BY_UNITTYPE,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    });
  };
}