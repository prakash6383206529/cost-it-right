import {
    API_REQUEST,
    CREATE_CATEGORY_TYPE_SUCCESS,
    CREATE_CATEGORY_TYPE_FAILURE,
    CREATE_CATEGORY_FAILURE,
    CREATE_CATEGORY_SUCCESS,
    FETCH_CATEGORY_DATA_FAILURE,
    GET_CATEGORY_DATA_SUCCESS
} from '../../config/constants';

const initialState = {
   
};

export default function categoryReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_CATEGORY_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryList: action.payload
            };
        case FETCH_CATEGORY_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case CREATE_CATEGORY_TYPE_SUCCESS:
            return {
                ...state,
                loading: false, 
            };
        case  CREATE_CATEGORY_SUCCESS: {
            return {
                ...state,
                partData : action.payload,
                loading: false,
                error: false
            };
        }   
        case CREATE_CATEGORY_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case  CREATE_CATEGORY_TYPE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
    
        default:
            return state;
    }
}
