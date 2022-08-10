import {
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
    GET_VOLUME_DATA_LIST,
} from '../../../config/constants';

const initialState = {

};

export default function VolumeReducer(state = initialState, action) {
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
        case GET_VOLUME_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                volumeData: action.payload
            };
        case GET_FINANCIAL_YEAR_SELECTLIST:
            return {
                ...state,
                loading: false,
                financialYearSelectList: action.payload
            };
        case GET_VOLUME_DATA_LIST:
            let arr = []
            arr = action.payload && action.payload.filter((el, i) => {
                if (el.IsVendor === true) {
                    el.IsVendor = "Vendor Based"
                } else {
                    el.IsVendor = "Zero Based"
                }
                return true
            })
            return {
                ...state,
                loading: false,
                volumeDataList: arr
            }
        default:
            return state;
    }
}
