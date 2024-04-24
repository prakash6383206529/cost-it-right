import { LPS_RATING_DATA, UPDATE_LPS_RATING_STATUS, UPDATE_VENDOR_CLASSIFICATION_STATUS, VENDOR_CLASSIFICATION_DATA } from '../../config/constants';
import { APPROVAL_LISTING, UPDATE_APPROVAL_DATA, VENDOR_DETAIL_DATA } from './Action';

const initialState = {
    vendorData: [],
    lpsRatingData: [],
    approvalListing: [], // Corrected the variable name,
    approvalSummary: [],
    supplierDetailData: [],
    // Add other initial state properties if needed
};

const supplierManagementReducer = (state = initialState, action) => {
    switch (action.type) {
        case VENDOR_CLASSIFICATION_DATA:

            return {
                ...state,
                vendorData: action.payload.DataList
            };
        case LPS_RATING_DATA:

            return {
                ...state,
                lpsRatingData: action.payload.DataList
            };
        case UPDATE_VENDOR_CLASSIFICATION_STATUS:

            return {
                ...state,
                classificationData: action.payload
            }
        case UPDATE_LPS_RATING_STATUS:

            return {
                ...state,
                lpsRatingData: action.payload
            }
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

export default supplierManagementReducer;