// /** Import constant */
import {
    AUTH_API_REQUEST,
    AUTH_API_FAILURE,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
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
    SEND_MESSAGE_SUCCESS,
    GET_ROLE_SUCCESS,
    GET_DEPARTMENT_SUCCESS,
    GET_LEVEL_USER_SUCCESS,
    GET_TECHNOLOGY_DATA_LIST_SUCCESS,
    GET_USER_SUCCESS,
    GET_UNIT_ROLE_DATA_SUCCESS,
    GET_UNIT_DEPARTMENT_DATA_SUCCESS,
    GET_UNIT_LEVEL_DATA_SUCCESS,
    GET_ROLES_SELECTLIST_SUCCESS,
    GET_MODULE_SELECTLIST_SUCCESS,
    GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS,
    GET_PAGES_SELECTLIST_SUCCESS,
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
        NumberOfSupplier: "",
        ZBCSupplierInfo: {},
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
        case API_SUCCESS:
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
        case GET_ROLE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                roleList: action.payload
            };
        case GET_UNIT_ROLE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                roleDetail: action.payload
            };
        case GET_DEPARTMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                departmentList: action.payload
            };
        case GET_UNIT_DEPARTMENT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                departmentDetail: action.payload
            };
        case GET_TECHNOLOGY_DATA_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                technologyList: action.payload
            };
        case GET_LEVEL_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                levelList: action.payload
            };
        case GET_UNIT_LEVEL_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                levelDetail: action.payload
            };
        case GET_USER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                userList: action.payload
            };
        case GET_ROLES_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                roleSelectList: action.payload
            };
        case GET_MODULE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                moduleSelectList: action.payload
            };
        case GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                pageSelectListByModule: action.payload
            };
        case GET_PAGES_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                pageSelectList: action.payload
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


