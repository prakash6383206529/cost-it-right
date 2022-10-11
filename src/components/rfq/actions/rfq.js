
import axios from 'axios';
import {
    API,
    API_FAILURE,
    GET_RM_DOMESTIC_LIST,
    config,
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { loggedInUserId, userDetails } from '../../../helper';
import { MESSAGES } from '../../../config/message';



export function getQuotationList(callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getQuotationList}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                dispatch({
                    type: GET_RM_DOMESTIC_LIST,
                    payload: response.status === 204 ? [] : response.data.DataList
                })

                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);

            apiErrors(error);
        });
    };
}




export function createRfqQuotation(data, callback) {

    return (dispatch) => {
        const request = axios.post(API.createRfqQuotation, data, config());
        request.then((response) => {
            if (response.data.Result) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error)
        });
    };


}