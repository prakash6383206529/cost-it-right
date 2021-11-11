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
            let arr1 = []
            temp && temp.map(item => {
                if (item.Status === CREATED_BY_ASSEMBLY) {
                    return false
                } else {
                    Arr.push(item) 
                    return Arr
                }
            })

            if (temp.length > 0) {
                arr1 = [...state.reportListing, ...Arr]


            } else {
                arr1 = Arr
            }

            return {
                ...state,
                loading: false,
                reportListing: arr1
            }

        default:
            return state;
    }
}