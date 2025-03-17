import axios from "axios";
import {
  API,
  API_REQUEST,
  API_FAILURE,
  GET_BOP_DOMESTIC_DATA_SUCCESS,
  GET_BOP_IMPORT_DATA_SUCCESS,
  GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
  GET_PLANT_SELECTLIST_BY_VENDOR,
  GET_BOP_SOB_VENDOR_DATA_SUCCESS,
  GET_INITIAL_SOB_VENDORS_SUCCESS,
  GET_BOP_DOMESTIC_DATA_LIST,
  GET_ALL_BOP_DOMESTIC_DATA_LIST,
  GET_BOP_IMPORT_DATA_LIST,
  config,
  GET_SOB_LISTING,
  GET_INCO_SELECTLIST_SUCCESS,
  GET_PAYMENT_SELECTLIST_SUCCESS,
  GET_VIEW_BOUGHT_OUT_PART_SUCCESS,
  GET_BOP_DETAILS
} from '../../../config/constants';
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { bopQueryParms } from '../masterUtil';
import { reactLocalStorage } from 'reactjs-localstorage';
import axiosInstance from "../../../utils/axiosInstance";
import { loggedInUserId } from "../../../helper";

// const config() = config

/**
 * @method createBOPAPI
 * @description create baught out parts master
 */
export function createBOP(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createBOP, data, config());
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
 * @method getBOPDataList
 * @description get all BOP Domestic Data list.
 */
export function getBOPDataList(data, skip, take, isPagination, obj, isImport, callback) {
  return (dispatch) => {
    // dispatch({ type: API_REQUEST});
    const queryParams = encodeQueryParamsAndLog({
      loggedInUserId: loggedInUserId(),
      bop_for: data.bop_for,
      NetCost: obj.NetLandedCost !== undefined ? obj.NetLandedCost : "",
      ListFor: data.ListFor ? data.ListFor : '',
      StatusId: data.StatusId ? data.StatusId : '',
      DepartmentCode: obj.DepartmentName !== undefined ? obj.DepartmentName : "",
      CustomerName: obj.CustomerName !== undefined ? obj.CustomerName : '',
      TechnologyName: obj.TechnologyName !== undefined ? obj.TechnologyName : "",
      FromDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : "",
      ToDate: (obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : "",
      IsCustomerDataShow: reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false,
      IsBOPAssociated: data?.IsBOPAssociated,
      IsVendorDataShow: reactLocalStorage.getObject('CostingTypePermission').vbc,
      IsZeroDataShow: reactLocalStorage.getObject('CostingTypePermission').zbc,
      IsBreakupBoughtOutPart: data?.IsBreakupBoughtOutPart?.toLowerCase() === "yes" ? true : !data.IsBreakupBoughtOutPart ? '' : false,
      IncoTerms: obj.IncoTerms !== undefined ? obj.IncoTerms : "",
      NetConditionCost: obj.NetConditionCost !== undefined ? obj.NetConditionCost : "",
      NetCostWithoutConditionCostConversion: obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : "",
      NetCostWithoutConditionCost: obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : "",
      BasicRateConversion: obj.BasicRateConversion !== undefined ? obj.BasicRateConversion : "",
      NetConditionCostConversion: obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : "",
      NetLandedCostConversionAPI: obj.NetLandedCostConversionAPI !== undefined ? obj.NetLandedCostConversionAPI : "",
      isRequestForPendingSimulation: obj?.isRequestForPendingSimulation ? true : false,
      Currency: data.Currency !== undefined ? data.Currency : "",
      LocalCurrency: data.LocalCurrency !== undefined ? data.LocalCurrency : "",
      EffectiveDate: data.EffectiveDate !== undefined ? data.EffectiveDate : "",
    });

    // const queryParams = `bop_for=${data.bop_for}&NetCost=${obj.NetLandedCost !== undefined ? obj.NetLandedCost : ""}&ListFor=${data.ListFor ? data.ListFor : ''}&StatusId=${data.StatusId ? data.StatusId : ''}&DepartmentCode=${obj.DepartmentName !== undefined ? obj.DepartmentName : ""}&CustomerName=${obj.CustomerName !== undefined ? obj.CustomerName : ''}&TechnologyName=${obj.TechnologyName !== undefined ? obj.TechnologyName : ""}&FromDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[0] : ""}&ToDate=${(obj.dateArray && obj.dateArray.length > 1) ? obj.dateArray[1] : ""}&IsCustomerDataShow=${reactLocalStorage.getObject('CostingTypePermission').cbc !== undefined ? reactLocalStorage.getObject('CostingTypePermission').cbc : false}&IsBOPAssociated=${data?.IsBOPAssociated}&IsVendorDataShow=${reactLocalStorage.getObject('CostingTypePermission').vbc}&IsZeroDataShow=${reactLocalStorage.getObject('CostingTypePermission').zbc}&IsBreakupBoughtOutPart=${data?.IsBreakupBoughtOutPart?.toLowerCase() === "yes" ? true : !data.IsBreakupBoughtOutPart ? '' : false}&IncoTerms=${obj.IncoTerms !== undefined ? obj.IncoTerms : ""}&CustomerName =${obj.CustomerName !== undefined ? obj.CustomerName : ""}&NetConditionCost =${obj.NetConditionCost !== undefined ? obj.NetConditionCost : ""}&NetCostWithoutConditionCostConversion =${obj.NetCostWithoutConditionCostConversion !== undefined ? obj.NetCostWithoutConditionCostConversion : ""}&NetCostWithoutConditionCost =${obj.NetCostWithoutConditionCost !== undefined ? obj.NetCostWithoutConditionCost : ""}&BasicRateConversion =${obj.BasicRateConversion !== undefined ? obj.BasicRateConversion : ""}&NetConditionCostConversion =${obj.NetConditionCostConversion !== undefined ? obj.NetConditionCostConversion : ""}&NetLandedCostConversionAPI =${obj.NetLandedCostConversionAPI !== undefined ? obj.NetLandedCostConversionAPI : ""}`
    const queryParamsSecond = bopQueryParms(isPagination, skip, take, obj);
    const request = axios.get(`${API.getBOPDataList}?${queryParams}&${queryParamsSecond}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        if (isPagination === true) {
          dispatch({
            type: isImport
              ? GET_BOP_IMPORT_DATA_LIST
              : GET_BOP_DOMESTIC_DATA_LIST,
            payload: response.status === 204 ? [] : response.data.DataList,
          });
        } else {
          dispatch({
            type: GET_ALL_BOP_DOMESTIC_DATA_LIST,
            payload: response.status === 204 ? [] : response.data.DataList,
          });
        }
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
 * @method getBOPDomesticById
 * @description get one bought out part based on id
 */
export function getBOPDomesticById(bopId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    if (bopId !== "") {
      axios
        .get(`${API.getBOPDomesticById}/${bopId}/${loggedInUser?.loggedInUserId}`, config())
        .then((response) => {
          if (response.data.Result) {
            dispatch({
              type: GET_BOP_DOMESTIC_DATA_SUCCESS,
              payload: response.data.Data,
            });
            callback(response);
          }
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
        });
    } else {
      dispatch({
        type: GET_BOP_DOMESTIC_DATA_SUCCESS,
        payload: {},
      });
      callback();
    }
  };
}

/**
 * @method getBOPImportById
 * @description get one bought out part based on id
 */
export function getBOPImportById(bopId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    if (bopId !== "") {
      axios
        .get(`${API.getBOPImportById}/${bopId}/${loggedInUser?.loggedInUserId}`, config())
        .then((response) => {
          if (response.data.Result) {
            dispatch({
              type: GET_BOP_IMPORT_DATA_SUCCESS,
              payload: response.data.Data,
            });
            callback(response);
          }
        })
        .catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
        });
    } else {
      dispatch({
        type: GET_BOP_IMPORT_DATA_SUCCESS,
        payload: {},
      });
      callback();
    }
  };
}

/**
 * @method deleteBOP
 * @description delete BOP
 */
export function deleteBOP(bopId, loggedInUserId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `bopId=${bopId}&loggedInUserId=${loggedInUserId}`;
    axios.delete(`${API.deleteBOP}?${queryParams}`, config())
      .then((response) => {
        callback(response);
      })
      .catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method updateBOP
 * @description update BOP Domestic
 */
export function updateBOP(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axiosInstance.put(`${API.updateBOP}`, requestData, config())
      .then((response) => {
        callback(response);
      })
      .catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
        callback(error);
      });
  };
}

/**
 * @method createBOPCategory
 * @description create BOP Category
 */
export function createBOPCategory(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.createBOPCategory, data, config());
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
 * @method getBOPCategorySelectList
 * @description Used to fetch BOP Category selectlist
 */
export function getBOPCategorySelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getBOPCategorySelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
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
 * @method getPlantSelectListByVendor
 * @description Used to get select list of Plant by Vendors
 */
export function getPlantSelectListByVendor(VendorId, callback) {
  const loggedInUser = { loggedInUserId: loggedInUserId() }
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axios.get(
      `${API.getPlantSelectListByVendor}/${VendorId}/${loggedInUser?.loggedInUserId}`,
      config()
    );
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PLANT_SELECTLIST_BY_VENDOR,
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
 * @method fileUploadBOPDomestic
 * @description File Upload BOP Domestic
 */
export function fileUploadBOPDomestic(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.fileUploadBOPDomestic, data, config());
    request.then((response) => {
      if (response && response.status === 200) {
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      apiErrors(error);
      callback(error.toString())
    });
  };
}


/**
 * @method bulkUploadBOP
 * @description upload bulk BOP Domestic ZBC
 */
export function bulkUploadBOP(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.bulkUploadBOP, data, config());
    request.then((response) => {
      if (response.status === 200) {
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
 * @method getManageBOPSOBDataList
 * @description get all BOP SOB Data list.
 */
export function getInitialFilterData(boughtOutPartNumber, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `loggedInUserId=${loggedInUserId()}&boughtOutPartNumber=${boughtOutPartNumber}`;
    const request = axios.get(`${API.getManageBOPSOBDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_INITIAL_SOB_VENDORS_SUCCESS,
          payload: response.data.DataList,
        });
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
 * @method getManageBOPSOBDataList
 * @description get all BOP SOB Data list.
 */
export function getManageBOPSOBDataList(data, callback) {

  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    // const queryParams = `bought_out_part_id=${data.bought_out_part_id}&plant_id=${data.plant_id}`;
    const queryParams = new URLSearchParams({
      loggedInUserId: loggedInUserId(),
      boughtOutPartNumber: data.boughtOutPartNumber || '',
      boughtOutPartName: data.boughtOutPartName || '',
      category: data.category || '',
      specification: data.specification || '',
      noOfVendor: data.noOfVendor || 1,
      plantCode: data.plantCode || '',
      totalSOB: data.totalSOB || '',
      weightedNetLandedCost: data.weightedNetLandedCost || '',
      vendor: data.vendor || '',
      applyPagination: data.applyPagination || false,
      skip: data.skip || 0,
      take: data.take || 10,
      effectiveDate: data.effectiveDate || '',
      // Keep existing params if needed
      bought_out_part_id: data.bought_out_part_id || '',
      plant_id: data.plant_id || ''
    })
    const request = axios.get(`${API.getManageBOPSOBDataList}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_SOB_LISTING,
          payload: response.status === 204 ? [] : response.data.DataList,
        });
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      //apiErrors(error);
    });
  };
}
export function getViewBoughtOutPart(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `loggedInUserId=${loggedInUserId()}&entryType=${data.entryType}&bopCategory=${data.bopCategory}&bopName=${data.bopName}&bopNumber=${data.bopNumber}`;
    const request = axios.get(`${API.getViewBoughtOutPart}?${queryParams}`, config());
    request.then((response) => {
      if (response.data.Result || response.status === 204) {
        dispatch({
          type: GET_VIEW_BOUGHT_OUT_PART_SUCCESS,
          payload: response.status === 204 ? [] : response.data.DataList,
        });
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
 * @method getManageBOPSOBById
 * @description GET MANAGE BOP SOB BY ID
 */
export function getManageBOPSOBById(boughtOutPartNumber, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    if (boughtOutPartNumber !== "") {
      const queryParams = `boughtOutPartNumber=${boughtOutPartNumber}&loggedInUserId=${loggedInUserId()}`;
      axios.get(`${API.getManageBOPSOBById}?${queryParams}`, config())
        .then((response) => {
          if (response.data.Result) {
            dispatch({
              type: GET_BOP_SOB_VENDOR_DATA_SUCCESS,
              payload: response.data.Data,
            });
            callback(response);
          }
        }).catch((error) => {
          apiErrors(error);
          dispatch({ type: API_FAILURE });
        });
    } else {
      dispatch({
        type: GET_BOP_SOB_VENDOR_DATA_SUCCESS,
        payload: {},
      });
      callback();
    }
  };
}

/**
 * @method updateBOPSOBVendors
 * @description update BOP SOB Vendors
 */
export function updateBOPSOBVendors(requestData, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axiosInstance.put(`${API.updateBOPSOBVendors}`, requestData, config())
      .then((response) => {
        callback(response);
      }).catch((error) => {
        apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method getIncoSelectList
 * @description Used to get Inco terms selectlist
 */
export function getIncoTermSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getIncoTermSelectList}?loggedInUserId=${loggedInUserId()}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_INCO_SELECTLIST_SUCCESS,
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
/**
 * @method getPaymentSelectList
 * @description Used to get Payment terms selectlist
 */
export function getPaymentTermSelectList(callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.get(`${API.getPaymentTermSelectList}`, config());
    request.then((response) => {
      if (response.data.Result) {
        dispatch({
          type: GET_PAYMENT_SELECTLIST_SUCCESS,
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
/**
 * @method checkAndGetBopCode
 * @description CHECK AND GET BOP CODE
 */
export function checkAndGetBopPartNo(obj, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const request = axiosInstance.post(`${API.checkAndGetBopPartNo}?loggedInUserId=${loggedInUserId()}&bopName=${obj.bopName}&bopCategory=${obj.bopCategory}&bopNumber=${obj.bopNumber}`, "", config());
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

export function setBopCostingData(data) {
  return (dispatch) => {
    dispatch({
      type: GET_BOP_DETAILS,
      payload: data || {},
    });
  }
};
export function getViewBOPDetails(data, callback) {
  const requestData = {
    loggedInUserId: loggedInUserId(),
    ...data
  }
  return (dispatch) => {
    const request = axiosInstance.post(API.getViewBOPDetails, requestData, config())
    request
      .then((response) => {
        if (response?.data.Result) {
          dispatch({
            type: GET_BOP_DETAILS,
            payload: response.status === 200 ? response?.data.DataList : []
          })
          callback(response)
        } else {
          dispatch({ type: API_FAILURE })
          if (response?.data.Message) {
            Toaster.error(response?.data.Message)
          }
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error)
      })
  }
}