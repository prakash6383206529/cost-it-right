import {
    GET_INDEX_SELECTLIST,
    GET_COMMODITY_IN_INDEX_SELECTLIST,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
    GET_INDEXCOMMODITY_DATALIST_SUCCESS,
    GET_COMMODITYININDEX_DATALIST_SUCCESS,
    GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS, GET_INDEXDATA_LIST_SUCCESS, GET_COMMODITY_STANDARD_DATALIST_SUCCESS, GET_COMMODITY_STANDARD_FOR_DOWNLOAD
} from '../../../config/constants';

const initialState = {

};

export default function indexationReducer(state = initialState, action) {
    switch (action.type) {
        case GET_INDEX_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                indexCommodityData: action.payload
            };
        case GET_COMMODITY_IN_INDEX_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                commodityInIndex: action.payload
            };
        case GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE:
            return {
                ...state,
                loading: false,
                error: true,
                customNameCommodityData: action.payload
            };
        case GET_INDEXCOMMODITY_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                indexCommodityDataList: action.payload
            };
        case GET_COMMODITYININDEX_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                commodityInIndexDataList: action.payload
            };
        case GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                standardizedCommodityDataList: action.payload
            };
        case GET_INDEXDATA_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmIndexDataList: action.payload
            };
        case GET_COMMODITY_STANDARD_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                commodityStandardDataList: action.payload
            };
        case GET_COMMODITY_STANDARD_FOR_DOWNLOAD:
            return {
                ...state,
                loading: false,
                error: true,
                commodityStandardForDownload: action.payload
            };
        default:
            return state;
    }
}