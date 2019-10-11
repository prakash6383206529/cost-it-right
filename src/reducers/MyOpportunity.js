import {
    MY_OPPORTUNITY_REQUEST,
    MY_OPPORTUNITY_SUCCESS,
    MY_OPPORTUNITY_FAILURE,
    APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS
} from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    draftedOpportunity: [],
    postedOpportunity: [],
    appliedUserList: [],
    myOpportunityType: 0,
};

export default function myOpportunityReducer(state = initialState, action) {
    switch (action.type) {
        case MY_OPPORTUNITY_REQUEST:
            return {
                ...state,
                loading: true
            };
        case MY_OPPORTUNITY_SUCCESS:

            if (action.myOpportunityType == 0) {
                state.draftedOpportunity = action.payload;
            } else if (action.myOpportunityType == 1) {
                state.postedOpportunity = action.payload;
            }
            state.myOpportunityType = action.myOpportunityType;
            return {
                ...state,
                loading: false,
                error: false
            };
        case MY_OPPORTUNITY_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };
        case APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS:
            return {
                ...state,
                loading: false,
                appliedUserList: action.payload,
                error: false
            };
        default:
            return state;
    }
}
