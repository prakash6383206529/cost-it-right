import {
    ROLES_API_REQUEST,
    ROLES_API_FAILURE,
    GET_OPPORTUNITY_ROLE_SUCCESS,
    ADD_OPPORTUNITY_ROLE_SUCCESS,
    DELETE_OPPORTUNITY_ROLE_SUCCESS,
    UPDATE_OPPORTUNITY_ROLE_SUCCESS,
    APPLY_OPPORTUNITY_ROLE_SUCCESS,
    EDIT_INDEX_ROLE
} from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    opportunityRoles: [],
    roleUpdateIndex: ''
};

export default function opportunityRoleReducer(state = initialState, action) {
    switch (action.type) {
        case ROLES_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_OPPORTUNITY_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                opportunityRoles: action.payload,
                error: false
            };
        case ADD_OPPORTUNITY_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };
        case ROLES_API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case DELETE_OPPORTUNITY_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        case UPDATE_OPPORTUNITY_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        case APPLY_OPPORTUNITY_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };
        case EDIT_INDEX_ROLE:
            return {
                ...state,
                loading: false,
                error: false,
                roleUpdateIndex: action.payload
            }    
        default:
            return state;
    }
}
