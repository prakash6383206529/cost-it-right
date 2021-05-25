import {
    API_REQUEST, GET_REPORT_LIST,
} from '../../../config/constants';

const initialState = {

};

export default function ReportListingReducers(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_REPORT_LIST:
            return {
                ...state,
                loading: false,
                reportListing: action.payload
            }

        default:
            return state;
    }
}