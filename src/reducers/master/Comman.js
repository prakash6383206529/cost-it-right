import {
    API_REQUEST,
    GET_UOM_DATA_SUCCESS,
    GET_MATERIAL_TYPE_SUCCESS,
    GET_PART_SUCCESS,
    FETCH_MATER_DATA_FAILURE,
    GET_COUNTRY_SUCCESS,
    GET_STATE_SUCCESS,
    GET_CITY_SUCCESS,
    GET_PLANT_SUCCESS,
    GET_ROW_MATERIAL_SUCCESS,
    GET_GRADE_SUCCESS,
    GET_TECHNOLOGY_LIST_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_SUCCESS,
    GET_OTHER_OPERATION_FORMDATA_FAILURE,
    GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS,
    GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE,
    GET_MHR_COMBO_DATA_SUCCESS,
    DATA_FAILURE
} from '../../config/constants';

const initialState = {
    technologyList: []
};

export default function commanReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_UOM_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                uniOfMeasurementList: action.payload
            };
        case GET_MATERIAL_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                materialTypeList: action.payload
            };
        case GET_PART_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                partList: action.payload
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
        case GET_PLANT_SUCCESS:
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
        case FETCH_MATER_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_TECHNOLOGY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                technologyList: action.payload
            };
        case GET_OTHER_OPERATION_FORMDATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                otherOperationFormData: action.payload
            };
        case GET_OTHER_OPERATION_FORMDATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_CED_OTHER_OPERATION_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                cedOtherOperationComboData: action.payload
            };
        case GET_CED_OTHER_OPERATION_COMBO_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_MHR_COMBO_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                comboDataMHR: action.payload
            };
        case DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
