import {
    GET_INDEX_SELECTLIST,
    GET_COMMODITY_IN_INDEX_SELECTLIST,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE,
    GET_INDEXCOMMODITY_DATALIST_SUCCESS,
    GET_COMMODITYININDEX_DATALIST_SUCCESS,
    GET_STANDARDIZEDCOMMODITY_DATALIST_SUCCESS, GET_INDEXDATA_LIST_SUCCESS, GET_COMMODITY_STANDARD_DATALIST_SUCCESS, GET_COMMODITY_STANDARD_FOR_DOWNLOAD,
    GET_OTHER_COST_SELECTLIST, GET_OTHER_COST_APPLICABILITY_SELECTLIST, SET_COMMODITY_DETAILS, SET_OTHER_COST_DETAILS, GET_LAST_REVISION_RAW_MATERIAL_DETAILS
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
        case GET_OTHER_COST_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                otherCostSelectList: action.payload
            };
        case GET_OTHER_COST_APPLICABILITY_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                otherCostApplicabilitySelectList: action.payload
            };
        case SET_COMMODITY_DETAILS:
            return {
                ...state,
                loading: false,
                error: true,
                commodityDetailsArray: action.payload
            };
        case SET_OTHER_COST_DETAILS:
            return {
                ...state,
                loading: false,
                error: true,
                otherCostDetailsArray: action.payload
            };
        case GET_LAST_REVISION_RAW_MATERIAL_DETAILS:
            return {
                ...state,
                loading: false,
                error: true,
                lastRevisionRawMaterialDetails: [action.payload]
            };
        default:
            return state;
    }
}