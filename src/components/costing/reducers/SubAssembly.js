import {
  API_REQUEST,
  API_FAILURE,
  SUB_ASSEMBLY_TECHNOLOGY_ARRAY,
  GET_EDIT_PART_COST_DETAILS,
  GET_COSTING_FOR_MULTI_TECHNOLOGY,
  GET_SETTLED_COSTING_DETAILS,
} from '../../../config/constants';
import { tempObject } from '../../../config/masterData';

const initialState = {
  subAssemblyTechnologyArray: [],
  getEditPartCostDetails: []
}

export default function costingReducer(state = initialState, action) {
  switch (action.type) {
    case API_REQUEST:
      return {
        ...state,
        loading: true,
      }
    case API_FAILURE:
      return {
        ...state,
        loading: false,
        error: true,
      }
    case SUB_ASSEMBLY_TECHNOLOGY_ARRAY:
      const tempRMData = [...action.payload]
      return {
        ...state,
        subAssemblyTechnologyArray: tempRMData,
      }
    case GET_EDIT_PART_COST_DETAILS:
      return {
        ...state,
        getEditPartCostDetails: action.payload,
      }
    case GET_COSTING_FOR_MULTI_TECHNOLOGY:
      return {
        ...state,
        costingForMultiTechnology: action.payload,
      }
    case GET_SETTLED_COSTING_DETAILS:
      return {
        ...state,
        loading: false,
        settledCostingDetails: action.payload
      };

    default:
      return state
  }
}
