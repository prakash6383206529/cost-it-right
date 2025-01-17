import axios from 'axios';
import {
    API,
    API_REQUEST,
    API_FAILURE,
    API_SUCCESS,

    config
} from '../../../config/constants';
import { apiErrors } from '../../../helper/util';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import axiosInstance from '../../../utils/axiosInstance';
import { loggedInUserId } from '../../../helper';


// const config() = config

/**
 * @method createSupplierAPI
 * @description create supplier master
 */
export function saveSAPDetail(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axiosInstance.post(API.saveSAPDetail, data, config());
        request.then((response) => {
            if (response.data.Result) {

                callback(response);
            } else {

                if (response.data.Message) {
                    Toaster.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error);
        });
    };
}
export function updateSAPDetail(data, callback) {
    return (dispatch) => {
        // dispatch({
        //     type:  API_REQUEST,
        // });
        const request = axiosInstance.put(API.updateSAPDetail, data, config());
        request.then((response) => {
            if (response.data.Result) {

                callback(response);
            } else {

                if (response.data.Message) {
                    Toaster.error(response.data.Message);
                }
            }
        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);
            callback(error);
        });
    };
}

/**
 * @method getSupplierDataList
 * @description get Supplier's DataList 
 */
export function getMaterialGroupByPart(partId, callback) {
    return (dispatch) => {


        const request = axios.get(`${API.getMaterialGroupByPart}?partId=${partId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                callback(response)
            }

        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);

        });
    };
}
export function getPurcahseOrganisationByPlant(plantId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getPurcahseOrganisationByPlant}?plantId=${plantId}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                callback(response)
            }

        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);

        });
    };
}
export function getSAPDetailById(id, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSAPDetailById}?sapPushDetailId=${id}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                callback(response)
            }

        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });
            apiErrors(error);

        });
    };
}
export function getSAPDetailList(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getAllSAPPushDetail}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                callback(response)
            }

        }).catch((error) => {
            dispatch({
                type: API_FAILURE
            });

            apiErrors(error);

        });
    };
}

export function getSapPushDetailsHeader(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getSapPushDetailsHeader}`, config());
        request.then((response) => {
            if (response.data.Result || response.status === 204) {

                callback(response)
            }
        })
    }
}
export function sapPushBulkUpload(data, callback) {
    return (dispatch) => {
        const request = axiosInstance.post(API.sapPushBulkUpload, data, config());
        request.then((response) => {
            callback(response);
        }).catch((error) => {
            dispatch({ type: API_FAILURE });
            apiErrors(error);
            callback(error);
        });
    };
}

export function getAllPartBopRmList(partNumber, callback) {
    return axios.get(`${API.getAllPartBopRmList}?loggedInUserId=${loggedInUserId()}${partNumber ? `&number=${partNumber}` : ''}`, config()).catch(error => {
        apiErrors(error);
        callback(error);
        return Promise.reject(error)
    });
}