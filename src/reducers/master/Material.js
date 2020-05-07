import {
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_RM_GRADE_LIST_SUCCESS,
    GET_GRADE_DATA_SUCCESS,
    GET_RM_CATEGORY_LIST_SUCCESS,
    GET_RM_SPECIFICATION_LIST_SUCCESS,
    GET_SPECIFICATION_DATA_SUCCESS,
    GET_MATERIAL_LIST_SUCCESS,
    GET_MATERIAL_LIST_TYPE_SUCCESS,
    RAWMATERIAL_ADDED_FOR_COSTING,
    GET_MATERIAL_TYPE_DATA_SUCCESS,
    GET_CATEGORY_DATA_SUCCESS,
    GET_RAW_MATERIAL_DATA_SUCCESS,
    GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS,
    GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS,
    GET_RM_TYPE_DATALIST_SUCCESS,
    GET_RMTYPE_SELECTLIST_SUCCESS,
    GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function materialReducer(state = initialState, action) {
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
        case CREATE_MATERIAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_MATERIAL_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_RM_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialDetail: action.payload
            };
        case GET_RM_GRADE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialGradeDetail: action.payload
            };
        case GET_RM_CATEGORY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rowMaterialCategoryDetail: action.payload
            };
        case GET_RM_SPECIFICATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmSpecificationDetail: action.payload
            };
        case GET_MATERIAL_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmDetail: action.payload
            };
        case GET_MATERIAL_LIST_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rmTypeDetail: action.payload
            };
        case RAWMATERIAL_ADDED_FOR_COSTING:
            return {
                ...state,
                loading: false,
                error: true,
                selectedRawMaterialDetail: action.payload
            };
        case GET_MATERIAL_TYPE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                materialTypeData: action.payload
            };
        case GET_CATEGORY_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                categoryData: action.payload
            };
        case GET_GRADE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                gradeData: action.payload
            };
        case GET_SPECIFICATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                specificationData: action.payload
            };
        case GET_RAW_MATERIAL_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialData: action.payload
            };
        case GET_RAW_MATERIAL_DETAILS_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialDetails: action.payload
            };
        case GET_RAW_MATERIAL_DETAILS_UNIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialDetailsData: action.payload
            };
        case GET_RM_TYPE_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialTypeDataList: action.payload
            };
        case GET_RMTYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                rawMaterialTypeSelectList: action.payload
            };
        case GET_GRADE_BY_RMTYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                gradeByRMTypeSelectList: action.payload
            };
        default:
            return state;
    }
}
