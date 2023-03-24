
import axios from 'axios';
import {
    API,
    API_FAILURE,
    config,

} from '../../../../config/constants';
import { apiErrors } from '../../../../helper/util';

export function getAllNfrList(callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getAllNfrList}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);

            apiErrors(error);
        });
    };
}

export function getNfrPartDetails(nfrId, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getNfrPartDetails}/${nfrId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {
                callback(response);
            }
        }).catch((error) => {
            dispatch({ type: API_FAILURE, });
            callback(error);

            apiErrors(error);
        });
    };
}
















