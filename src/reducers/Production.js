import {
    PRODUCTION_API_REQUEST,
    PRODUCTION_API_FAILURE,
    GET_COMPANY_PROFILE_SUCCESS,
    UPDATE_PRODUCTION_PROFILE_FORM_DATA,
    UPDATE_USER_PRODUCTION_DETAIL_SUCCESS,
    PRODUCTION_PROFILE_IMAGE_SUCCESS,
    PRODUCTION_HEADSHOT_IMAGE_SUCCESS
} from '../config/constants';

/** Always define initialState in reducer so that we don't get undefined values */
const initialState = {
    error: false,
    loading: false,
    masterData: {},
    productionFormData: { productionProfileImage: '', productionHeadshotImage: '' }
};

/**
 * @method profileReducer
 * @description Takes previous state and returns the new state
 * @param {*} state 
 * @param {*} action 
 */

export default (state = initialState, action) => {
    switch (action.type) {
        case PRODUCTION_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case PRODUCTION_API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_COMPANY_PROFILE_SUCCESS:
            return {
                ...state,
                error: '',
                loading: false,
                productionFormData: action.payload
            };

        case UPDATE_PRODUCTION_PROFILE_FORM_DATA:
            return {
                ...state,
                productionFormData: action.payload
            };

        case UPDATE_USER_PRODUCTION_DETAIL_SUCCESS:
            return {
                ...state,
                loading: false
            };

        case PRODUCTION_PROFILE_IMAGE_SUCCESS:
            return {
                ...state,
                loading: false
            };
        case PRODUCTION_HEADSHOT_IMAGE_SUCCESS:
            return {
                ...state,
                loading: false
            };
        default:
            return state;
    }
}
