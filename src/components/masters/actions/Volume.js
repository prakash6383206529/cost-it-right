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
} from '../../../config/constants'
import { userDetails } from '../../../helper'
import { apiErrors } from '../../../helper/util'
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
    const QueryParams = `CostingHead=${obj.CostingHead !== undefined ? obj.CostingHead : ""}&Year=${obj.Year !== undefined ? obj.Year : ""}&Month=${obj.Month !== undefined ? obj.Month : ""}&Vendor=${obj.VendorName !== undefined ? obj.VendorName : ""}&Plant=${obj.Plant !== undefined ? obj.Plant : ""}&PartNumber=${obj.PartNumber !== undefined ? obj.PartNumber : ""}&PartName=${obj.PartName !== undefined ? obj.PartName : ""}&BudgetedQuantity=${obj.BudgetedQuantity !== undefined ? obj.BudgetedQuantity : ""}&ApprovedQuantity=${obj.ApprovedQuantity !== undefined ? obj.ApprovedQuantity : ""}&applyPagination=${isPagination !== undefined ? isPagination : ""}&skip=${skip !== undefined ? skip : ""}&take=${take !== undefined ? take : ""}`
    axios.get(`${API.getVolumeDataList}?${QueryParams}`, config())
      .then((response) => {
        if (response.data.Result || response.status === 204) {
          if (isPagination) {
            dispatch({
              type: GET_VOLUME_DATA_LIST,
              payload: response.status === 204 ? [] : response.data.DataList
            })
          } else {
            dispatch({
              type: GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
              payload: response.status === 204 ? [] : response.data.DataList
            })
          }
          callback(response.status === 204 ? [] : response)
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
    const QueryParams = `volumeId=${ID.volumeId}&VolumeApprovedId=${ID.volumeApprovedId}&VolumeBudgetedId=${ID.volumeBudgetedId}&LoggedInUserId=${userDetails().LoggedInUserId} `
    dispatch({ type: API_REQUEST })
    axios
      .delete(`${API.deleteVolume}?${QueryParams} `, config())
      .then((response) => {
        callback(response)
      })
      .catch((error) => {
        apiErrors(error)
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
    const request = axios.get(`${API.getFinancialYearSelectList} `, config())
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
 * @method bulkUploadVolumeActualZBC
 * @description BULK UPLOAD FOR ACTUAL VOLUME ZBC
 */
export function bulkUploadVolumeActualZBC(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.bulkUploadVolumeActualZBC, data, config())
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
 * @method bulkUploadVolumeActualVBC
 * @description BULK UPLOAD FOR ACTUAL VOLUME VBC
 */
export function bulkUploadVolumeActualVBC(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.bulkUploadVolumeActualVBC, data, config())
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
 * @method bulkUploadVolumeBudgetedZBC
 * @description BULK UPLOAD FOR BUDGETED VOLUME ZBC
 */
export function bulkUploadVolumeBudgetedZBC(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.bulkUploadVolumeBudgetedZBC, data, config())
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
 * @method bulkUploadVolumeBudgetedVBC
 * @description BULK UPLOAD FOR BUDGETED VOLUME VBC
 */
export function bulkUploadVolumeBudgetedVBC(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.bulkUploadVolumeBudgetedVBC, data, config());
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
 * @method getVolumeDataByPartAndYear
 * @description Get Volume Data by part and year
 */
export function getVolumeDataByPartAndYear(partNumber, financialYear, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    axios.get(`${API.getVolumeData} /${partNumber}/${financialYear} /0`, config())
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
