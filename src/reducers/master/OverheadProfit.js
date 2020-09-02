import {
    API_REQUEST,
    API_FAILURE,
    GET_OVERHEAD_PROFIT_SUCCESS,
    GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
    GET_OVERHEAD_PROFIT_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_MODEL_TYPE_SELECTLIST,
    GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST,
    GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST,
    GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST,
} from '../../config/constants';

const initialState = {

};

export default function OverheadProfitReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false
            };
        case GET_OVERHEAD_PROFIT_SUCCESS:
            return {
                ...state,
                loading: false,
                overheadProfitList: action.payload
            };
        case GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                overheadProfitComboData: action.payload
            };
        case GET_OVERHEAD_PROFIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                overheadProfitData: action.payload
            };
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case GET_MODEL_TYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterOverheadSelectList: { ...state.filterOverheadSelectList, modelTypeSelectList: action.payload }
            };
        case GET_VENDOR_FILTER_WITH_VENDOR_CODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterOverheadSelectList: { ...state.filterOverheadSelectList, VendorsSelectList: action.payload }
            };
        case GET_VENDOR_FILTER_BY_MODELTYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterOverheadSelectList: { ...state.filterOverheadSelectList, VendorsSelectList: action.payload }
            };
        case GET_MODELTYPE_FILTER_BY_VENDOR_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                filterOverheadSelectList: { ...state.filterOverheadSelectList, modelTypeSelectList: action.payload }
            };
        default:
            return state;
    }
}
