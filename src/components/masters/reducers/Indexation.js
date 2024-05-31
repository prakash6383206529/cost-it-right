import {
    GET_COMMODITY_SELECTLIST_BY_TYPE,
    GET_COMMODITYNAME_SELECTLIST_BY_TYPE,
    GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE
} from '../../../config/constants';

const initialState = {
    
};

export default function indexationReducer(state = initialState, action) {
    switch (action.type) {
        case GET_COMMODITY_SELECTLIST_BY_TYPE:
            return {
                ...state,
                loading: false,
                error: true,
                indexCommodityData: action.payload
            };
        case GET_COMMODITYNAME_SELECTLIST_BY_TYPE:
            return {
                ...state,
                loading: false,
                error: true,
                nameCommodityData: action.payload
            };
        case GET_COMMODITYCUSTOMNAME_SELECTLIST_BY_TYPE:
            return {
                ...state,
                loading: false,
                error: true,
                customNameCommodityData: action.payload
            };
        default:
            return state;
    }
}