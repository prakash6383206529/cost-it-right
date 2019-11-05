import {
    API_REQUEST,
    API_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CREATE_PROCESS_FAILURE,
    GET_PROCESS_LIST_SUCCESS,
    GET_PROCESS_LIST_FAILURE,
    GET_PROCESS_UNIT_DATA_SUCCESS
} from '../../config/constants';

const initialState = {

};

export default function processReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_PROCESS_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_PROCESS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PROCESS_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                processList: action.payload,
            };
        case GET_PROCESS_UNIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                processUnitData: action.payload,
            };
        case GET_PROCESS_LIST_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        default:
            return state;
    }
}
