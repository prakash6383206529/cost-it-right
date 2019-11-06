import {
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_SUCCESS,
    GET_INTEREST_RATE_COMBO_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_INTEREST_RATE_DATA_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function InterestRateReducer(state = initialState, action) {
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
        case GET_INTEREST_RATE_SUCCESS:
            return {
                ...state,
                loading: false,
                interestRateList: action.payload
            };
        case GET_INTEREST_RATE_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                interestRateComboData: action.payload
            };
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case GET_INTEREST_RATE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                interestRateDetail: action.payload
            };
        default:
            return state;
    }
}