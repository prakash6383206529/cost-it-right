import {
    API_REQUEST,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
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
                //supplierList: action.payload
            };
        case CREATE_SUPPLIER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
