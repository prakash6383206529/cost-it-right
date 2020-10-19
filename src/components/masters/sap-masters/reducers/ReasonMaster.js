import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_REASON_DATA_SUCCESS,
    GET_REASON_SUCCESS,
} from '../../../../config/constants';

const initialState = {

};

export default function ReasonReducer(state = initialState, action) {
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
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_REASON_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                reasonDataList: action.payload,
            };
        case GET_REASON_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                reasonData: action.payload,
            };
        default:
            return state;
    }
}
