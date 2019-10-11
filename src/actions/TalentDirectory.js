import axios from 'axios';
import { API } from '../config/constants';
import {  MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { toastr } from 'react-redux-toastr'
import { formatGetTalentDirectoryResult } from '../helper/ApiResponse';
import {
    TALENT_DIRECTORY_LISTING_REQUEST,
    GET_TALENT_DIRECTORY_SUCCESS,
    TALENT_DIRECTORY_LISTING_FAILURE,
    UPDATE_TALENT_DIRECTORY_FILTER,
    TALENT_DIRECTORY_FOLLOW_REQUEST,
    TALENT_DIRECTORY_FOLLOW_SUCCESS,
    TALENT_DIRECTORY_FOLLOW_FAIL,
    UPDATE_FOLLOW_UNFOLLOW_FLAG,
    //CLEAR_TALENT_DIRECTORY_REDUCER,
    //RESET_APP,
    SEARCH_TEXT_DATA_ON_BACK
} from '../config/constants';

const headers = {
    'Content-Type': 'application/json',
};

/**
 * @method getTalentDirectoryAPI
 * @description get all Talent directory list by talent directory API by userId 
 */
export function getTalentDirectoryAPI(data, loadMore = false, callback) {
    return (dispatch) => {
        dispatch({ type: TALENT_DIRECTORY_LISTING_REQUEST });
        const request = axios.get(`${API.getTalentDirectoryList}?${data}`, { headers });
        request.then((response) => {
            if (response.status === 200) {
                const talentDirectoryFormatedData = formatGetTalentDirectoryResult(response.data);
                dispatch({
                    type: GET_TALENT_DIRECTORY_SUCCESS,
                    payload: talentDirectoryFormatedData,
                    loadMore,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
           
        }).catch((error) => {
            dispatch({ type: TALENT_DIRECTORY_LISTING_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method followUnfollowTalentProfile
 * @description used to call the follow unfollow API
 */
export function followUnfollowTalentProfile(requestData, matchedTalentDirectoryList, callback) {
    return (dispatch) => {
        dispatch({ type: TALENT_DIRECTORY_FOLLOW_REQUEST });
        axios.post(API.followTalentProfile, requestData, { headers })
            .then((response) => {
                //console.log('followUnfollowTalentProfile requestData', JSON.stringify(response));
                updateTalentDirectoryIsFollowedFlag(dispatch, matchedTalentDirectoryList, requestData.talentId, () => {
                    dispatch({ type: TALENT_DIRECTORY_FOLLOW_SUCCESS });
                    callback(response);
                });
            }).catch((error) => {
                dispatch({ type: TALENT_DIRECTORY_FOLLOW_FAIL });
                apiErrors(error);
            });
    };
}

/**
 * @method updateTalentDirectoryIsFollowedFlag
 * @description used to update the Follow Unfollow flag by talentId
 */
function updateTalentDirectoryIsFollowedFlag(dispatch, talentDirectoryData, talentId, cb) {
    const matchedTalentDirectoryList = talentDirectoryData;
    matchedTalentDirectoryList.map(item => {
        if (item.userDeatil.id === talentId) {
            if (item.isFollowed == true) {
                item.isFollowed = false;
            } else {
                item.isFollowed = true;
            }
        }
        return item;
    });
    dispatch({ type: UPDATE_FOLLOW_UNFOLLOW_FLAG, payload: matchedTalentDirectoryList });
    cb();
}

/**
 * @method updateTalentDirectoryListFilter
 * @description used to update the Talent Directory Filter
 */
export function updateTalentDirectoryListFilter(talentDirectoryFilterData) {
    return (dispatch) => {
        dispatch({ type: TALENT_DIRECTORY_LISTING_REQUEST });
        dispatch({ type: UPDATE_TALENT_DIRECTORY_FILTER, payload: talentDirectoryFilterData });
    };
}

/**
 * @method followUnfollowTalentProfileByProfile
 * @description used to call the follow unfollow API
 */
export function followUnfollowTalentProfileByProfile(requestData, callback) {
    return (dispatch) => { dispatch({ type: TALENT_DIRECTORY_FOLLOW_REQUEST });
        axios.post(API.followTalentProfile, requestData, { headers })
            .then((response) => {
                    dispatch({ type: TALENT_DIRECTORY_FOLLOW_SUCCESS });
                    callback(response);
            }).catch((error) => {
                dispatch({ type: TALENT_DIRECTORY_FOLLOW_FAIL });
                apiErrors(error);
            });
    };
}

/**
 * @method searchTextOnBackClick
 * @description used to call the follow unfollow API
 */
export function searchTextOnBackClick(name){  
    return (dispatch) => {
        dispatch({
            type:  SEARCH_TEXT_DATA_ON_BACK,
            payload: name
        });

    }
}