import {
    API_REQUEST,
    API_FAILURE,
    GET_WEIGHT_CALC_INFO_SUCCESS,
    CREATE_WEIGHT_CALC_COSTING_SUCCESS,
    UPDATE_WEIGHT_CALC_SUCCESS,
    GET_WEIGHT_CALC_LAYOUT_SUCCESS,
    GET_COSTING_BY_SUPPLIER_SUCCESS,
    GET_COSTING_DATA_SUCCESS
} from '../../config/constants';

const initialState = {

};

export default function CostWorkingReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_WEIGHT_CALC_INFO_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                weightCostingInfo: action.payload
            };
        case CREATE_WEIGHT_CALC_COSTING_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case GET_WEIGHT_CALC_LAYOUT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                weightLayoutType: action.payload
            };
        case GET_COSTING_BY_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                costingData: action.payload
            };
            case GET_COSTING_DATA_SUCCESS:
                return {
                    ...state,
                    loading: false,
                    error: true,
                    getCostingData: action.payload
                };
        default:
            return state;
    }
}
