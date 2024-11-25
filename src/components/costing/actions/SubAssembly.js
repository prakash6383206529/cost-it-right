import axios from 'axios'
import { API, API_FAILURE, API_REQUEST, config, GET_COSTING_FOR_MULTI_TECHNOLOGY, GET_EDIT_PART_COST_DETAILS, GET_SETTLED_COSTING_DETAILS, GET_SETTLED_COSTING_DETAILS_VIEW, SUB_ASSEMBLY_TECHNOLOGY_ARRAY, } from '../../../config/constants'
import { apiErrors } from '../../../helper'

let headers = config

/**
 * @method:setSubAssemblyTechnologyArray
 * @description: setSubAssemblyTechnologyArray
 * @param {*} data
 */
export function setSubAssemblyTechnologyArray(data, callback) {
  return (dispatch) => {
    dispatch({
      type: SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
      payload: data,
    })
    callback()
  }
}

/**
 * @method:getSubAssemblyAPI
 * @description: getSubAssemblyAPI
 * @param {*} data
 */
export function getSubAssemblyAPI(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${data.costingId}&technologyId=${data.technologyId}`
    const request = axios.get(`${API.getSubAssemblyAPI}?${queryParams}`, headers);
    request.then((response) => {
      if (response?.data?.Result) {
        dispatch({
          type: SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
          payload: response?.data?.Result,
        })
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  }
}

/**
 * @method:getEditPartCostDetails
 * @description: getEditPartCostDetails
 * @param {*} data
 */
export function getEditPartCostDetails(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `costingId=${data?.costingId}&technologyID=${data?.technologyID}`
    const request = axios.get(`${API.getEditPartCostDetails}?${queryParams}`, headers);
    request.then((response) => {
      if (response?.data?.Result) {
        dispatch({
          type: GET_EDIT_PART_COST_DETAILS,
          payload: response?.data?.Result,
        })
        callback(response);
      }
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  }
}

/**
 * @method saveEditPartCostDetails
 * @description saveEditPartCostDetails
 */
export function saveEditPartCostDetails(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveEditPartCostDetails, data, config())
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
 * @method:getCostingForMultiTechnology
 * @description: getCostingForMultiTechnology
 * @param {*} data
 */
export function getCostingForMultiTechnology(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `partId=${data?.partId}&plantId=${data?.plantId}&costingTypeId=${data?.costingTypeId}&isRequestForWAC=${data?.isRequestForWAC}&effectiveDate=${data?.effectiveDate}&baseCostingId=${data?.baseCostingId}`
    const request = axios.get(`${API.getCostingForMultiTechnology}?${queryParams}`, config());
    request.then((response) => {
      dispatch({
        type: GET_COSTING_FOR_MULTI_TECHNOLOGY,
        payload: response?.status === 204 ? [] : response?.data?.DataList,
      })
      callback(response);
    }).catch((error) => {
      dispatch({ type: API_FAILURE });
      callback(error);
      apiErrors(error);
    });
  }
}

/**
 * @method:saveSettledCostingDetails
 * @description: saveSettledCostingDetails
 * @param {*} data
 */
export function saveSettledCostingDetails(data, callback) {
  return (dispatch) => {
    const request = axios.post(API.saveSettledCostingDetails, data, config())
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
 * @method getSettledCostingDetails
 * @description getSettledCostingDetails
 */
export function getSettledCostingDetails(CostingId, isViewMode, callback) {
  return (dispatch) => {
    if (CostingId !== '') {
      if (isViewMode) {
        dispatch({
          type: GET_SETTLED_COSTING_DETAILS_VIEW,
          payload: [],
        })
      } else {
        dispatch({
          type: GET_SETTLED_COSTING_DETAILS,
          payload: [],
        })
      }
      const request = axios.get(`${API.getSettledCostingDetails}?baseCostingId=${CostingId}`, config());
      request.then((response) => {
        if (response.data.Result) {
          if (isViewMode) {
            dispatch({
              type: GET_SETTLED_COSTING_DETAILS_VIEW,
              payload: response.data.Data,
            })
          } else {
            dispatch({
              type: GET_SETTLED_COSTING_DETAILS,
              payload: response.data.Data,
            })
          }
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_SETTLED_COSTING_DETAILS,
        payload: [],
      })
      callback();
    }
  };
}

/**
 * @method:updateMultiTechnologyTopAndWorkingRowCalculation
 * @description: updateMultiTechnologyTopAndWorkingRowCalculation
 * @param {*} data
 */
export function updateMultiTechnologyTopAndWorkingRowCalculation(data, callback) {
  return (dispatch) => {
    const request = axios.put(API.updateMultiTechnologyTopAndWorkingRowCalculation, data, config())
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
 * @method getSettledSimulationCostingDetails
 * @description getSettledSimulationCostingDetails
 */
export function getSettledSimulationCostingDetails(simulationId, baseCostingId, isViewMode, callback) {
  return (dispatch) => {
    if (baseCostingId !== '' && simulationId !== '') {
      if (isViewMode) {
        dispatch({
          type: GET_SETTLED_COSTING_DETAILS_VIEW,
          payload: [],
        })
      } else {
        dispatch({
          type: GET_SETTLED_COSTING_DETAILS,
          payload: [],
        })
      }
      const request = axios.get(`${API.getSettledSimulationCostingDetails}?simulationId=${simulationId}&baseCostingId=${baseCostingId}`, config())
      request.then((response) => {
        if (response.data.Result) {
          if (isViewMode) {
            dispatch({
              type: GET_SETTLED_COSTING_DETAILS_VIEW,
              payload: response.data.Data,
            })
          } else {
            dispatch({
              type: GET_SETTLED_COSTING_DETAILS,
              payload: response.data.Data,
            })
          }
          callback(response);
        }
      }).catch((error) => {
        dispatch({ type: API_FAILURE });
        callback(error);
        apiErrors(error);
      });
    } else {
      dispatch({
        type: GET_SETTLED_COSTING_DETAILS,
        payload: [],
      })
      callback();
    }
  };
}
