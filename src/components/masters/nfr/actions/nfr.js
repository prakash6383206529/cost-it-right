
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

/**
 * @method saveNFRGroupDetails
 * @description save NFR Group Details
 */
export function saveNFRGroupDetails(requestData, callback) {
    return (dispatch) => {
        axios.post(API.saveNFRGroupDetails, requestData, config())
            .then((response) => {
                if (response && response.status === 200) {
                    callback(response);
                }
            }).catch((error) => {
                apiErrors(error);
                callback(error);
            });
    };
}

export function getNFRPartWiseGroupDetail(data, callback) {
    return (dispatch) => {

        const request = axios.get(`${API.getNFRPartWiseGroupDetail}/${data?.nfrId}/${data?.partWiseDetailId}/${data?.plantId}`, config());
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
