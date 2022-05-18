import axios from 'axios'
import { API, API_FAILURE, API_REQUEST, config, SUB_ASSEMBLY_TECHNOLOGY_ARRAY, } from '../../../config/constants'
import { apiErrors } from '../../../helper'

let headers = config

/**
 * @method:setSubAssemblyTechnologyArray
 * @description: Used for storing part no from costing summary
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
 * @method:setSubAssemblyTechnologyArray
 * @description: Used for storing part no from costing summary
 * @param {*} data
 */
export function setSubAssemblyAPI(data, callback) {
  return (dispatch) => {
    dispatch({ type: API_REQUEST });
    const queryParams = `simulationApprovalProcessSummaryId=${data.simulationApprovalProcessSummaryId}&simulationid=${data.simulationId}&costingId=${data.costingId}`
    const request = axios.get(`${API.simulationComparisionData}?${queryParams}`, headers);
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

