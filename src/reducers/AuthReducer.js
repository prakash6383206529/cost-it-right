// /** Import constant */
import {
    AUTH_API_REQUEST,
    AUTH_API_FAILURE,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,
    LOGIN_SUCCESS,
    REGISTER_SUCCESS,
    GET_ROLE_SUCCESS,
    GET_DEPARTMENT_SUCCESS,
    GET_LEVEL_USER_SUCCESS,
    GET_TECHNOLOGY_DATA_LIST_SUCCESS,
    GET_USER_SUCCESS,
    GET_USER_DATA_SUCCESS,
    GET_USER_UNIT_DATA_SUCCESS,
    GET_UNIT_ROLE_DATA_SUCCESS,
    GET_UNIT_DEPARTMENT_DATA_SUCCESS,
    GET_UNIT_LEVEL_DATA_SUCCESS,
    GET_ROLES_SELECTLIST_SUCCESS,
    GET_MODULE_SELECTLIST_SUCCESS,
    GET_PAGE_SELECTLIST_BY_MODULE_SUCCESS,
    GET_PAGES_SELECTLIST_SUCCESS,
    GET_ACTION_HEAD_SELECTLIST_SUCCESS,
    GET_MENU_BY_USER_DATA_SUCCESS,
    GET_LEFT_MENU_BY_MODULE_ID_AND_USER,
    LOGIN_PAGE_INIT_CONFIGURATION,
    GET_USERS_BY_TECHNOLOGY_AND_LEVEL,
    GET_LEVEL_BY_TECHNOLOGY,
    GET_MENU_BY_MODULE_ID_AND_USER,
    LEVEL_MAPPING_API,
    GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS,
    SIMULATION_LEVEL_DATALIST_API,
    GET_SIMULATION_LEVEL_BY_TECHNOLOGY,
    GET_TOP_AND_LEFT_MENU_DATA,
    GET_MASTER_SELECT_LIST,
    MASTER_LEVEL_DATALIST_API,
    GET_MASTER_LEVEL_BY_MASTERID,
    COSTINGS_APPROVAL_DASHBOARD,
    AMENDMENTS_APPROVAL_DASHBOARD,
    RM_APPROVAL_DASHBOARD,
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
        LoggedInUserId: '',
        LoggedInLevelId: '',
        firstName: '',
        lastName: '',
        UserName: '',
        Email: '',
        AccessToken: '',
        Company: '',
        CompanyId: '',
        Mobile: '',
        NumberOfSupplier: '',
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
        case GET_USER_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                userDataList: action.payload
            };
        case GET_USER_UNIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                registerUserData: action.payload
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
        case GET_ACTION_HEAD_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                actionSelectList: action.payload
            };
        case GET_MENU_BY_USER_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                menusData: action.payload
            };
        case GET_LEFT_MENU_BY_MODULE_ID_AND_USER:
            return {
                ...state,
                loading: false,
                error: true,
                leftMenuData: action.payload
            };
        case GET_MENU_BY_MODULE_ID_AND_USER:
            return {
                ...state,
                loading: false,
                error: true,
                menuData: action.payload
            };
        case LOGIN_PAGE_INIT_CONFIGURATION:
            return {
                ...state,
                loading: false,
                error: true,
                initialConfiguration: action.payload
            };
        case GET_USERS_BY_TECHNOLOGY_AND_LEVEL:
            return {
                ...state,
                loading: false,
                error: true,
                usersListByTechnologyAndLevel: action.payload
            }
        case GET_LEVEL_BY_TECHNOLOGY:
            return {
                ...state,
                loading: false,
                error: true,
                levelSelectList: action.payload
            }
        case LEVEL_MAPPING_API:
            return {
                ...state,
                loading: false,
                error: true,
                levelMappingList: action.payload
            }
        case GET_SIMULATION_TECHNOLOGY_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                simulationTechnologyList: action.payload
            };
        case SIMULATION_LEVEL_DATALIST_API:
            return {
                ...state,
                loading: false,
                error: true,
                simulationLevelDataList: action.payload
            };

        case GET_SIMULATION_LEVEL_BY_TECHNOLOGY:
            return {
                ...state,
                loading: false,
                error: true,
                simulationLevelSelectList: action.payload
            }
        case GET_MASTER_LEVEL_BY_MASTERID:
            return {
                ...state,
                loading: false,
                error: true,
                masterLevelSelectList: action.payload
            }
        case GET_TOP_AND_LEFT_MENU_DATA:
            return {
                ...state,
                loading: false,
                error: true,
                topAndLeftMenuData: action.payload
            }
        case GET_MASTER_SELECT_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                masterList: action.payload
            }
        case MASTER_LEVEL_DATALIST_API:
            return {
                ...state,
                loading: false,
                error: true,
                masterLevelDataList: action.payload
            };
        case COSTINGS_APPROVAL_DASHBOARD:
            return {
                ...state,
                loading: false,
                error: true,
                CostingsApprovalDashboard: action.payload
            };
        case AMENDMENTS_APPROVAL_DASHBOARD:
            return {
                ...state,
                loading: false,
                error: true,
                AmendmentsApprovalDashboard: action.payload
            };
        case RM_APPROVAL_DASHBOARD:
            return {
                ...state,
                loading: false,
                error: true,
                RMApprovalDashboard: action.payload
            };
        default:
            return state;
    }
}



