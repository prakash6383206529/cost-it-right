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
