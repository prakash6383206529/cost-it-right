/** Import constant */
import { EDIT_USER_DATA, RESET_PROPS_DATA, GET_ROLES_FOR_LOGGED_USER } from "../actions/Types";

const INITIAL_STATE = {
    commonData: {},
    editUserData:[],
    loggedUserRoles:[],
    statusList: [],  
    currentProps:""
}

export default (state = INITIAL_STATE, action) =>
{    
    switch(action.type)
            {  
                case EDIT_USER_DATA:
                    return { ...state, editUserData:action.payload};
                case RESET_PROPS_DATA:
                    return { ...state, editUserData:{}};
                case GET_ROLES_FOR_LOGGED_USER:
                   return { ...state, loggedUserRoles:action.payload};       
                default:
                    return state;
            }
}
