import {
    API_REQUEST,
    CREATE_BOP_SUCCESS,
    CREATE_BOP_FAILURE,
    GET_BOP_SUCCESS,
    GET_BOP_FAILURE,
    GET_BOP_DATA_SUCCESS,
    UPDATE_BOP_SUCCESS
} from '../../config/constants';

const initialState = {

};

export default function BOPReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_BOP_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                BOPListing: action.payload
            };
        case GET_BOP_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_BOP_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                bopData: action.payload
            };
        case UPDATE_BOP_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        default:
            return state;
    }
}
