import {
    API_REQUEST,
    API_FAILURE,
    GET_INTEREST_RATE_COMBO_DATA_SUCCESS,
    CREATE_SUCCESS,
    GET_INTEREST_RATE_DATA_SUCCESS,
    GET_PAYMENT_TERMS_APPLICABILITY_SELECTLIST,
    GET_ICC_APPLICABILITY_SELECTLIST,
    GET_INTEREST_RATE_DATA_LIST
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
        case GET_ICC_APPLICABILITY_SELECTLIST:
            return {
                ...state,
                loading: false,
                iccApplicabilitySelectList: action.payload
            };
        case GET_INTEREST_RATE_DATA_LIST:
            let arr = []
            arr = action.payload && action.payload.filter((el, i) => {
                if (el.IsVendor === true) {
                    el.IsVendor = "Vendor Based"
                } else {
                    el.IsVendor = "Zero Based"
                }
                return true
            })

            return {
                ...state,
                loading: false,
                interestRateDataList: arr
            }
        default:
            return state;
    }
}