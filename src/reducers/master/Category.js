import {
    API_REQUEST,
    CREATE_CATEGORY_TYPE_SUCCESS,
    CREATE_CATEGORY_TYPE_FAILURE,
    CREATE_CATEGORY_FAILURE,
    CREATE_CATEGORY_SUCCESS,
    FETCH_CATEGORY_DATA_FAILURE,
    GET_CATEGORY_DATA_SUCCESS,
    GET_CATEGORY_LIST_SUCCESS,
    GET_CATEGORY_TYPE_LIST_SUCCESS
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
                //categoryTypeList : action.payload,
            };
        case  CREATE_CATEGORY_SUCCESS: {
            return {
                ...state,
                //categoryList : action.payload,
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
        case GET_CATEGORY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryDetail: action.payload
            };
        case GET_CATEGORY_TYPE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryTypeDetail: action.payload
            };
    
        default:
            return state;
    }
}
