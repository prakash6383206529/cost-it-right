import axios from 'axios'
import { API, API_FAILURE, API_REQUEST, config, GET_EDIT_PART_COST_DETAILS, SUB_ASSEMBLY_TECHNOLOGY_ARRAY, } from '../../../config/constants'
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

