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
            let Arr=[]
           temp && temp.map(item => {
                if (item.Status === CREATED_BY_ASSEMBLY) {
                    return false
                } else {
                    Arr.push(item) 
                    return Arr
                }
            })
            let arr1 = [...state.reportListing, ...Arr]

            return {
                ...state,
                loading: false,
                reportListing: arr1
            }

        default:
            return state;
    }
}