import { API, API_FAILURE, API_REQUEST, API_SUCCESS, LPS_RATING_DATA, UPDATE_LPS_RATING_STATUS, UPDATE_VENDOR_CLASSIFICATION_STATUS, VENDOR_CLASSIFICATION_DATA, config } from '../../config/constants';
import { apiErrors, loggedInUserId, userDetails } from '../../helper';
import data from './data.json';
import axios from 'axios';
export const UPDATE_VENDOR_DATA = 'UPDATE_VENDOR_DATA';

export const fetchVendorData = () => {
    return async dispatch => {
        try {
            // Simulating API call with static JSON data
            dispatch({
                type: UPDATE_VENDOR_DATA,
                payload: data.vendorData // Assuming vendorData is present in your JSON file
            });
        } catch (error) {
            // Handle error if needed

        }
    };
};

// actions/lpsRatingActions.js

export const UPDATE_LPS_RATING_DATA = 'UPDATE_LPS_RATING_DATA';

export const fetchLPSRatingData = () => {
    return async dispatch => {
        try {
            // Simulating API call with static JSON data
            dispatch({
                type: UPDATE_LPS_RATING_DATA,
                payload: data.lpsRatingData // Assuming lpsRatingData is present in your JSON file
            });
        } catch (error) {
            // Handle error if needed

        }
    };
};

// actions/approvalListing.js

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
export const VENDOR_DETAIL_DATA = 'VENDOR_DETAIL_DATA';
export const fetchSupplierDetailData = () => {
    return async dispatch => {
        try {
            // Simulating API call with static JSON data
            dispatch({
                type: VENDOR_DETAIL_DATA,
                payload: data.supplierDetailData // Assuming vendorData is present in your JSON file
            });
        } catch (error) {
            // Handle error if needed
        }
    }
}

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



export const getVendorClassificationListing = () => {
    return dispatch => {
        axios.get(`${API.getVendorClassificationList}`, config())
            .then(response => {

                dispatch({
                    type: VENDOR_CLASSIFICATION_DATA,
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

export const getlpsratingListing = (callback) => {
    return async dispatch => {
        try {
            const response = await axios.get(`${API.getVendorLpsRatingList}`, config());

            dispatch({
                type: LPS_RATING_DATA,
                payload: response.status === 200 ? response.data : null
            });
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
        axios.put(`${API.vendorClassificationStatusUpdate}`, requestData, config())
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
        axios.put(`${API.lpsRatingStatusUpdate}`, requestData, config())
            .then((response) => {

                dispatch({ type: API_SUCCESS });
                callback(response);
            }).catch((error) => {
                apiErrors(error);
                dispatch({ type: API_FAILURE });
            });
    };
}

