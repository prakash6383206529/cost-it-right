import axios from 'axios'
import {
  API,
  API_REQUEST,
  API_FAILURE,
  GET_VOLUME_DATA_SUCCESS,
  GET_FINANCIAL_YEAR_SELECTLIST,
  GET_VOLUME_DATA_LIST,
  GET_VOLUME_DATA_BY_PART_AND_YEAR,
  config,
  GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
  GET_VOLUME_LIMIT,
  CHECK_REGULARIZATION_LIMIT,
  EMPTY_GUID
} from '../../../config/constants'
import { userDetails } from '../../../helper'
import { apiErrors, encodeQueryParamsAndLog } from '../../../helper/util'
// const config() = config

/**
 * @method createVolume
 * @description create Volume
 */
export function createVolume(data, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    const request = axios.post(API.createVolume, data, config())
    request
      .then((response) => {
        if (response.data.Result === true) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error);
      })
  }
}

/**
 * @method updateVolume
 * @description update volume details
 */
export function updateVolume(requestData, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });
    axios
      .put(`${API.updateVolume}`, requestData, config())
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
        callback(error);
      })
  }
}

/**
 * @method getVolumeData
 * @description Get Volume Data
 */
export function getVolumeData(VolumeId, callback) {


  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    if (VolumeId !== '') {
      axios.get(`${API.getVolumeData}/${VolumeId}`, config())
        .then((response) => {
          if (response.data.Result === true) {
            dispatch({
              type: GET_VOLUME_DATA_SUCCESS,
              payload: response.data.Data,
            })
            callback(response)
          }
        })
        .catch((error) => {

          apiErrors(error)
          dispatch({ type: API_FAILURE })
        })
    } else {
      dispatch({
        type: GET_VOLUME_DATA_SUCCESS,
        payload: {},
      })
    }
  }
}

/**
 * @method getVolumeDataList
 * @description get all operation list
 */
export function getVolumeDataList(skip, take, isPagination, obj, callback) {
  return (dispatch) => {
    //dispatch({ type: API_REQUEST });    
    const queryParams = encodeQueryParamsAndLog({
      CostingHead: obj?.CostingHead,
      Year: obj?.Year,
      Month: obj?.Month,
      Vendor: obj?.VendorName,
      Plant: obj?.Plant,
      PartNumber: obj?.PartNumber,
      PartName: obj?.PartName,
      BudgetedQuantity: obj?.BudgetedQuantity,
      ApprovedQuantity: obj?.ApprovedQuantity,
      applyPagination: isPagination,
      skip: skip,
      take: take,
      CustomerName: obj?.CustomerName,
      IsCustomerDataShow: obj?.IsCustomerDataShow,
      IsVendorDataShow: obj?.IsVendorDataShow,
      IsZeroDataShow: obj?.IsZeroDataShow,
      PartType: obj?.PartType
    });
    axios.get(`${API.getVolumeDataList}?${queryParams}`, config())
      .then((response) => {
        if (response?.data?.Result || response?.status === 204) {
          if (isPagination) {
            dispatch({
              type: GET_VOLUME_DATA_LIST,
              payload: response?.status === 204 ? [] : response?.data?.DataList
            })
          } else {
            dispatch({
              type: GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
              payload: response?.status === 204 ? [] : response?.data?.DataList
            })
          }
          callback(response?.status === 204 ? [] : response)
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
 * @method deleteVolume
 * @description delete Volume
 */
export function deleteVolume(ID, callback) {
  return (dispatch) => {
    const QueryParams = `volumeId=${ID.volumeId}&VolumeApprovedId=${ID.volumeApprovedId}&VolumeBudgetedId=${ID.volumeBudgetedId}&LoggedInUserId=${userDetails().LoggedInUserId}`
    dispatch({ type: API_REQUEST })
    axios
      .delete(`${API.deleteVolume}?${QueryParams}`, config())
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        callback(error?.response)
        dispatch({ type: API_FAILURE })
      })
  }
}

/**
 * @method getFinancialYearSelectList
 * @description GET FINANCIAL YEAR LIST
 */
export function getFinancialYearSelectList(callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST })
    const request = axios.get(`${API.getFinancialYearSelectList}`, config())
    request
      .then((response) => {
        if (response.data.Result) {
          dispatch({
            type: GET_FINANCIAL_YEAR_SELECTLIST,
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
 * @method volumeBulkUpload
 * @description BULK UPLOAD FOR ACTUAL VOLUME ZBC
 */
export function volumeBulkUpload(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.volumeBulkUpload, data, config())
    request
      .then((response) => {
        if (response.status === 200) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error);
      })
  }
}

/**
 * @method getVolumeDataByPartAndYear
 * @description Get Volume Data by part and year
 */
export function getVolumeDataByPartAndYear(partNumber, financialYear, plantId, vendorId, customerId, costingTypeId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.get(`${API.getVolumeData}/${partNumber}/${financialYear}/${plantId === '' ? EMPTY_GUID : plantId}/${vendorId === '' ? EMPTY_GUID : vendorId}/${customerId === '' ? EMPTY_GUID : customerId}/${costingTypeId}`, config())
      .then((response) => {
        if (response.data.Result === true || response.status === 202) {
          dispatch({
            type: GET_VOLUME_DATA_BY_PART_AND_YEAR,
            payload: response.data.Data,
          });
          callback(response);
        }
      }).catch((error) => {
        // apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method createVolumeLimit
 * @description CREATE VOLUME LIMIT 
 */
export function createVolumeLimit(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.createVolumeLimit, data, config())
    request
      .then((response) => {
        if (response.status === 200) {
          callback(response)
        }
      })
      .catch((error) => {
        dispatch({ type: API_FAILURE })
        apiErrors(error)
        callback(error);
      })
  }
}
/**
 * @method updateVolumeLimit
 * @description UPDATE VOLUME LIMIT 
 */
export function updateVolumeLimit(data, callback) {
  return (dispatch) => {
    axios
      .put(`${API.updateVolumeLimit}`, data, config())
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        apiErrors(error)
        dispatch({ type: API_FAILURE })
        callback(error);
      })
  }
}

/**
 * @method getVolumeLimit
 * @description Get Volume Limit
 */
export function getVolumeLimit(technologyId, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.get(`${API.getVolumeLimit}/${technologyId}`, config())
      .then((response) => {
        if (response.data.Result === true || response.status === 202) {
          dispatch({
            type: GET_VOLUME_LIMIT,
            payload: response.data.Data,
          });
          callback(response);
        }
      }).catch((error) => {
        // apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}

/**
 * @method checkRegularizationLimit
 * @description Get Volume Limit
 */
export function checkRegularizationLimit(obj, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    let queryParams = `TechnologyId=${obj.technologyId}&PartId=${obj.partId}&PlantId=${obj.destinationPlantId}&VendorId=${obj.vendorId}`
    axios.get(`${API.checkRegularizationLimit}?${queryParams}`, config())
      .then((response) => {
        if (response.data.Result === true || response.status === 202) {
          dispatch({
            type: CHECK_REGULARIZATION_LIMIT,
            payload: response.data.Data,
          });
          callback(response);
        }
      }).catch((error) => {
        // apiErrors(error);
        dispatch({ type: API_FAILURE });
      });
  };
}
export function getPartSelectListWtihRevNo(partNumber, technologyId, nfrId, partTypeId, callback) {
  return axios.get(`${API.getPartSelectListWtihRevNo}?${partNumber ? `&partNumber=${partNumber}` : ''}${technologyId ? `&technologyId=${technologyId}` : ''}${nfrId ? `&nfrId=${nfrId}` : ''}${partTypeId ? `&partTypeId=${partTypeId}` : ''}`, config()).catch(error => {
    apiErrors(error);
    callback(error);
    return Promise.reject(error)
  });
}
/**
 * @method bulkUploadVolume
 * @description upload bulk Volume
 */
export function bulkUploadVolume(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.bulkUploadVolume, data, config());
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