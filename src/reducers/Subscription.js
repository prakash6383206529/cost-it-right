import {
    SUBSCRIPTION_PLANS_REQUEST,
    SUBSCRIPTION_PLANS_FAILURE,
    GET_SUBSCRIPTION_PLANS_SUCCESS,
    PLAN_SUBSCRIPTION_PLANS_SUCCESS
} from '../config/constants';

const initialState = {
    error: false,
    loading: false,
    subscriptionPlanList: [],

};

export default function myOpportunityReducer(state = initialState, action) {
    switch (action.type) {
        case SUBSCRIPTION_PLANS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case SUBSCRIPTION_PLANS_FAILURE:
            return {
                ...state,
                loading: false,
                error: false
            };
        case GET_SUBSCRIPTION_PLANS_SUCCESS:
            return {
                ...state,
                loading: false,
                subscriptionPlanList: action.payload,
                error: false
            };
        case PLAN_SUBSCRIPTION_PLANS_SUCCESS:
            return {
                ...state,
                loading: false,
                error: false
            };

        default:
            return state;
    }
}
