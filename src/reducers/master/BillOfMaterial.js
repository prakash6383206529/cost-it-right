import {
    API_REQUEST,
    CREATE_BOM_SUCCESS,
    CREATE_BOM_FAILURE,
    GET_BOM_SUCCESS,
    GET_BOM_FAILURE,
    UPLOAD_BOM_XLS_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function BOMReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_BOM_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_BOM_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_BOM_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                BOMListing: action.payload
            };
        case GET_BOM_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case UPLOAD_BOM_XLS_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        default:
            return state;
    }
}
