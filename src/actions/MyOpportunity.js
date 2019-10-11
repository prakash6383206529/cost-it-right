import axios from 'axios';
import { toastr } from "react-redux-toastr";
import { reactLocalStorage } from 'reactjs-localstorage';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import {
    API,
    MY_OPPORTUNITY_REQUEST,
    MY_OPPORTUNITY_SUCCESS,
    MY_OPPORTUNITY_FAILURE,
    DELTE_OPPORTUNITY_FAILURE,
    APPLIED_USER_LIST_FOR_OPPORTUNITY_SUCCESS
} from '../config/constants';

/**
* @method getMyOpportunitiesAPI
* @description Used to get opportunity created and posted by me 
*/
export function getMyOpportunitiesAPI(myOpportunityType) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: MY_OPPORTUNITY_REQUEST });
        const request = axios.get(`${API.myCastingCall}?myOpportunityType=${myOpportunityType}`, { headers });
        request.then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: MY_OPPORTUNITY_SUCCESS,
                    payload: response.data.data,
                    myOpportunityType
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
* @method deleteOpportunityAPI
* @description Used to delete opportunity created and posted by me 
*/
export function deleteOpportunityAPI(requestData, callback) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: MY_OPPORTUNITY_REQUEST });
        axios.delete(`${API.deleteCastingCall}`, { headers: headers, data: requestData })
            .then((response) => {
                dispatch({ type: DELTE_OPPORTUNITY_FAILURE });
                callback(response);
            }).catch((error) => {
                dispatch({ type: MY_OPPORTUNITY_FAILURE });
                apiErrors(error);
            });
    };
}

/**
* @method getAppliedUserListOnOpportunityAPI
* @description Used to see applied user list
*/
export function getAppliedUserListOnOpportunityAPI(opportunityId) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Accept': 'application/json',
        // 'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: MY_OPPORTUNITY_REQUEST });
        const request = axios.get(`${API.appliedUsersList}?opportunityId=${opportunityId}`, { headers });
        request.then((response) => {
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
