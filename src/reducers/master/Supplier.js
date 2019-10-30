import {
    API_REQUEST,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    GET_SUPPLIER_SUCCESS,
    GET_SUPPLIER_FAILURE
} from '../../config/constants';

const initialState = {
   
};

export default function supplierReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_SUPPLIER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                supplierDetail: action.payload
            };
        case GET_SUPPLIER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
