import axios from 'axios';
import { API } from '../config/constants';
import { MESSAGES } from '../config/message';
import { apiErrors } from '../helper/util';
import { toastr } from "react-redux-toastr";
import { formatGetCompanyListResult } from '../helper/ApiResponse';
import {
    COMPANY_LISTING_FAILURE,
    COMPANY_LISTING_REQUEST,
    GET_COMPANY_SUCCESS,
    UPDATE_COMPANY_FILTER
} from '../config/constants';

const headers = {
    'Content-Type': 'application/json',
};


/**
* @method getCompanyListAPI
* @description get all companies 
*/
export function getCompanyListAPI(data, loadMore = false, callback) {
    return (dispatch) => {
        dispatch({ type: COMPANY_LISTING_REQUEST });
        // console.log('getCompanyListAPI request====>' ,data);
        const request = axios.get(`${API.getCompanyList}?${data}`, { headers });
        request.then((response) => {
            // console.log('getCompanyListAPI response====>' ,response);

            if (response.status === 200) {
                const companyFormatedData = formatGetCompanyListResult(response.data);
                dispatch({
                    type: GET_COMPANY_SUCCESS,
                    payload: companyFormatedData,
                    loadMore,
                });
            } else {
                toastr.success(MESSAGES.SOME_ERROR);
            }
            callback(response);
        }).catch((error) => {
            dispatch({ type: COMPANY_LISTING_FAILURE });
            callback(error);
            apiErrors(error);
        });
    };
}

/**
* @method companyListFilterAPI
* @description get filtered company list
*/
export function companyListFilterAPI(companyFilterData) {
    return (dispatch) => {
        dispatch({ type: COMPANY_LISTING_REQUEST });
        dispatch({ type: UPDATE_COMPANY_FILTER, payload: companyFilterData });
    };
}
