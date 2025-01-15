import axios from 'axios'
import {
  API,
  API_FAILURE,
  config,
} from '../../../config/constants'
import { apiErrors } from '../../../helper/util'
import axiosInstance from '../../../utils/axiosInstance'

/**
 * @method saveProcessCostCalculationData
 * @description Save Process Cost Calculation Data
 */
export function saveProcessCostCalculationData(data, callback) {
  return (dispatch) => {
    const request = axiosInstance.post(API.saveProcessCostCalculation, data, config())
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
