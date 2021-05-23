import {
    API_REQUEST,
    API_FAILURE,
    GET_TAX_DETAILS_DATA,
} from '../../config/constants';

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
        default:
            return state;
    }
}
