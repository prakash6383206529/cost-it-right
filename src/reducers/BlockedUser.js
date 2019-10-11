import {
    BLOCKED_USER_API_REQUEST,
    BLOCKED_USER_SUCCESS,
    BLOCKED_USER_FAILURE,
    BLOCK_TALENT_API_REQUEST,
    BLOCK_TALENT_SUCCESS,
    BLOCK_TALENT_FAILURE
} from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    blockedUserList: [],
};

export default function blockedUserListReducer(state = initialState, action) {
    switch (action.type) {
        case BLOCKED_USER_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case BLOCKED_USER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case BLOCKED_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                blockedUserList: action.payload,
                error: false
            };
        case BLOCK_TALENT_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case BLOCK_TALENT_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case BLOCK_TALENT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };
        default:
            return state;
    }
}
