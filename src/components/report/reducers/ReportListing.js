import {
    API_REQUEST, CREATED_BY_ASSEMBLY, GET_REPORT_LIST,
} from '../../../config/constants';

const initialState = {
    reportListing: []
};

export default function ReportListingReducers(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_REPORT_LIST:
            let temp = action.payload
            let Arr = []
            temp && temp.map(item => {
                Arr.push(item)
                return Arr

            })

            return {
                ...state,
                loading: false,
                reportListing: Arr
            }

        default:
            return state;
    }
}