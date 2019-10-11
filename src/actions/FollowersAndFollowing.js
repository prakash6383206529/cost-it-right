import axios from 'axios';
import { toastr } from "react-redux-toastr";
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { formatGetFollowingResult, formatGetFollowersResult } from '../helper/ApiResponse';
import {
    API,
    MY_OPPORTUNITY_REQUEST,
    MY_OPPORTUNITY_FAILURE,
    FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST,
    GET_FOLLOWING_LISTING_SUCCESS,
    FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE,
    GET_FOLLOWERS_LISTING_SUCCESS,
    DELTE_OPPORTUNITY_FAILURE,
    APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS,
    TALENT_FOLLOW_REQUEST,
    TALENT_FOLLOW_FAILURE,
    TALENT_FOLLOW_SUCCESS,
    UPDATE_FOLLOWING_FLAG,
    UPDATE_FOLLOWER_FLAG
} from '../config/constants';

const headers = {
    'Content-Type': 'application/json',
};

/**
* @method getFollowingListAPI
* @description Used to get opportunity created and posted by me 
*/
export function getFollowingListAPI(data, loadMore = false, callback) {
    //console.log('getFollowingListAPI', data);
    
    return (dispatch) => {
        dispatch({ type: FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST });
        const request = axios.get(`${API.followingListing}?${data}`, { headers });
        request.then((response) => {
            //console.log("getFollowingListAPI=>", response);
            if (response.status === 200) {
                const followingFormatedData = formatGetFollowingResult(response.data);
                //console.log("followingFormatedData=>" + JSON.stringify(followingFormatedData));
                dispatch({
                    type: GET_FOLLOWING_LISTING_SUCCESS,
                    payload: followingFormatedData,
                    loadMore
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log("getFollowingListAPI error =>" + JSON.stringify(error.response));
            dispatch({ type: FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method getFollowersListAPI
* @description Used to get opportunity created and posted by me 
*/

export function getFollowersListAPI(data, loadMore = false, callback) {
    return (dispatch) => {
        dispatch({ type: FOLLOWING_AND_FOLLOWERS_LISTING_REQUEST });
        const request = axios.get(`${API.followerListing}?${data}`, { headers });
        request.then((response) => {
            //console.log("getFollowersListAPI=>" ,response);
            const followersFormatedData = formatGetFollowersResult(response.data);
            //console.log("getFollowersListAPI=======>" ,followersFormatedData);
            if (response.status === 200) {
                dispatch({
                    type: GET_FOLLOWERS_LISTING_SUCCESS,
                    payload: followersFormatedData,
                    loadMore
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log("getFollowersListAPI error =>" + JSON.stringify(error.response));
            dispatch({ type: FOLLOWING_AND_FOLLOWERS_LISTING_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method deleteOpportunityAPI
* @description Used to delete opportunity created and posted by me 
*/

export function deleteOpportunityAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: MY_OPPORTUNITY_REQUEST });
        axios.delete(`${API.deleteCastingCall}`, requestData, { headers })
            .then((response) => {
                dispatch({ type: DELTE_OPPORTUNITY_FAILURE });
                callback(response);
            }).catch((error) => {
                dispatch({ type: MY_OPPORTUNITY_FAILURE });
                apiErrors(error);
            });
    };
}


export function getAppliedUserListOnOpportunityAPI(opportunityId) {
    return (dispatch) => {
        dispatch({ type: MY_OPPORTUNITY_REQUEST });
        const request = axios.get(`${API.appliedUsersList}?opportunityId=${opportunityId}`, { headers });
        request.then((response) => {
            //console.log('ACTION' + JSON.stringify(response));
            if (response.status === 200) {
                dispatch({
                    type: APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS,
                    payload: response.data.userDetails,
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: MY_OPPORTUNITY_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method followUnfollowTalentProfile
 * @description used to call the follow unfollow API
 */
export function followUnfollowTalent(requestData, matchedTalentDirectoryList, isLoggedInUser, typeOfTalent, callback) {
    return (dispatch) => {
        //console.log('followUnfollowTalentProfile requestData', requestData);
        dispatch({ type: TALENT_FOLLOW_REQUEST });
        axios.post(API.followTalentProfile, requestData, { headers })
            .then((response) => {
                if (typeOfTalent === 'Following' && isLoggedInUser === true) {
                    updateTalentDirectoryIsFollowedFlag(dispatch, matchedTalentDirectoryList, typeOfTalent, requestData.talentId, () => {
                        callback(response);
                    });
                } else {
                    dispatch({ type: TALENT_FOLLOW_SUCCESS });
                    callback(response);
                }
            }).catch((error) => {
                //console.log('followUnfollowTalentProfile error', error)
                dispatch({ type: TALENT_FOLLOW_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method updateTalentDirectoryIsFollowedFlag
 * @description used to update the Follow Unfollow flag by talentId
 */
function updateTalentDirectoryIsFollowedFlag(dispatch, talentDirectoryData, typeOfTalent, talentId, cb) {

    let withoutEl = talentDirectoryData.filter((item) => { return item.userDeatil.id !== talentId; });


    if (typeOfTalent === 'Follower') {
        dispatch({ type: UPDATE_FOLLOWER_FLAG, payload: withoutEl });
    } else if (typeOfTalent === 'Following') {
        dispatch({ type: UPDATE_FOLLOWING_FLAG, payload: withoutEl });
    }
    cb();
}

