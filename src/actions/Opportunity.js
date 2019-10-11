import axios from 'axios';
import { toastr } from "react-redux-toastr";
import { reactLocalStorage } from 'reactjs-localstorage';
import { MESSAGES } from '../config/message';
import { API } from '../config/constants';
import { apiErrors } from '../helper/util';
import {
    UPDATE_POST_OPPORTUNITY_DETAILS,
    CREATE_OPPORTUNITIES_REQUEST,
    CREATE_OPPORTUNITIES_SUCCESS,
    CREATE_OPPORTUNITIES_FAILURE,
    SET_OPPORTUNITY_LOGO_SUCCESS,
    OPPORTUNITIES_DETAILS_API_REQUEST,
    OPPORTUNITY_DETAILS_SUCCESS,
    OPPORTUNITY_DETAILS_FAILURE,
    OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS,
    OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE,
    OPPORTUNITY_DETAILS_CLONE_SUCCESS,
    PUBLISH_OPPORTUNITIES_SUCCESS,
    OPPORTUNITY_EDIT_DETAILS_SUCCESS,
    OPPORTUNITY_CLONE_REQUEST,
    OPPORTUNITY_CLONE_SUCCESS,
    OPPORTUNITY_CLONE_FAILURE,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS,
    APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE,
    CLONE_OPPORTUNITY_DROPDOWN_VALUE,
    SHOW_OPPORTUNITY_DETAIL
} from '../config/constants';

const headers = {
    'Content-Type': 'application/json',
};

const customHeader = {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d'
};


/**
 * @method getOpportunityDetailAPI
 * @description get user opportunity detail data
 */

export function getOpportunityDetailAPI(requestData, opportunityType) {
    return (dispatch) => {
        dispatch({ type: OPPORTUNITIES_DETAILS_API_REQUEST });
        console.log("create opportunity detail request => " + JSON.stringify(requestData));
        const request = axios.get(API.opportunityDetail, requestData);
        request.then((response) => {
            console.log("create opportunity detail response => ", response);
            if (response.status === 200) {
                dispatch({
                    type: SHOW_OPPORTUNITY_DETAIL,
                    payload: response.data,
                });
                if (response && response.data.message == 'No records found') {
                    toastr.warning(MESSAGES.INVALID_URL);
                    setTimeout(() => {
                        window.location.assign('/opportunities');
                    }, 2000)
                } else if (opportunityType != 'editOpportunity') {
                    console.log('new section', opportunityType)
                    /** Update local storage  */
                    dispatch({
                        type: OPPORTUNITY_DETAILS_SUCCESS,
                        payload: response.data,
                    });
                } else {
                    console.log('edit section', opportunityType)
                    dispatch({
                        type: OPPORTUNITY_EDIT_DETAILS_SUCCESS,
                        payload: response.data,
                    });
                }
            } else {
                console.log("getOpportunityDetailAPI else => error", response);
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            console.log("getOpportunityDetailAPIs => error", error);
            dispatch({ type: OPPORTUNITY_DETAILS_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getCloneOpportunityDetailAPI
 * @description get user opportunity detail data
 */

export function getCloneOpportunityDetailAPI(requestData) {
    console.log("create opportunity clone request => ", requestData);
    return (dispatch) => {
        dispatch({ type: OPPORTUNITIES_DETAILS_API_REQUEST });
        const request = axios.get(API.opportunityDetail, requestData);
        request.then((response) => {
            console.log("create opportunity clone response => ", response);
            if (response.status === 200) {
                /** Update local storage  */
                dispatch({
                    type: OPPORTUNITY_DETAILS_CLONE_SUCCESS,
                    payload: response.data,
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            console.log("create opportunity clone error => ", error);

            dispatch({ type: OPPORTUNITY_DETAILS_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method getCloneOpportunityDataAPI
 * @description get user opportunity detail data
 */

export function getCloneOpportunityDataAPI(myOpportunityType) {
    const userObj = reactLocalStorage.getObject('userResponse');
    let headers = {
        'Accept': 'application/json',
        //'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: OPPORTUNITY_CLONE_REQUEST });
        const request = axios.get(`${API.myCastingCall}?myOpportunityType=${myOpportunityType}`, { headers });
        request.then((response) => {
            console.log("getCloneOpportunityDataAPI", response);
            if (response.status === 200) {
                dispatch({
                    type: OPPORTUNITY_CLONE_SUCCESS,
                    payload: response.data.data,
                    myOpportunityType
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            dispatch({ type: OPPORTUNITY_CLONE_FAILURE });
            apiErrors(error);
        });
    };
}

/**
 * @method createOpportunityAPI
 * @description create opportunity 
 */

export function createOpportunityAPI(data, callback) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Content-Type': 'application/json',
        //'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: CREATE_OPPORTUNITIES_REQUEST });
        console.log("create opportunity request => ", data);
        const request = axios.post(API.createOpportunity, data);
        request.then((response) => {
            console.log("create opportunity response 33 =>", response);
            if (response.status === 200 && response.data.success === true) {
                if (response.data.data.published === false) {
                    getOpportunityDetailAPIAfterCreateOpportunity(dispatch, response.data.data._id, () => {
                        dispatch({
                            type: CREATE_OPPORTUNITIES_SUCCESS,
                        });
                        callback(response);
                    });
                } else {
                    dispatch({
                        type: PUBLISH_OPPORTUNITIES_SUCCESS,
                    });
                    callback(response);
                }
            } else {
                console.log("Past date error ", response.data.errfor)
                dispatch({ type: CREATE_OPPORTUNITIES_FAILURE });
                if (response.data.message) {
                    toastr.error(response.data.message);
                } else if (response.data.errfor) {
                    toastr.error(response.data.errfor.pastDateError);
                }
            }
        }).catch((error) => {
            console.log('error step4', error)
            dispatch({ type: CREATE_OPPORTUNITIES_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method getOpportunityDetailAPIAfterCreateOpportunity
 * @description get user opportunity detail data after create opportunity
 */

export function getOpportunityDetailAPIAfterCreateOpportunity(dispatch, id, cb) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Content-Type': 'application/json',
        //'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    const opportunityID = { params: { opportunityId: id }, headers: headers };
    const request = axios.get(API.opportunityDetail, opportunityID);
    request.then((response) => {
        console.log("getOpportunityDetailAPIAfterCreateOpportunity", response);
        if (response.status === 200) {
            dispatch({
                type: OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_SUCCESS,
                payload: response.data,
            });
            cb();
        } else {
            toastr.error(MESSAGES.SOME_ERROR);
        }
    }).catch((error) => {
        //console.log("getOpportunityDetailAPIAfterCreateOpportunity error" + JSON.stringify(error));
        dispatch({ type: OPPORTUNITY_DETAILS_CREATE_OPPORTUNITY_FAILURE });
        apiErrors(error);
    });
}

/**
 * @method updatePostOpportunityData
 * @description Used to update store data after saveing opportunity
 */

export function updatePostOpportunityData(opportunityData) {
    return (dispatch) => {
        dispatch({ type: UPDATE_POST_OPPORTUNITY_DETAILS, payload: opportunityData });
    };
}


/**
 * @method uploadOpportunityLogoImageAPI
 * @description upsed to upload image for opportunity logo
 */

export function uploadOpportunityLogoImageAPI(data, callback) {
    console.log("data from oppor", data)
    const userObj = reactLocalStorage.getObject('userResponse');
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: CREATE_OPPORTUNITIES_REQUEST });
        // const media = {
        //     uri: requestData.mediaUri,
        //     type: requestData.fileType,
        //     name: requestData.fileName,
        // };
        // let data = new FormData();
        // data.append('file', media);
        axios.post(API.setOpportunityLogo, data, { headers })
            .then((response) => {
                console.log('Upload opportunity image response', response);
                dispatch({ type: SET_OPPORTUNITY_LOGO_SUCCESS });
                callback(response);
            }).catch((error) => {
                dispatch({ type: CREATE_OPPORTUNITIES_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };
}

/**
 * @method clearCreateOpportunityData
 * @description upsed to clear create opportunity data
 * 
 */

export function clearCreateOpportunityData() {
    return (dispatch) => {
        dispatch({
            type: PUBLISH_OPPORTUNITIES_SUCCESS,
        });
    };
}

/**
 * @method getAppliedOpportunityDetailDataAPI
 * @description get user opportunity detail data
 */

export function getAppliedOpportunityDetailDataAPI(id, userId) {
    const userObj = reactLocalStorage.getObject('userResponse');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data; boundary=6ff46e0b6b5148d984f148b6542e5a5d',
        'Authorization': `bearer ${userObj.token}`
    }
    return (dispatch) => {
        dispatch({ type: APPLIED_OPPORTUNITY_DETAIL_REQUEST });
        const request = axios.get(`${API.appliedRolesList}?opportunityId=${id}&userId=${userId.id}`, { headers });
        request.then((response) => {
            //console.log("getAppliedOpportunityDetailDataAPI" + JSON.stringify(response.data.appliaedOpportunityDetail));
            if (response.status === 200) {
                dispatch({
                    type: APPLIED_OPPORTUNITY_DETAIL_REQUEST_SUCCESS,
                    payload: response.data.appliaedOpportunityDetail,
                });
            } else {
                toastr.error(MESSAGES.SOME_ERROR);
            }
        }).catch((error) => {
            //console.log("getAppliedOpportunityDetailDataAPI error" + JSON.stringify(error));
            dispatch({ type: APPLIED_OPPORTUNITY_DETAIL_REQUEST_FAILURE });
            apiErrors(error);
        });
    };
}


/**
 * @method cloneOpportunityDropdownvalue
 * @description upsed to clear create opportunity data
 * 
 */

export function cloneOpportunityDropdownvalue(id) {
    return (dispatch) => {
        dispatch({
            type: CLONE_OPPORTUNITY_DROPDOWN_VALUE,
            payload: id
        });
    };
}
