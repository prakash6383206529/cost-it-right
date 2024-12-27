import {
    API_REQUEST,
    CREATE_FREIGHT_SUCCESS,
    CREATE_FREIGHT_FAILURE,
    GET_FREIGHT_SUCCESS,
    GET_FREIGHT_FAILURE,
    GET_FREIGHT_DATA_SUCCESS,
    GET_FREIGHT_MODE_SELECTLIST,
    GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST,
    GET_FREIGHT_RATE_CRITERIA_SELECTLIST,
    GET_ALL_ADDITIONAL_FREIGHT_SUCCESS,
    GET_ADDITIONAL_FREIGHT_DATA_SUCCESS,
    GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS,
    GET_TRUCK_DIMENSIONS_SELECTLIST,
} from '../../../config/constants';

const initialState = {
    freightData: {},
    PackagingData: {},
};

export default function freightReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_FREIGHT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_FREIGHT_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_FREIGHT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                freightDetail: action.payload
            };
        case GET_FREIGHT_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_FREIGHT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                freightData: action.payload
            };
        case GET_ALL_ADDITIONAL_FREIGHT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                packagingDataRows: action.payload
            };
        case GET_ADDITIONAL_FREIGHT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                PackagingData: action.payload
            };
        case GET_ADDITIONAL_FREIGHT_BY_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                additionalFreightData: action.payload
            };
        case GET_FREIGHT_MODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                freightModeSelectList: action.payload
            };
        case GET_FREIGHT_FULL_TRUCK_CAPACITY_SELECTLIST:
            return {
                ...state,
                loading: false,
                freightFullTruckCapacitySelectList: action.payload
            };
        case GET_FREIGHT_RATE_CRITERIA_SELECTLIST:
            return {
                ...state,
                loading: false,
                freightRateCriteriaSelectList: action.payload
            };
        case GET_TRUCK_DIMENSIONS_SELECTLIST:
            return {
                ...state,
                loading: false,
                truckDimensionsSelectList: action.payload
            };
        default:
            return state;
    }
}
