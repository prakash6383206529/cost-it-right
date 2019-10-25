import {
    API_REQUEST,
    API_FAILURE,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
    GET_RM_LIST_SUCCESS,
    GET_RM_GRADE_LIST_SUCCESS,
    GET_RM_CATEGORY_LIST_SUCCESS,
    GET_RM_SPECIFICATION_LIST_SUCCESS
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
        default:
            return state;
    }
}
