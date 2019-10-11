import axios from 'axios';
import {
    PRODUCTION_API_REQUEST,
    PRODUCTION_API_FAILURE,
    UPDATE_USER_PRODUCTION_DETAIL_SUCCESS,
    GET_COMPANY_PROFILE_SUCCESS,
    PRODUCTION_PROFILE_IMAGE_SUCCESS,
    PRODUCTION_HEADSHOT_IMAGE_SUCCESS
} from '../config/constants';
import { API } from '../config/constants';
import { MESSAGES } from '../config/message';
import { formatGetCompanyProfileResult } from '../helper/ApiResponse';
import { apiErrors } from '../helper/util';
import { toastr } from "react-redux-toastr";


let multipartHeaders = {
    'Content-Type': 'multipart/form-data;'
};

/**
 * @method updateUserProductionDetailAPI
 * @description update user production data
 */

export function updateUserProductionDetailAPI(productionId, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: PRODUCTION_API_REQUEST });
        //console.log("updateUserProductionDetailAPI request=>" + JSON.stringify(requestData));

        axios.put(`${API.updateUserProductionDetail}`, requestData)
            .then((response) => {
                //onsole.log("updateUserProductionDetailAPI response=>" + JSON.stringify(response));
                if (response.data.success === true) {
                    callback(response);
                    getCompanyProfileAPIForUpdatingProps(dispatch, productionId, () => {
                        dispatch(getUserProductionDetailSuccess(response));
                    });
                }else{
                    dispatch({ type: PRODUCTION_API_FAILURE });
                    if (response.data.message) {
                        toastr.error(response.data.message);
                    } else {
                        toastr.error(MESSAGES.SOME_ERROR);
                    }
                }
            })
            .catch((error) => {
                //console.log("updateUserProductionDetailAPI error=>" + JSON.stringify(error));
                dispatch(getUserProductionDetailFailure(error));
                apiErrors(error);
            });
    };
}
/**
 * @method getUserProductionDetailSuccess
 * @description return object containing action type
 */
export function getUserProductionDetailSuccess(data) {
    return {
        type: UPDATE_USER_PRODUCTION_DETAIL_SUCCESS,
        payload: data.data,
    };
}

/**
 * @method getUserProfileUpdateFailure
 * @description return object containing action type
 */
export function getUserProductionDetailFailure() {
    return {
        type: PRODUCTION_API_FAILURE
    };
}

/**
 * @method getCompanyProfileAPI
 * @description get user profile data 
 */
export function getCompanyProfileAPI(productionId, showLoader = true, callback) {

    const request = axios.get(`${API.getCompanyProfile}?companyId=${productionId}`, { multipartHeaders });

    return (dispatch) => {
        if (showLoader) {
            dispatch({ type: PRODUCTION_API_REQUEST });
        }
        request.then((response) => {
            // console.log('response => ' + JSON.stringify(response));
            if (response.status === 200) {
                const companyFormatedData = formatGetCompanyProfileResult(response.data);
                callback(response.data)
                dispatch({
                    type: GET_COMPANY_PROFILE_SUCCESS,
                    payload: companyFormatedData,
                });
                callback(response.data)
            } else {
                callback(response);
                toastr.error(response.data.message);
            }
        }).catch((error) => {
            callback(false);
            dispatch(getCompanyProfileFailure(error));
        });
    };
}

/**
 * @method getCompanyProfileSuccess
 * @description return object containing action type
 */
export function getCompanyProfileSuccess(data) {
    return {
        type: GET_COMPANY_PROFILE_SUCCESS,
        payload: data.data,
    };
}


/**
 * @method getCompanyProfileFailure
 * @description return object containing action type
 */
export function getCompanyProfileFailure() {
    return {
        type: PRODUCTION_API_FAILURE
    };
}

/**
 * @method uploadUserProductionProfileImageAPI
 * @description post production profileImage of user
 */
export function uploadUserProductionProfileImageAPI(productionId, requestData, callback) {

    return (dispatch) => {
        dispatch({ type: PRODUCTION_API_REQUEST });
        const media = {
            uri: requestData.mediaUri,
            type: requestData.fileType,
            name: requestData.fileName,
        };
        let data = new FormData();
        data.append('files', media);

        axios.post(API.postProductionProfileImage, data, { multipartHeaders })
            .then((response) => {
                callback(response);
                getCompanyProfileAPIForUpdatingProps(dispatch, productionId, () => {
                    dispatch({ type: PRODUCTION_PROFILE_IMAGE_SUCCESS });
                });
            })
            .catch((error) => {
                dispatch({ type: PRODUCTION_API_FAILURE });
                apiErrors(error);
            });
    };
}

/**
 * @method uploadUserProductionHeadShotImageAPI
 * @description post production headshotImage of user
 */
export function uploadUserProductionHeadShotImageAPI(productionId, requestData, callback) {
    return (dispatch) => {
        dispatch({ type: PRODUCTION_API_REQUEST });
        const media = {
            uri: requestData.mediaUri,
            type: requestData.fileType,
            name: requestData.fileName,
        };
        let data = new FormData();
        data.append('files', media);

        axios.post(API.postProductionHeadShotImage, data, { multipartHeaders })
            .then((response) => {
                callback(response);
                getCompanyProfileAPIForUpdatingProps(dispatch, productionId, () => {
                    dispatch({ type: PRODUCTION_HEADSHOT_IMAGE_SUCCESS });
                });
            })
            .catch((error) => {
                dispatch({ type: PRODUCTION_API_FAILURE });
                apiErrors(error);
            });
    };
}

export function getCompanyProfileAPIForUpdatingProps(dispatch, productionId, cb) {

    const request = axios.get(`${API.getCompanyProfile}?companyId=${productionId}`, { multipartHeaders });
    request.then((response) => {
        //console.log('getCompanyProfileAPIForUpdatingProps => ', JSON.stringify(response));
        if (response.status === 200) {
            const companyFormatedData = formatGetCompanyProfileResult(response.data);
            //console.log('COMPANY RESONSE AFTER UPLAOD IMAGE' + JSON.stringify(companyFormatedData));
            dispatch({
                type: GET_COMPANY_PROFILE_SUCCESS,
                payload: companyFormatedData,
            });
            cb();
        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
    }).catch((error) => {
        //console.log("getCompanyProfileAPIForUpdatingProp error=>" + JSON.stringify(error));
        dispatch(getCompanyProfileFailure(error));
        apiErrors(error);
    });

}