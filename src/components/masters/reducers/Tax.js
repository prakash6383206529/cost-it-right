import {
    API_REQUEST,
    API_FAILURE,
    GET_TAX_DETAILS_DATA,
    GET_TAX_DETAILS_DATALIST
} from '../../../config/constants';

const initialState = {

};

export default function TaxReducer(state = initialState, action) {
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
        case GET_TAX_DETAILS_DATA:
            return {
                ...state,
                loading: false,
                taxDetailsData: action.payload
            };
        case GET_TAX_DETAILS_DATALIST:
            return {
                ...state,
                loading: false,
                taxDataList: action.payload
            }
        default:
            return state;
    }
}
