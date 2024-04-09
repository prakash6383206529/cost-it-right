import data from './data.json';
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
