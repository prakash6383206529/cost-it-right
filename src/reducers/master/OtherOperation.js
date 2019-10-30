import {
    API_REQUEST,
    API_FAILURE,
    CREATE_OTHER_OPERATION_REQUEST,
    CREATE_OTHER_OPERATION_FAILURE,
    GET_OTHER_OPERATION_SUCCESS,
    GET_OTHER_OPERATION_FAILURE,
    CREATE_OTHER_OPERATION_SUCCESS,
    GET_CED_OTHER_OPERATION_SUCCESS,
    GET_CED_OTHER_OPERATION_FAILURE,
    GET_OPERATION_SUCCESS
} from '../../config/constants';

const initialState = {

};

export default function OtherOperationReducer(state = initialState, action) {
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
        case CREATE_OTHER_OPERATION_REQUEST:
            return {
                ...state,
                loading: false
            };
        case GET_OTHER_OPERATION_SUCCESS:
            return {
                ...state,
                loading: false,
                otherOperationList: action.payload
            };
        case GET_OTHER_OPERATION_FAILURE:
            return {
                ...state,
                loading: false,
                //error: true
            };
        case GET_CED_OTHER_OPERATION_SUCCESS:
            return {
                ...state,
                loading: false,
                cedOtherOperationList: action.payload
            };
        case GET_CED_OTHER_OPERATION_FAILURE:
            return {
                ...state,
                loading: false,
                //error: true
            };
        case GET_OPERATION_SUCCESS:
            return {
                ...state,
                loading: false,
                operationListData: action.payload
            };
        case CREATE_OTHER_OPERATION_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_OTHER_OPERATION_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };

        default:
            return state;
    }
}
