import {
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
    GET_FINANCIAL_YEAR_SELECTLIST,
    GET_VOLUME_DATA_LIST,
    GET_VOLUME_DATA_LIST_FOR_DOWNLOAD,
    GET_VOLUME_LIMIT,
    CHECK_REGULARIZATION_LIMIT
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
            let arr = [];
            arr = action.payload && action.payload.filter((item) => {
                item.plantNameWithCode = `${item.PlantName ?? '-'}${item.PlantCode ? ` (${item.PlantCode})` : ''}`
                item.vendorNameWithCode = `${item.VendorName ?? '-'}${item.VendorCode ? ` (${item.VendorCode})` : ''}`
                item.customerNameWithCode = `${item.CustomerName ?? '-'}${item.CustomerCode ? ` (${item.CustomerCode})` : ''}`
                item.partNoWithRevNo = `${item.PartNumber}${item.RevisionNumber ? ` (${item.RevisionNumber})` : ''}`
                return item
            }
            )
            return {
                ...state,
                loading: false,
                volumeDataList: arr
            }
        case GET_VOLUME_DATA_LIST_FOR_DOWNLOAD:
            let array = []
            array = action.payload && action.payload.filter((item) => {
                item.plantNameWithCode = `${item.PlantName ?? '-'}${item.PlantCode ? ` (${item.PlantCode})` : ''}`
                item.vendorNameWithCode = `${item.VendorName ?? '-'}${item.VendorCode ? ` (${item.VendorCode})` : ''}`
                item.customerNameWithCode = `${item.CustomerName ?? '-'}${item.CustomerCode ? ` (${item.CustomerCode})` : ''}`
                item.partNoWithRevNo = `${item.PartNumber}${item.RevisionNumber ? ` (${item.RevisionNumber})` : ''}`
                return item
            })
            return {
                ...state,
                loading: false,
                volumeDataListForDownload: array
            }
        case GET_VOLUME_LIMIT:
            return {
                ...state,
                loading: false,
                volumeLimitData: action.payload
            };
        case CHECK_REGULARIZATION_LIMIT:
            return {
                ...state,
                loading: false,
                checkRegularizationLimit: action.payload
            };
        default:
            return state;
    }
}
