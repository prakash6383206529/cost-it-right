
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

/**
 * @method nfrSendToApproverBySender
 * @description save NFR Group Details
 */
export function nfrSendToApproverBySender(requestData, callback) {
    return (dispatch) => {
        axios.post(API.nfrSendToApproverBySender, requestData, config())
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

/**
 * @method getNFRApprovals
 * @description get NFR Approvals
 */
export function getNFRApprovals(callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRApprovals}`, config());
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
 * @method getNFRApprovalSummary
 * @description get NFR Approval Summary
 */
export function getNFRApprovalSummary(nfrGroupId, loggedInUserId, callback) {
    return (dispatch) => {
        const request = axios.get(`${API.getNFRApprovalSummary}/${nfrGroupId}/${loggedInUserId}`, config());
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
 * @method approvedCostingByApprover
 * @description approve Costing By Approver
 */
export function approvedCostingByApprover(requestData, callback) {
    return (dispatch) => {
        axios.post(API.approvedCostingByApprover, requestData, config())
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
