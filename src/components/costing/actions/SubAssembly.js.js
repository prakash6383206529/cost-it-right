import { config, SET_ASSEMBLY_TECHNOLOGY_TAB_DATA, SUB_ASSEMBLY_TECHNOLOGY_ARRAY, } from '../../../config/constants'

let headers = config

/**
 * @method:setSubAssemblyTechnologyArray
 * @description: Used for storing part no from costing summary
 * @param {*} data
 */
export function setSubAssemblyTechnologyArray(data) {
  console.log('CostingViewMode:  data: ', data);
  return (dispatch) => {
    dispatch({
      type: SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
      payload: data,
    })
  }
}

export function setAssemblyTechnologyTabData(data) {
  return (dispatch) => {
    dispatch({
      type: SET_ASSEMBLY_TECHNOLOGY_TAB_DATA,
      payload: data
    })
  }
}




