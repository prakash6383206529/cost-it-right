import {
    API_REQUEST, CREATED_BY_ASSEMBLY, GET_REPORT_LIST,
} from '../../../config/constants';
import { userDetails } from '../../../helper';

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
            let Arr = []
            // if (item.Company === userDetails().Department) {
            let sr = 0
            temp && temp.map((item, index) => {
                if (item.Status === CREATED_BY_ASSEMBLY) {
                    return false
                } else {
                    item.PersonRequestingChange = userDetails().Name
                    sr = ''
                    item.SrNo = sr
                    Arr.push(item)
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