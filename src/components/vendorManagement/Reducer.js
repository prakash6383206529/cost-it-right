import { APPROVAL_LISTING, UPDATE_LPS_RATING_DATA, UPDATE_VENDOR_DATA, UPDATE_VENDOR_DETAIL_DATA, VENDOR_DETAIL_DATA } from './Action';

const initialState = {
    vendorData: [],
    lpsRatingData: [],
    approvalListing: [] // Corrected the variable name
    // Add other initial state properties if needed
};

const vendorManagementReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_VENDOR_DATA:

            console.log('action.type: ', action.type);
            return {
                ...state,
                vendorData: action.payload
            };
        case UPDATE_LPS_RATING_DATA:
            console.log('action.type: ', action.type);

            return {
                ...state,
                lpsRatingData: action.payload
            };
        case APPROVAL_LISTING:
            console.log('action.type: ', action.type);

            return {
                ...state,
                approvalListing: action.payload
            };
        case VENDOR_DETAIL_DATA:
            console.log('action.type: ', action.type);
            return {
                ...state,
                vendorDetailData: action.payload
            }
        default:
            return state;
    }
};

export default vendorManagementReducer;