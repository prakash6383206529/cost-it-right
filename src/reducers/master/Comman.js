import {
    API_REQUEST,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS,
    GET_ROW_MATERIAL_SUCCESS,
    GET_GRADE_SUCCESS
} from '../../config/constants';

const initialState = {
   
};

export default function commanReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_COUNTRY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                countryList: action.payload
            };
        case GET_STATE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                stateList: action.payload
            };
        case GET_CITY_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                cityList: action.payload
            };
        case  GET_PLANT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                plantList: action.payload
            };
        case GET_ROW_MATERIAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialList: action.payload
            };
        case GET_GRADE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmGradeList: action.payload
            };
        case  FETCH_MATER_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
