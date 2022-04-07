import { config, SUB_ASSEMBLY_TECHNOLOGY_ARRAY, } from '../../../config/constants'

let headers = config

/**
 * @method:setSubAssemblyTechnologyArray
 * @description: Used for storing part no from costing summary
 * @param {*} data
 */
export function setSubAssemblyTechnologyArray(data) {
  return (dispatch) => {
    dispatch({
      type: SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
      payload: data,
    })
  }
}


