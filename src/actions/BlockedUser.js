import axios from 'axios';
import { toastr } from 'react-redux-toastr'
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import {
    BLOCKED_USER_API_REQUEST,
    BLOCKED_USER_SUCCESS,
    BLOCKED_USER_FAILURE,
    BLOCK_TALENT_API_REQUEST,
    BLOCK_TALENT_SUCCESS,
    BLOCK_TALENT_FAILURE
} from '../config/constants';
import { API } from '../config/constants'


const headers = {
    'Content-Type': 'application/json',
};


/**
 * @method getBlockedUserListAPI
 * @description get all blocked user 
 */

export function getBlockedUserListAPI(requestData) {
    return (dispatch) => {
        dispatch({ type: BLOCKED_USER_API_REQUEST });
        axios.post(API.blockedUserList, requestData, { headers })
            .then((response) => {
                if (response.status === 200) {
                    console.log('response.data.data',response.data)
                    dispatch({
                        type: BLOCKED_USER_SUCCESS,
                        payload: response.data.data,
                    });
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            })
            .catch((error) => {
                dispatch({ type: BLOCKED_USER_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method blockTalentAPI
 * @description to block user 
 */
export function blockTalentAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: BLOCK_TALENT_API_REQUEST });
        axios.post(API.blockTalent, requestData, { headers })
            .then((response) => {
                console.log('response: ', response);
                if (response.status === 200) {
                    dispatch({
                        type: BLOCK_TALENT_SUCCESS,
                        payload: response.data.data,
                    });
                    callback(response);
                } else {
                    toastr.error(MESSAGES.SOME_ERROR);
                }
            })
            .catch((error) => {
                dispatch({ type: BLOCK_TALENT_FAILURE });
                apiErrors(error);
            });
    };
}

