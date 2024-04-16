import { APPROVAL_LISTING, UPDATE_APPROVAL_DATA, UPDATE_LPS_RATING_DATA, UPDATE_VENDOR_DATA, UPDATE_VENDOR_DETAIL_DATA, VENDOR_DETAIL_DATA } from './Action';

const initialState = {
    vendorData: [],
    lpsRatingData: [],
    approvalListing: [], // Corrected the variable name,
    approvalSummary: [],
    supplierDetailData: [],
    // Add other initial state properties if needed
};

const vendorManagementReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_VENDOR_DATA:


            return {
                ...state,
                vendorData: action.payload
            };
        case UPDATE_LPS_RATING_DATA:


            return {
                ...state,
                lpsRatingData: action.payload
            };
        case APPROVAL_LISTING:


            return {
                ...state,
                approvalListing: action.payload
            };
        case VENDOR_DETAIL_DATA:

            return {
                ...state,
                supplierDetailData: action.payload
            }
        case UPDATE_APPROVAL_DATA:

            return {
                ...state,
                approvalSummary: action.payload[0]
            }


        default:
            return state;
    }
};

export default vendorManagementReducer;