import axios from 'axios';
import {
    API, 
    ROLES_API_REQUEST,
    ROLES_API_FAILURE,
    GET_OPPORTUNITY_ROLE_SUCCESS,
    DELETE_OPPORTUNITY_SUCCESS,
    ADD_OPPORTUNITY_ROLE_SUCCESS,
    DELETE_OPPORTUNITY_ROLE_SUCCESS,
    UPDATE_OPPORTUNITY_ROLE_SUCCESS,
    APPLY_OPPORTUNITY_ROLE_SUCCESS,
    EDIT_INDEX_ROLE
} from '../config/constants';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { toastr } from "react-redux-toastr";

// const headers = {
//     'Content-Type': 'application/json',
// };


const customHeader = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d'
};


// let multipartHeaders = { 
//     'Content-Type': 'multipart/form-data;' 
// };


/**
* @method getOpportunityRolesAPI
* @description Used to get opportunity roles  
*/
export function getOpportunityRolesAPI(opportunityId, callback) {
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });

        const request = axios.get(`${API.getOpportunityRole}/${opportunityId}`);
        request.then((response) => {
            // console.log('getOpportunityRolesAPI', response);
            callback(response);
            if (response.status === 200) {
                dispatch({
                    type: GET_OPPORTUNITY_ROLE_SUCCESS,
                    payload: response.data.data,
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            console.log('getOpportunityRolesAPI', error);
            dispatch({ type: ROLES_API_FAILURE });
            apiErrors(error);
        });
    };
}


/**
* @method deleteOpportunityAPI
* @description Used to delete opportunity  
*/

export function deleteOpportunityAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });
        axios.delete(`${API.deleteOpportunity}`, requestData)
            .then((response) => {
                dispatch({ type: DELETE_OPPORTUNITY_SUCCESS });
                callback(response);
            }).catch((error) => {
                dispatch({ type: ROLES_API_FAILURE });
                apiErrors(error);
            });
    };
}


/**
 * @method addOpportunityRoleAPI
 * @description create opportunity 
 */
export function addOpportunityRoleAPI(data, callback) {
    console.log("addOpportunityRoleAPI", data)
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });
        const request = axios.post(`${API.createOpportunityRole}`, data);
        request.then((response) => {
            dispatch({
                type: ADD_OPPORTUNITY_ROLE_SUCCESS,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: ROLES_API_FAILURE });
            apiErrors(error);
        });
    };
}

/**
* @method deleteOpportunityAPI
* @description Used to delete opportunity  
*/

export function deleteOpportunityRoleAPI(requestData, callback) {
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });
        axios.delete(`${API.deleteOpportunityRole}`, requestData)
            .then((response) => {
                dispatch({ type: DELETE_OPPORTUNITY_ROLE_SUCCESS });
                callback(response);
            }).catch((error) => {
                dispatch({ type: ROLES_API_FAILURE });
                apiErrors(error);
            });
    };
}


/**
 * @method updateOpportunityRoleAPI
 * @description update opportunity role id
 */
export function updateOpportunityRoleAPI(requestData, opportuniyId, callback) {
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });
        axios.put(API.updateOpportunityRole, requestData)
            .then((response) => {
                console.log("updateOpportunityRoleAPI response =>", response);
                getOpportunityRoleUpdatingProps(dispatch, opportuniyId, () => {
                    callback(response);
                    dispatch({ type: UPDATE_OPPORTUNITY_ROLE_SUCCESS });
                });
            }).catch((error) => {
                dispatch({ type: ROLES_API_FAILURE });
                apiErrors(error);
            });
    };
}


function getOpportunityRoleUpdatingProps(dispatch, opportunityId, cb) {
    const request = axios.get(`${API.getOpportunityRole}/${opportunityId}`);
    request.then((response) => {
        console.log('getOpportunityRoleUpdatingProps response', response);
        if (response.status === 200) {
            dispatch({
                type: GET_OPPORTUNITY_ROLE_SUCCESS,
                payload: response.data.data,
            });
        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
        cb();
    }).catch((error) => {
        console.log('getOpportunityRoleUpdatingProps error', error);
        dispatch({ type: ROLES_API_FAILURE });
        apiErrors(error);
    });

}

/**
 * @method addOpportunityRoleAPI
 * @description create opportunity 
 */
export function applyOpportunityRoleAPI(data, callback) {
    return (dispatch) => {
        dispatch({ type: ROLES_API_REQUEST });
        const request = axios.post(`${API.applyCastingCallRole}`, data, { customHeader });
        request.then((response) => {
            console.log("applyOpportunityRoleAPI response data =>", response);

            dispatch({
                type: APPLY_OPPORTUNITY_ROLE_SUCCESS,
            });
            callback(response);
        }).catch((error) => {
            dispatch({ type: ROLES_API_FAILURE });
            apiErrors(error);
        });
    };
}


export function updateRoleIndex(editIndex){
    return (dispatch) => {
        dispatch({
            type: EDIT_INDEX_ROLE,
            payload: editIndex
        })
    }
}

