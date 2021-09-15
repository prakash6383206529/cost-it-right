import axios from 'axios'
import {
  API,
  API_REQUEST,
  API_FAILURE,
  API_SUCCESS,
} from '../../../config/constants'
import { apiErrors } from '../../../helper/util'
import { MESSAGES } from '../../../config/message'
import { toastr } from 'react-redux-toastr'

const headers = {
  'Content-Type': 'application/json',
  //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
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
