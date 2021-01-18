import {
    API_REQUEST,
    API_FAILURE,
    GET_CLIENT_DATA_SUCCESS,
    GET_CLIENT_SELECTLIST_SUCCESS,
    GET_CLIENT_DATALIST_SUCCESS,
} from '../../../config/constants';

const initialState = {

};

export default function ClientReducer(state = initialState, action) {
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
        case GET_CLIENT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                clientData: action.payload
            };
        case GET_CLIENT_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                clientSelectList: action.payload
            };
        case GET_CLIENT_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                clientDataList: action.payload
            };
        default:
            return state;
    }
}
