import {
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
    GET_VOLUME_DATA_LIST,
    GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
    GET_VOLUME_LIMIT
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
            return {
                ...state,
                loading: false,
                volumeDataList: action.payload
            }
        case GET_VOLUME_DATA_LIST_FOR_DOWNLOAD:
            return {
                ...state,
                loading: false,
                volumeDataListForDownload: action.payload
            }
        case GET_VOLUME_LIMIT:
            return {
                ...state,
                loading: false,
                volumeLimitData: action.payload
            };
        default:
            return state;
    }
}
