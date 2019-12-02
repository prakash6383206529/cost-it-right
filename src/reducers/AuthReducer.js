// /** Import constant */
import {
    AUTH_API_REQUEST,
    AUTH_API_FAILURE,
    LOGIN_SUCCESS,
    UPDATE_PASSWORD_SUCCESS,
    REGISTER_SUCCESS,
    FORGOT_PASSWORD_SUCCESS,
    UPDATE_INTRO_STATUS,
    VERIFY_OTP_SUCCESS,
    RESEND_OTP_SUCCESS,
    SOCIAL_MEDIA_LOGIN_SUCCESS,
    LOGOUT_SUCCESS,
    UPDATE_USER_ACCOUNT_DETAIL_SUCCESS,
    SOCIAL_USER_DATA,
    FETCH_USER_DATA,
    INTERNAL_ROUTE_ID,
    SEND_MESSAGE_SUCCESS
} from '../../src/config/constants'

// /** Always define initialState in reducer so that we don't get undefined values */
const initialState = {
    error: false,
    isIntroShowed: false,
    loading: false,
    email: '',
    password: '',
    userData: {
        id: '',
        LoggedInUserId: "",
        firstName: '',
        lastName: '',
        UserName: "",
        Email: "",
        AccessToken: "",
        Company: "",
        CompanyId: "",
        Mobile: "",
        Permissions: [],
        Plants: [],
        Roles: [],
        Title: null,
    },
    //internalRouteID: {}
};

// /**
//  * @method authReducer
//  * @description Takes previous state and returns the new state
//  * @param {*} state 
//  * @param {*} action 
//  */
export default function authReducer(state = initialState, action) {
    switch (action.type) {
        case AUTH_API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case AUTH_API_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                userData: action.payload,
                error: false,
                loading: false
            };
        // 		case UPDATE_PASSWORD_SUCCESS:
        // 			return {
        // 				...state,
        // 				error: false,
        // 				loading: false
        // 			};

        // 		case SOCIAL_MEDIA_LOGIN_SUCCESS:
        // 			return {
        // 				...state,
        // 				userData: action.payload,
        // 				error: '',
        // 				loading: false
        // 			};
        // 		case UPDATE_USER_ACCOUNT_DETAIL_SUCCESS:
        // 			return {
        // 				...state,
        // 				userData: action.payload,
        // 				loading: false
        // 			};
        case REGISTER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        // 		case FORGOT_PASSWORD_SUCCESS:
        // 			return {
        // 				...state,
        // 				loading: false
        // 			};
        // 		case VERIFY_OTP_SUCCESS:
        // 			return {
        // 				...state,
        // 				loading: false
        // 			};

        // 		case RESEND_OTP_SUCCESS:
        // 			return {
        // 				...state,
        // 				loading: false
        // 			};

        // 		case FETCH_USER_DATA:
        // 			{
        // 				return {
        // 					...state,
        // 					userData: {
        // 						...state.userData,
        // 						...action.payload
        // 					}
        // 				};
        // 			}
        // 		case UPDATE_INTRO_STATUS:
        // 			return {
        // 				...state,
        // 				isIntroShowed: action.payload,
        // 			};
        // 		case LOGOUT_SUCCESS:
        // 			return {
        // 				...state,
        // 				loading: false
        // 			};
        // 		case SOCIAL_USER_DATA:
        // 			return {
        // 				...state,
        // 				socialUserData: action.payload,
        // 				loading: false
        // 			};
        // 		// case INTERNAL_ROUTE_ID:
        // 		// 	return {
        // 		// 		...state,
        // 		// 		internalRouteID: action.payload,
        // 		// 	};	
        // 		case SEND_MESSAGE_SUCCESS :
        // 			return {

        // 			}
        default:
            return state;
    }
}


