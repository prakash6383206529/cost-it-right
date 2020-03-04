import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_POWER_DATALIST_SUCCESS,
    GET_POWER_DATA_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function PowerReducer(state = initialState, action) {
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
        case GET_POWER_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                powerList: action.payload,
            };
        case GET_POWER_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                powerData: action.payload,
            };
        default:
            return state;
    }
}
