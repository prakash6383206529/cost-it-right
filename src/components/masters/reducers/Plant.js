import {
    API_REQUEST,
    CREATE_PLANT_SUCCESS,
    CREATE_PLANT_FAILURE,
    GET_PLANT_SUCCESS,
    GET_PLANT_UNIT_SUCCESS,
    GET_PLANT_FAILURE,
    GET_PLANT_FILTER_LIST
} from '../../../config/constants';

const initialState = {

};

export default function plantReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_PLANT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_PLANT_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PLANT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                plantDetail: action.payload
            };
        case GET_PLANT_UNIT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                plantUnitDetail: action.payload
            };
        case GET_PLANT_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PLANT_FILTER_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                plantDataList: action.payload
            }
        default:
            return state;
    }
}
