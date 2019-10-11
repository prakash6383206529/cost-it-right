/** Import constant */
import { GET_USERS } from "../actions/Types";

/** initialize the state */
const INITIAL_STATE = {
    usersData: {}    
    
}
export default (state = INITIAL_STATE, action) =>
{    
    switch(action.type)
    {   
        case GET_USERS:
            return { ...state, userList:action.payload };         
        default:
            return state;
    }
}