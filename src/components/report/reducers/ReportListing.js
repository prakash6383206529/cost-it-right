import {
    API_REQUEST, GET_REPORT_LIST, GET_ALL_REPORT_LIST,
} from '../../../config/constants';

const initialState = {
    reportListing: [],
    allReportListing: []
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
        case GET_ALL_REPORT_LIST:
            return {
                ...state,
                loading: false,
                allReportListing: action.payload
            }

        default:
            return state;
    }
}