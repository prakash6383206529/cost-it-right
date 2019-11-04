import {
    API_REQUEST,
    CREATE_FREIGHT_SUCCESS,
    CREATE_FREIGHT_FAILURE,
    GET_FREIGHT_SUCCESS,
    GET_FREIGHT_FAILURE,
    GET_FREIGHT_DATA_SUCCESS
} from '../../config/constants';

const initialState = {
   
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
        default:
            return state;
    }
}
