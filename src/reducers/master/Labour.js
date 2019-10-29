import {
    API_REQUEST,
    CREATE_LABOUR_SUCCESS,
    CREATE_LABOUR_FAILURE,
    GET_LABOUR_SUCCESS,
    GET_LABOUR_FAILURE
} from '../../config/constants';

const initialState = {
   
};

export default function labourReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_LABOUR_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_LABOUR_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_LABOUR_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                labourDetail: action.payload
            };
        case GET_LABOUR_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
