import {
    MESSAGE_API_REQUEST,
    MESSAGE_API_FAILURE,
    SEND_CHAT_MESSAGE_SUCCESS,
    GET_MUTUAL_FOLLOWER_LIST_SUCCESS,
    GET_MESSAGE_LIST_SUCCESS,
    GET_MESSAGE_DETAILS,
} from '../config/constants';

const initialState = {
    error: false,
    sendMessageLoading: false,
    mutualFollowerList: [],
    mutualFollowerListOfUser: [],
    deletedUserList: [],
    archieveUserList: [],
    listType: 0,
    inboxCount: 0
};

/**
 * @method messageReducer
 * @description Takes previous state and returns the new state
 * @param {*} state 
 * @param {*} action 
 */
export default function messageReducer(state = initialState, action) {
    switch (action.type) {
        case MESSAGE_API_REQUEST:
            return {
                ...state,
                sendMessageLoading: true
            };
        case MESSAGE_API_FAILURE:
            return {
                ...state,
                sendMessageLoading: false,
                error: true
            };
        case SEND_CHAT_MESSAGE_SUCCESS:
            return {
                ...state,
                error: false,
                sendMessageLoading: false
            };
        case GET_MUTUAL_FOLLOWER_LIST_SUCCESS:
            return {
                ...state,
                error: false,
                sendMessageLoading: false,
                mutualFollowerList: action.payload,
            };
            case GET_MESSAGE_DETAILS :
                return {
                    ...state,
                    getMessageDetails : action.payload ,
                   
                }
        case GET_MESSAGE_LIST_SUCCESS:
            if (action.listType == 1) {
                    state.mutualFollowerListOfUser = action.payload;
                    state.inboxCount = action.inboxCount;
                } else if (action.listType == 2) {
                    state.archieveUserList = action.payload;
                }else if (action.listType == 3) {
                    state.deletedUserList = action.payload;
                }
                state.listType = action.listType;
                    return {
                        ...state,
                        error: false,
                        sendMessageLoading: false,
                   };
        default:
            return state;
    }
}
