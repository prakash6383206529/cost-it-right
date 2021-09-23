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
                    if (userDetails().Department === 'Corporate' || userDetails().Department === 'Administration') {
                        item.PersonRequestingChange = userDetails().Name
                        sr = sr + 1
                        item.SrNo = sr
                        Arr.push(item)
                    } else {
                        if (item.Company === userDetails().Department) {
                            item.PersonRequestingChange = userDetails().Name
                            sr = sr + 1
                            item.SrNo = sr
                            Arr.push(item)
                        }
                    }
                }

            })

            console.log(Arr, "ArrArr");
            return {
                ...state,
                loading: false,
                reportListing: Arr
            }

        default:
            return state;
    }
}