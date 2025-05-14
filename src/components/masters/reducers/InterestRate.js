import {
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_COMBO_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_INTEREST_RATE_DATA_SUCCESS,
    GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
    GET_ICC_APPLICABILITY_SELECTLIST,
    GET_INTEREST_RATE_DATA_LIST,
    GET_INVENTORYDAY_TYPE_SELECTLIST,
    GET_WIP_COMPOSITION_METHOD_SELECTLIST
} from '../../../config/constants';

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
                interestRateData: action.payload
            };
        case GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST:
            return {
                ...state,
                loading: false,
                paymentTermsSelectList: action.payload
            };
        case GET_INVENTORYDAY_TYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                inventoryDayTypeSelectList: action.payload
            };
        case GET_WIP_COMPOSITION_METHOD_SELECTLIST:
            return {
                ...state,
                loading: false,
                wipCompositionMethodSelectList: action.payload
            };
        case GET_ICC_APPLICABILITY_SELECTLIST:
            return {
                ...state,
                loading: false,
                iccApplicabilitySelectList: action.payload
            };
        case GET_INTEREST_RATE_DATA_LIST:
            return {
                ...state,
                loading: false,
                interestRateDataList: action.payload
            }
        default:
            return state;
    }
}