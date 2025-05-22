
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
  GET_ICC_APPLICABILITY_SELECTLIST,
  GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
  STATUS_COLUMN_DATA,
  IS_RESET,
  config,
  GET_GRID_HEIGHT,
  GET_STATE_WHILE_DOWNLOADING,
  GET_REPORTER_LIST,
  GET_APPROVAL_TYPE_SELECT_LIST,
  GET_DATA_WHILE_LOADING,
  GET_DATA_FROM_REPORT,
  TOUR_START_DATA,
  GET_APPROVAL_MODULE_SELECT_LIST,
  GET_APPROVAL_TYPE_SELECT_LIST_COSTING,
  GET_APPROVAL_TYPE_SELECT_LIST_SIMULATION,
  GET_APPROVAL_TYPE_SELECT_LIST_MASTER,
  GET_APPROVAL_TYPE_SELECT_LIST_ONBOARDING,
  GET_RM_EXCHANGE_RATE_SOURCE,
  GET_COST_FREQUENCY_SETTLEMENT,
  GET_COMMODITY_INDEX_RATE_AVERAGE,
  COSTING_LEVEL,
  SIMULATION_LEVEL,
  MASTER_LEVEL,
  ONBOARDING_MANAGEMENT_LEVEL,
  GET_TAX_CODE_SELECTLIST,
  SET_COSTING_HEAD_FILTER,
  IS_RESET_COSTING_HEAD,
  SET_LIST_TOGGLE,
  GET_APPLICABILITY_LIST_SUCCESS,
  GET_SEGMENT_SELECTLIST,
  GET_GROUP_CODE_SELECTLIST
} from '../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../helper/util';
import { MESSAGES } from '../config/message';
import Toaster from '../components/common/Toaster';
import axiosInstance from '../utils/axiosInstance';
import { loggedInUserId } from '../helper';
import { useDispatch } from 'react-redux';
import { useQuery, useQueryClient } from 'react-query';
import { getAllRMDataList, getMaterialTypeDataListAPI, getRMSpecificationDataList } from '../components/masters/actions/Material';
import { getBOPDataList } from '../components/masters/actions/BoughtOutParts';
import { useMemo } from 'react';

// const config() = config;

/**
 * @method fetchCountryDataAPI
 * @description Used to fetch country list
 */
export function fetchCountryDataAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCountry}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_COUNTRY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
      const request = axios.get(`${API.getState}/${countryId}`, config());
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_STATE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          Toaster.error(MESSAGES.SOME_ERROR);
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
      const request = axios.get(`${API.getCity}/${stateId}`, config());
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
    const request = axios.get(`${API.getPlant}`, config());
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
    const request = axios.get(`${API.getRawMaterialSelectList}`, config());
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
      const request = axios.get(`${API.getRowGrade}/${Id}`, config());
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_GRADE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getRawMaterialSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_RAW_MATERIAL_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    if (Id === 0) {
      dispatch({
        type: GET_CATEGORY_SUCCESS,
        payload: []
      });
    }
    else {
      const request = axios.get(`${API.getCategory}/${Id}/${loggedInUser?.loggedInUserId}`, config());
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_CATEGORY_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getOtherOperationsFormDataAPI}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_OTHER_OPERATION_FORMDATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getCEDotherOperationsComboDataAPI}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getPartComboAPI}`, config());
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
 * @method fetchPartComboAPI
 * @description Used to BOP form 
 */
export function fetchBOPComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPComboAPI}`, config());
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
      //     Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getBOMComboAPI}`, config());
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
 * @method fetchMaterialComboAPI
 * @description Used to BOM form 
 */
export function fetchMaterialComboAPI(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRMComboAPI}`, config());
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
      const request = axios.get(`${API.getRowGrade}/${rowMaterialId}`, config());
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_GRADE_SUCCESS,
            payload: response.data.SelectList,
          });
          callback(response);
        } else {
          Toaster.error(MESSAGES.SOME_ERROR);
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
      const request = axios.get(`${API.getRowMaterialSpecification}/${rmGradeId}`, config());
      request.then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_RM_SPECIFICATION_LIST_SUCCESS,
            payload: response.data.DataList,
          });
          callback(response);
        } else {
          Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getFreightComboAPI}`, config());
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
 * @method fetchLabourComboAPI
 * @description Used in labour form 
 */
export function fetchLabourComboAPI(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getLabourComboAPI}`, config());
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
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getMHRComboDataAPI}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_MHR_COMBO_DATA_SUCCESS,
          payload: response.data.DynamicData,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getSupplierCity}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
export function fetchCostingHeadsAPI(costingHeads, isAddOtherCostApplicability = false, isRequestForMultiTechnology = false, callback) {
  return (dispatch, getState) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingHeads}?applicabilityFor=${costingHeads}&isAddOtherCostApplicability=${isAddOtherCostApplicability}&isRequestForMultiTechnology=${isRequestForMultiTechnology}`, config());
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
 * @method fetchApplicabilityList
 * @description Used to fetch applicability list
 */
export function fetchApplicabilityList(costingConditionEntryTypeId=null, costingConditionTypeId, isRequestForMultiTechnology = false, callback) {
  return (dispatch, getState) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getApplicabilityList}?costingConditionEntryTypeId=${costingConditionEntryTypeId}&costingConditionTypeId=${costingConditionTypeId}&isRequestForMultiTechnology=${isRequestForMultiTechnology}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_APPLICABILITY_LIST_SUCCESS,
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
export function getSupplierList(vendorName, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSupplierLists}?vendorName=${vendorName}`, config());
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
    const request = axios.get(`${API.getModelTypes}?text=${modelTypeHeading}`, config());
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (supplierId !== '') {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getPlantBySupplier}/${supplierId}/${loggedInUser?.loggedInUserId}`, config());
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (SupplierId !== 0) {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getCityBySupplier}/${SupplierId}/${loggedInUser?.loggedInUserId}`, config());
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (CityId !== 0) {
      dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getPlantByCity}/${CityId}/${loggedInUser?.loggedInUserId}`, config());
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlantByCityAndSupplier}/${SupplierID}/${CityId}/${loggedInUser?.loggedInUserId}`, config());
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
    const request = axios.get(`${API.getLabourTypeSelectList}`, config());
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
    const request = axios.get(`${API.getPowerTypeSelectList}`, config());
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
    const request = axios.get(`${API.getChargeTypeSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_CHARGE_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getPowerSupplierTypeSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_POWER_SUPPLIER_TYPE_SELECTLIST_SUCCESS,
          payload: response.data.SelectList,
        });
        callback(response);
      } else {
        Toaster.error(MESSAGES.SOME_ERROR);
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
    const request = axios.get(`${API.getUOMSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_UOM_SELECTLIST_SUCCESS,
          payload: response.data.Data,
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
    const request = axios.get(`${API.getMachineTypeSelectList}`, config());
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
    const request = axios.get(`${API.getDepreciationTypeSelectList}`, config());
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
    const request = axios.get(`${API.getDepreciationSelectList}`, config());
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
    const request = axios.get(`${API.getShiftTypeSelectList}`, config());
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    if (MachineClassId !== '') {
      //dispatch({ type: API_REQUEST });
      const request = axios.get(`${API.getMachineSelectListByMachineType}/${MachineClassId}/${loggedInUser?.loggedInUserId}`, config());
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
    const request = axios.get(`${API.getCurrencySelectList}`, config());
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
    const request = axios.get(`${API.getTechnologySelectList}`, config());
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
* @method getVendorPlantSelectList
* @description Used to get Un Associated vendor platn list
*/
export function getVendorPlantSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getVendorPlantSelectList}`, config());
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
    const request = axios.get(`${API.getAllCities}`, config());
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


export function getCityByCountry(CountryId, StateId, CityName, callback) {
  return axios.get(`${API.getCityByCountry}?loggedInUserId=${loggedInUserId()}&countryId=${CountryId}&stateId=${StateId}&cityName=${CityName}`, config())
    .then((response) => {
      if (response.data.Result) {
        if (callback) callback(null, response);
        return response;
      }
    }).catch((error) => {
      apiErrors(error);
      if (callback) callback(error);
      throw error;
    });
}
// New action creator with dispatch for the soucre location in the class component
//kindly remove this action when all the files using this action are converted to functional component
export function getCityByCountryAction(CountryId, StateId, CityName) {
  return async (dispatch) => {
    try {
      const response = await getCityByCountry(CountryId, StateId, CityName);
      if (response.data.Result) {
        dispatch({
          type: GET_CITY_SUCCESS,
          payload: response.data.SelectList,
        });
      }
      return response;
    } catch (error) {
      dispatch({
        type: API_FAILURE,
        payload: error,
      });
      throw error;
    }
  };
}
/**
 * @method getRawMaterialCategory
 * @description Used to GET ALL RM CATEGORY LIST
 */
export function getRawMaterialCategory(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getRawMaterialCategory}`, config());
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
export function getPlantSelectListByType(TYPE, MODULE, nfrId, callback) {

  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPlantSelectListByType}?type=${TYPE}&departmentFilterAppliedForModule=${MODULE}&nfrId=${nfrId ? nfrId : ''}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANT_SELECTLIST_BY_TYPE,
          payload: response.data.DataList,
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
 * @method getSegmentSelectList
 * @description GET SEGMENT SELECT LIST
 */
export function getSegmentSelectList(callback) {

  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getSegmentSelectList}?loggedInUserId=${loggedInUserId()}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_SEGMENT_SELECTLIST,
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
 * @method getGroupCodeSelectList
 * @description GET GROUP CODE SELECT LIST
 */
export function getGroupCodeSelectList(partId,callback) {

  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getGroupCodeSelectList}?loggedInUserId=${loggedInUserId()}&partId=${partId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_GROUP_CODE_SELECTLIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      // apiErrors(error);
      
    });
  };
}

export function getVendorWithVendorCodeSelectList(vendorName, callback) {
  return axios.get(`${API.getVendorWithVendorCodeSelectList}?vendorName=${vendorName}`, config()).catch(error => {
    apiErrors(error);
    callback(error);
    return Promise.reject(error)
  });
}

export function getReporterList(callback) {
  return (dispatch) => {
    const request = axios.get(API.getReporterList, config());
    request.then((response) => {
      dispatch({
        type: GET_REPORTER_LIST,
        payload: response.data.SelectList,
      });
      callback(response)
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
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    const request = axios.get(`${API.getUOMListByUnitType}/${UnitTypeId}/${loggedInUser?.loggedInUserId}`, config());
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

/**
 * @method getICCAppliSelectList
 * @description GET ICC APPLICABILITY SELECTLIST
 */
export function getICCAppliSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getICCAppliSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_ICC_APPLICABILITY_SELECTLIST,
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
 * @method getPaymentTermsAppliSelectListKeyValue
 * @description GET PAYMENT TERMS APPLICABILITY SELECTLIST KEY VALUE
 */
export function getPaymentTermsAppliSelectListKeyValue(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPaymentTermsAppliSelectListKeyValue}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
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

export function getAllCity(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getCountry}`, config());
    request.then((response) => {
      if (response.data.Result) {
        let city
        const data = response.data.SelectList
        data && data.map(item => {
          if (item.Text === 'India') {
            city = item.Value
          } else {
            return false
          }
        })
        callback(city)
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE, });
      callback(error);
      apiErrors(error);
    })
  }
}

export function getPartSelectList(partNumber, callback) {
  return axios.get(`${API.getPartSelectLists}?partNumber=${partNumber}`, config()).catch(error => {
    apiErrors(error);
    callback(error);
    return Promise.reject(error)
  });
}

// costing head filter
export function setCostingHeadFilter(data, CostingHeadOptions) {
  return (dispatch) => {
    dispatch({
      type: SET_COSTING_HEAD_FILTER,
      payload: {
        data: data,
        CostingHeadOptions: CostingHeadOptions

      }
    });
  };
}

export function agGridStatus(data, id, arr = [], arrReports = []) {

  return (dispatch) => {
    dispatch({
      type: STATUS_COLUMN_DATA,
      payload: {
        data: data,
        id: id,
        arr: arr,
        arrReports: arrReports
      },
    })

  }
}


// FUNCTION TO CHECK IF RESET BUTTON IS CLICKED IN PAGINATION COMPONENT.
export function isResetClick(data, component) {
  return (dispatch) => {
    dispatch({
      type: IS_RESET,
      payload: { data: data, component: component },
    })

  }
}

// FUNCTION TO CHECK IF RESET BUTTON IS CLICKED IN PAGINATION COMPONENT.
export function setResetCostingHead(data, component) {
  return (dispatch) => {
    dispatch({
      type: IS_RESET_COSTING_HEAD,
      payload: { data: data, component: component },
    })

  }
}

//GET HEIGHT FOR DROPDOWN
export function getGridHeight(value) {
  return (dispatch) => {
    dispatch({
      type: GET_GRID_HEIGHT,
      payload: value,
    })
  }
}
//DISABLED NAVBAR, SIDEBAR, TAB AND ACTION BUTTONS WHILE DOWNLOADING DATA
export const disabledClass = (value) => {
  return (dispatch) => {
    dispatch({
      type: GET_STATE_WHILE_DOWNLOADING,
      payload: value,
    })
  }
}

export function getPlantSelectListReducer(data) {
  return (dispatch) => {
    dispatch({
      type: GET_PLANT_SELECTLIST_BY_TYPE,
      payload: data
    })
  }
}


export function getCostMovementReport(data, callback) {
  const requestedData = {
    loggedInUserId: loggedInUserId(),
    ...data
  }
  return (dispatch) => {
    const request = axiosInstance.post(API.getCostMovementReport, requestedData, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}


/**
 * @method selectApprovalType
 * @description Used to fetch Labour type selectlist
 */
export function getApprovalModuleSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getApprovalModuleSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_APPROVAL_MODULE_SELECT_LIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      callback(error);
      apiErrors(error);
    });
  };
}

/**
 * @method getApprovalTypeSelectList
 * @description Used to fetch Labour type selectlist
 */
export function getApprovalTypeSelectList(id = '', callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    let querryParam = encodeQueryParamsAndLog({ id: id })
    const request = axios.get(`${API.getApprovalTypeSelectList}?${querryParam}`, config()); request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_APPROVAL_TYPE_SELECT_LIST,
          payload: response.data.SelectList,
        });
        callback(response);
      }
    }).catch((error) => {
      callback(error);
      apiErrors(error);
    });
  };
}

export function getApprovalTypeSelectListUserModule(id = '', callback) {
  return (dispatch) => {
    let querryParam = encodeQueryParamsAndLog({ id: id });
    const request = axios.get(`${API.getApprovalTypeSelectList}?${querryParam}`, config());

    request.then((response) => {
      if (response.data.Result) {
        const selectList = response.data.SelectList;
        // Dispatch actions based on id
        switch (id) {
          case COSTING_LEVEL:
            dispatch({
              type: GET_APPROVAL_TYPE_SELECT_LIST_COSTING,
              payload: selectList,
            });
            break;
          case SIMULATION_LEVEL:
            dispatch({
              type: GET_APPROVAL_TYPE_SELECT_LIST_SIMULATION,
              payload: selectList,
            });
            break;
          case MASTER_LEVEL:
            dispatch({
              type: GET_APPROVAL_TYPE_SELECT_LIST_MASTER,
              payload: selectList,
            });
            break;
          case ONBOARDING_MANAGEMENT_LEVEL:
            dispatch({
              type: GET_APPROVAL_TYPE_SELECT_LIST_ONBOARDING,
              payload: selectList,
            });
            break;
          default:
            break;
        }
        callback(response);
      }
    }).catch((error) => {
      callback(error);
      apiErrors(error);
    });
  };
}


export function saveCostingDetailNpv(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingDetailNpv, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

export function saveCostingDetailCondition(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveCostingDetailCondition, data, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}

export function getNpvDetails(costingId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getNpvDetails}/${costingId}/${loggedInUser?.loggedInUserId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      } else {
        callback(response.status);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

export function getConditionDetails(costingId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getConditionDetails}?loggedInUserId=${loggedInUserId()}&costingId=${costingId}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
      else {
        callback(response.status);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}

export function getCostingCondition(CostingConditionEntryTypeId, costingConditionTypeId,isRequestForMultiTechnology=false, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getCostingCondition}?loggedInUserId=${loggedInUserId()}&CostingConditionEntryTypeId=${CostingConditionEntryTypeId}&costingConditionTypeId=${costingConditionTypeId}&isRequestForMultiTechnology=${isRequestForMultiTechnology}`, config());
    request.then((response) => {
      if (response.data.Result) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: FETCH_MATER_DATA_FAILURE, });
      apiErrors(error);
    });
  };
}


export function dashboardTabLock(data) {
  return (dispatch) => {
    dispatch({
      type: GET_DATA_WHILE_LOADING,
      payload: data
    })
  }
}
export function sidebarAndNavbarHide(data) {
  return (dispatch) => {
    dispatch({
      type: GET_DATA_FROM_REPORT,
      payload: data
    })
  }
}
export function getVendorNameByVendorSelectList(vendorTypeId, vendorName, technologyId, plantId = '', checkForVendorClassificationAndLPSRating = false, callback) {
  return axios.get(`${API.getVendorNameByVendorSelectList}?loggedInUserId=${loggedInUserId()}&vendorTypeId=${vendorTypeId}&vendorName=${vendorName}&technologyId=${technologyId}&plantId=${plantId}&checkForVendorClassificationAndLPSRating=${checkForVendorClassificationAndLPSRating}`, config()).catch(error => {
    apiErrors(error);
    callback(error);
    return Promise.reject(error)
  });
}

export function TourStartAction(data) {
  return (dispatch) => {
    dispatch({
      type: TOUR_START_DATA,
      payload: data
    })
  }
}
export function getExchangeRateSource(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getExchangeRateSource}`, config());
    request.then((response) => {
      if (response?.data.Result || response?.status === 204) {
        const payload = response?.status === 204 ? [] : response?.data.SelectList;

        dispatch({
          type: GET_RM_EXCHANGE_RATE_SOURCE,
          payload: payload,
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

export function getFrequencySettlement(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getFrequencySettlement}`, config());
    request.then((response) => {
      if (response?.data.Result || response?.status === 204) {
        const payload = response?.status === 204 ? [] : response?.data.SelectList;

        dispatch({
          type: GET_COST_FREQUENCY_SETTLEMENT,
          payload: payload,
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

// /**
//  * @method getMaterialTypeDataAPI
//  * @description get material type data
//  */
export function getCommodityIndexRateAverage(materialTypeId, indexExchangeId, unitOfMeasurementId, currencyId, exchangeRateSourceName, fromDate, toDate, callback) {
  return (dispatch) => {
    if (materialTypeId || indexExchangeId || exchangeRateSourceName) {
      axios.get(`${API.getCommodityIndexRateAverage}?loggedInUserId=${loggedInUserId()}&materialTypeId=${materialTypeId}&indexExchangeId=${indexExchangeId}&unitOfMeasurementId=${''}&toCurrencyId=${currencyId ?? ''}&exchangeRateSourceName=${exchangeRateSourceName}&fromDate=${fromDate}&toDate=${toDate}`, config())
        .then((response) => {
          dispatch({
            type: GET_COMMODITY_INDEX_RATE_AVERAGE,
            payload: response?.data.Data,
          });
          callback(response)
        }).catch((error) => {
          dispatch({ type: API_FAILURE });
          apiErrors(error);
        });
    } else {
      dispatch({
        type: GET_COMMODITY_INDEX_RATE_AVERAGE,
        payload: {},
      });
      callback()
    }
  };
}
/**
 * @method getTaxCodeSelectList
 * @description GET TAX CODE SELECTLIST
 */
export function getTaxCodeSelectList(callback) {
  return (dispatch) => {
    const request = axios.get(`${API.getTaxCodeSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_TAX_CODE_SELECTLIST,
          payload: response?.data?.DataList,
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

const rmAPICalling = (params, dispatch) => {
  const { tabs } = params;
  switch (tabs?.trim()) {
    case "Domestic":
    case "Import":
      dispatch(getAllRMDataList(params?.data, params?.skip, params?.take, params?.isPagination, params?.obj, params?.isImport, () => { }))
      break;
    case "Specification":
      dispatch(getRMSpecificationDataList(params?.data, () => { }))
      break;
    case "Material":
      dispatch(getMaterialTypeDataListAPI(() => { }))
      break;
    default:
      break;
  }
}

export function setListToggle(data) {
  return (dispatch) => {
    dispatch({
      type: SET_LIST_TOGGLE,
      payload: data
    })
  }
}



// ... existing code ...

// export const apiCallingFunction = (params, dispatch) => {
//   const { master, isMasterSummaryDrawer } = params;
//   if (isMasterSummaryDrawer) {
//     return;
//   }

//   switch (master?.trim()) {
//     case "RawMaterial":
//       rmAPICalling(params, dispatch)
//       break;
//     default:
//       break;
//   }
// }

// // ... existing code ...

// export function useFetchAPICall(keyName, params = {}) {
//   const dispatch = useDispatch();
//   return useQuery([[keyName], params], () => apiCallingFunction(params, dispatch), {
//     staleTime: Infinity,
//     onSuccess: (data) => {
//     }
//   });
// }
export function checkDivisionByPlantAndGetDivisionIdByPart(data, callback) {
  const requestData = { loggedInUserId: loggedInUserId(), ...data }
  return (dispatch) => {
    const request = axiosInstance.post(API.checkDivisionByPlantAndGetDivisionIdByPart, requestData, config())
    request
      .then((response) => {
        if (response.data.Result) {
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response.data.Message) {
            Toaster.error(response.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
      })
  }
}
