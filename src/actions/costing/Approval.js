import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    GET_SEND_FOR_APPROVAL_SUCCESS,
    GET_ALL_APPROVAL_DEPARTMENT,
    GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
} from '../../config/constants';
import { apiErrors } from '../../helper/util';
import { MESSAGES } from '../../config/message';
import { toastr } from 'react-redux-toastr'

const headers = {
    'Content-Type': 'application/json',
    //Authorization:'Bearer 4lEZa54IiLSaAmloKW8YyBFpB5pX6dAqkKw3szUT8O8HaEgKB7G4LgbvYl9eBOu1e3tgvYOligAncfRb_4PUNwSrygdtmTvLdwMoJi5yQu9iIJAOu6J1U5iIKou92e9XLNAq953S1-R985Yc-BvLt9X9HJKYpgo4mu2DelbnHauQUdk-H-Rgv1umz56UhtnGcsPyzlHriGvJKhJjQtdPCA'
};


/**
 * @method getSendForApproval
 * @description get SEND FOR APPROVAL DATA BY COSTING ID
 */
export function getSendForApprovalByCostingId(CostingId, callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getSendForApproval}/${CostingId}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_SEND_FOR_APPROVAL_SUCCESS,
                    payload: response.data.Data,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
 * @method getSendForApproval
 * @description get SEND FOR APPROVAL DATA BY COSTING ID
 */
export function getAllApprovalDepartment(callback) {
    return (dispatch) => {
        //dispatch({ type: API_REQUEST });
        const request = axios.get(`${API.getAllApprovalDepartment}`, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ALL_APPROVAL_DEPARTMENT,
                    payload: response.data.SelectList,
                });
                callback(response);
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}


/**
 * @method getAllApprovalUserByDepartment
 * @description GET ALL APPROVAL USERS BY DEPARTMENT
 */
export function getAllApprovalUserByDepartment(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.getAllApprovalUserByDepartment, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                dispatch({
                    type: GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
                    payload: response.data.SelectList
                });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
        });
    };
}

/**
 * @method sendForApproval
 * @description SEND COSTING FOR APPROVAL
 */
export function sendForApproval(data, callback) {
    return (dispatch) => {
        const request = axios.post(API.sendForApproval, data, headers);
        request.then((response) => {
            if (response.data.Result) {
                // dispatch({
                //     type: GET_ALL_APPROVAL_USERS_BY_DEPARTMENT,
                //     payload: response.data.SelectList
                // });
                callback(response);
            } else {
                dispatch({ type: API_FAILURE });
                if (response.data.Message) {
                    toastr.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
        });
    };
}