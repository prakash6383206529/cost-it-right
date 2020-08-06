import {
    API_REQUEST,
    CREATE_FUEL_SUCCESS,
    CREATE_FUEL_DETAIL_FAILURE,
    CREATE_FUEL_DETAIL_SUCCESS,
    CREATE_FUEL_FAILURE,
    GET_FUEL_DATALIST_SUCCESS,
    GET_FUEL_UNIT_DATA_SUCCESS,
    GET_FUEL_FAILURE,
    GET_FUEL_DETAIL_SUCCESS,
    GET_FULE_COMBO_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function fuelReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_FUEL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_FUEL_DETAIL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        case CREATE_FUEL_DETAIL_FAILURE:
            return {
                ...state,
                loading: false,
            };
        case CREATE_FUEL_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case GET_FUEL_DATALIST_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelDataList: action.payload
            };
        }
        case GET_FUEL_UNIT_DATA_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelUnitData: action.payload
            };
        }
        case GET_FUEL_DETAIL_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelDetailList: action.payload
            };
        }
        case GET_FULE_COMBO_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false,
                fuelComboSelectList: action.payload
            };
        }
        case GET_FUEL_FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
            };
        default:
            return state;
    }
}
