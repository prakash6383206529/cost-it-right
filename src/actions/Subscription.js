import axios from 'axios';
import { reactLocalStorage } from 'reactjs-localstorage';
import {
    API,
    SUBSCRIPTION_PLANS_REQUEST,
    SUBSCRIPTION_PLANS_FAILURE,
    GET_SUBSCRIPTION_PLANS_SUCCESS,
    PLAN_SUBSCRIPTION_PLANS_SUCCESS,
    FETCH_USER_DATA
} from '../config/constants';
import { apiErrors } from '../helper/util';
import { formatGetPlanResult, formatLoginResult } from '../helper/ApiResponse';


const headers = {
    'Content-Type': 'application/json',
};

/**
* @method getSubscriptionPlanListAPI
* @description Used to get subscribed plan
*/

export function getSubscriptionPlanListAPI() {
    return (dispatch) => {
        dispatch({ type: SUBSCRIPTION_PLANS_REQUEST });
        const request = axios.get(`${API.subscriptionPlanList}`, { headers });
        request.then((response) => {
            console.log('getSubscriptionPlanListAPI',response);
            const planFormatedData = formatGetPlanResult(response);
            dispatch({
                type: GET_SUBSCRIPTION_PLANS_SUCCESS,
                payload: planFormatedData,
            });
        }).catch((error) => {
            console.log('getSubscriptionPlanListAPI',error);
            dispatch({ type: SUBSCRIPTION_PLANS_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method verifyOtpAPI
 * @description Verify otp sent on email
 */
export function subscribePlan(requestData, callback) {
    console.log('getSubscriptionPlanListAPI requestData', requestData);
    return (dispatch) => {
        dispatch({ type: SUBSCRIPTION_PLANS_REQUEST });
        axios.post(API.subscribePlan, requestData, { headers })
            .then((response) => {
                console.log('getSubscriptionPlanListAPI  response', response);
                if (response.status === 200) {
                    const formatedResponseData = formatLoginResult(response);
                    console.log('SUBSCRIPTION FORMATED RESPONSE ', formatedResponseData);
                }
                dispatch({ type: PLAN_SUBSCRIPTION_PLANS_SUCCESS });
                callback(response);
            })
            .catch((error) => {
                console.log('getSubscriptionPlanListAPI  error', error);
                dispatch({ type: SUBSCRIPTION_PLANS_FAILURE });
                apiErrors(error);
                callback(error)
            });
    };
}


export function updateSubscriptionDetails(updateData) {
    return (dispatch) => {
        /** Update local storage  */
        updateAsyncStorage(updateData, () => {
            dispatch({
                type: FETCH_USER_DATA,
                payload: updateData
            });
        });
    };
}


function updateAsyncStorage(updateData, cb) {
    const oldData = reactLocalStorage.getObject('userResponse');
    if (oldData !== null) {
        let userData = { ...oldData, ...updateData };
        reactLocalStorage.setObject('userResponse', userData)
        cb();
    }
}
