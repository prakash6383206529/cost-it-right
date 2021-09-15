import {
    API_REQUEST, CREATED_BY_ASSEMBLY, GET_REPORT_LIST,
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
            let temp = action.payload
            let Arr = temp && temp.map(item => {
                if (item.Status === CREATED_BY_ASSEMBLY) {
                    return false
                } else {
                    return item
                }
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