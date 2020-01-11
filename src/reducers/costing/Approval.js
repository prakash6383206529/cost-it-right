import {
    API_REQUEST,
    API_FAILURE,
    GET_SEND_FOR_APPROVAL_SUCCESS,
    GET_ALL_APPROVAL_DEPARTMENT,
    GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
} from '../../config/constants';

const initialState = {

};


export default function ApprovalReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_SEND_FOR_APPROVAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                approvalData: action.payload
            };
        case GET_ALL_APPROVAL_DEPARTMENT:
            return {
                ...state,
                loading: false,
                error: true,
                approvalDepartmentList: action.payload
            };
        case GET_ALL_APPROVAL_USERS_BY_DEPARTMENT:
            return {
                ...state,
                loading: false,
                error: true,
                approvalUsersList: action.payload
            };
        default:
            return state;
    }
}
