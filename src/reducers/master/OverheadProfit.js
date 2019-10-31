import {
    API_REQUEST,
    API_FAILURE,
    GET_OVERHEAD_PROFIT_SUCCESS,
    GET_OVERHEAD_PROFIT_COMBO_DATA_SUCCESS,
    CREATE_SUCCESS,
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
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        default:
            return state;
    }
}
