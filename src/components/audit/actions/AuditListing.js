import axios from 'axios';
import { API, API_FAILURE, config, GET_LOGIN_AUDIT_SUCCESS } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';


export function getUserAuditLog(data, skip, take, isPagination, isSortByOrderAsc, sortName, callback) {

    return (dispatch) => {
        const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';
        // Create an instance of URLSearchParams
        let queryParams = new URLSearchParams();
        // Map of parameters to potentially add. If the value is truthy, or a boolean, add it to the query params
        const paramsToAdd = {
            loggedInUserId: loggedInUserId() || DEFAULT_USER_ID,
            fromDate: data.fromDate,
            toDate: data.toDate,
            loginTime: data.LoginTime,
            userName: data.UserName,
            ipAddress: data.IPAddress,
            macAddress: data.MacAddress,
            userAgent: data.UserAgent,
            sortName: sortName,
            isSortByOrderAsc: false, // Convert boolean to string
            isApplyPagination: isPagination, // Convert boolean to string
            skip: skip.toString(), // Assuming skip is always a number
            take: take.toString(), // Assuming take is always a number
            search: data.search,
            departments: data.departments
        };
        console.log(paramsToAdd, "paramsToAdd");


        // Only add parameters which are not undefined, empty string or null
        for (const [key, value] of Object.entries(paramsToAdd)) {
            if (value || value === false || value === '0') {
                queryParams.set(key, value);
            }
        }

        // Convert the URLSearchParams instance to a string
        queryParams = queryParams.toString();

        // Perform the Axios GET request
        const request = axios.get(`${API.getAuditList}?${queryParams}`, config());


        // Handle the request response
        request.then((response) => {
            console.log('response: ', response);
            if (response.data) {
                // Dispatch the action to the store with the audit log data
                dispatch({
                    type: GET_LOGIN_AUDIT_SUCCESS,
                    payload: response.status === 204 ? [] : response.data
                });
            }

            // Execute the callback, if provided
            if (callback) {
                callback(response);
            }
        }).catch((error) => {
            // Dispatch API failure action type
            dispatch({ type: API_FAILURE });

            // Execute the callback with error, if provided
            if (callback) {
                callback(error);
            }


        });
    };
}
