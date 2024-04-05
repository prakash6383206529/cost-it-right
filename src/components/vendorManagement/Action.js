
// actions/supplierActions.js
export const UPDATE_VENDOR_DATA = 'UPDATE_VENDOR_DATA';

export const fetchVendorData = (data) => ({
    type: UPDATE_VENDOR_DATA,
    payload: data
});
// actions/lpsRatingActions.js
export const UPDATE_LPS_RATING_DATA = 'UPDATE_LPS_RATING_DATA';

export const fetchLPSRatingData = (data) => ({
    type: UPDATE_LPS_RATING_DATA,
    payload: data
});

// action/approvallisitng.js
export const APPROVAL_LISITNG = 'APPROVAL_LISITNG';
export const getApprovalList = (data) => ({
    type: APPROVAL_LISITNG,
    payload: data
})

