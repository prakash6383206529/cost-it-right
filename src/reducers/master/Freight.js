import {
    API_REQUEST,
    CREATE_FREIGHT_SUCCESS,
    CREATE_FREIGHT_FAILURE,
    GET_FREIGHT_SUCCESS,
    GET_FREIGHT_FAILURE,
    GET_FREIGHT_DATA_SUCCESS,
    GET_ALL_ADDITIONAL_FREIGHT_SUCCESS,
    GET_ADDITIONAL_FREIGHT_DATA_SUCCESS,
} from '../../config/constants';

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
        default:
            return state;
    }
}
