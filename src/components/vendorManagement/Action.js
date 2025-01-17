import { API, API_FAILURE, API_REQUEST, API_SUCCESS, DETAILS_FOR_DEVIATION_APPROVAL, LPS_RATING_DATA, MONTHS, UPDATE_LPS_RATING_STATUS, UPDATE_VENDOR_CLASSIFICATION_STATUS, VENDOR_CLASSIFICATION_DATA, VENDOR_DATA, VENDOR_PLANT_DATA, config } from '../../config/constants';
import { apiErrors, loggedInUserId, userDetails } from '../../helper';
import axiosInstance from '../../utils/axiosInstance';
import data from './data.json';
import axios from 'axios';

export const APPROVAL_LISTING = 'APPROVAL_LISTING';

export const fetchApprovalList = () => {
    return async dispatch => {
        try {
            // Simulating API call with static JSON data
            dispatch({
                type: APPROVAL_LISTING,
                payload: data.approvalListing // Assuming approvalListing is present in your JSON file
            });
        } catch (error) {
            // Handle error if needed

        }
    };
};



export const UPDATE_APPROVAL_DATA = 'UPDATE_APPROVAL_DATA';
export const fetchApprovalData = () => {
    return async dispatch => {

        try {
            // Simulating API call with static JSON data
            dispatch({
                type: UPDATE_APPROVAL_DATA,
                payload: data.approvalSummary // Assuming vendorData is present in your JSON file
            });
        } catch (error) {
            // Handle error if needed
        }
    }
}



export const getVendorClassificationListing = (callback) => {
    return dispatch => {
        axios.get(`${API.getVendorClassificationList}?loggedInUserId=${loggedInUserId()}`, config())
            .then(response => {

                dispatch({
                    type: VENDOR_CLASSIFICATION_DATA,
                    payload: response.status === 200 ? response.data : null
                });
                callback(response)
            })

            .catch(error => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                // callback(error);
            });
    };
};

export const getLPSRatingListing = (callback) => {
    return async dispatch => {
        try {
            const response = await axios.get(`${API.getVendorLpsRatingList}?loggedInUserId=${loggedInUserId()}`, config());

            dispatch({
                type: LPS_RATING_DATA,
                payload: response.status === 200 ? response.data : null
            });
            callback(response)
        } catch (error) {
            dispatch({ type: API_FAILURE });
            callback(error);
            apiErrors(error);
        }
    };
};


export function updateClassificationStatus(requestData, callback) {


    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.vendorClassificationStatusUpdate}`, requestData, config())
            .then((response) => {

                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}


export function updateLPSRatingStatus(requestData, callback) {

    return (dispatch) => {
        dispatch({ type: API_REQUEST });
        axiosInstance.put(`${API.lpsRatingStatusUpdate}`, requestData, config())
            .then((response) => {

                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

export const fetchVendorData = () => {
    return dispatch => {
        axios.get(`${API.getVendorNameByVendorSelectList}?loggedInUserId=${loggedInUserId()}`, config())
            .then(response => {



                dispatch({
                    type: VENDOR_DATA,
                    payload: response.status === 200 ? response.data : null
                });
            })

            .catch(error => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                // callback(error);
            });
    };
};
export const fetchVendorDependentPlantData = (data) => {

    return dispatch => {
        axios.get(`${API.getPlantData}/${data}`, config())
            .then(response => {


                dispatch({
                    type: VENDOR_PLANT_DATA,
                    payload: response.status === 200 ? response.data : null
                });
            })

            .catch(error => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                // callback(error);
            });
    };
};
export const fetchDeviationApprovalData = (vendorId, plantId, callback) => {
    const queryString = `loggedInUserId=${loggedInUserId()}&vendorId=${vendorId}&plantId=${plantId}`;
    return dispatch => {
        axios.get(`${API.getVendorPlantDetailForDeviation}?${queryString}`, config())
            .then(response => {

                dispatch({
                    type: DETAILS_FOR_DEVIATION_APPROVAL,
                    payload: response.status === 200 ? response.data : null

                })
                callback(response)
            })
            .catch(error => {
                dispatch({ type: API_FAILURE });
                apiErrors(error);
                callback(error);
            });
    };

}

export function sendForUnblocking(data, callback) {

    return (dispatch) => {
        const request = axiosInstance.post(API.sendForUnblocking, data, config());
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
