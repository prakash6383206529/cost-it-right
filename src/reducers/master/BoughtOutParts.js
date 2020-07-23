import {
    API_REQUEST,
    API_FAILURE,
    CREATE_BOP_SUCCESS,
    CREATE_BOP_FAILURE,
    GET_BOP_SUCCESS,
    GET_BOP_FAILURE,
    GET_BOP_DOMESTIC_DATA_SUCCESS,
    GET_BOP_IMPORT_DATA_SUCCESS,
    UPDATE_BOP_SUCCESS,
    GET_BOP_CATEGORY_SELECTLIST_SUCCESS,
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
        case API_FAILURE:
            return {
                ...state,
                loading: false
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
        case GET_BOP_DOMESTIC_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                bopData: action.payload
            };
        case GET_BOP_IMPORT_DATA_SUCCESS:
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
        case GET_BOP_CATEGORY_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                bopCategorySelectList: action.payload
            };
        default:
            return state;
    }
}
