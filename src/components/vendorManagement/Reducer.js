import { DETAILS_FOR_DEVIATION_APPROVAL, LPS_RATING_DATA, MONTHS, UPDATE_LPS_RATING_STATUS, UPDATE_VENDOR_CLASSIFICATION_STATUS, VENDOR_CLASSIFICATION_DATA, VENDOR_DATA, VENDOR_PLANT_DATA } from '../../config/constants';
import { UPDATE_APPROVAL_DATA, VENDOR_DETAIL_DATA } from './Action';

const initialState = {
    vendorData: [],
    supplierData: [],
    vendorPlantData: [],
    lpsRatingData: [],
    deviationData: [],
    approvalListing: [], // Corrected the variable name,
    approvalSummary: [],
    supplierDetailData: [],
    // Add other initial state properties if needed
};

const supplierManagementReducer = (state = initialState, action) => {
    switch (action?.type) {
        case VENDOR_CLASSIFICATION_DATA:

            return {
                ...state,
                vendorData: action?.payload?.DataList || []
            };
        case LPS_RATING_DATA:

            return {
                ...state,
                lpsRatingData: action?.payload?.DataList || []
            };
        case UPDATE_VENDOR_CLASSIFICATION_STATUS:

            return {
                ...state,
                classificationData: action?.payload || []
            }
        case UPDATE_LPS_RATING_STATUS:

            return {
                ...state,
                lpsRatingData: action?.payload || []
            }
        case VENDOR_DATA:
            return {
                ...state,
                supplierData: action?.payload?.SelectList || []
            }
        case VENDOR_PLANT_DATA:
            return {
                ...state,
                vendorPlantData: action?.payload?.SelectList || []
            }
        case DETAILS_FOR_DEVIATION_APPROVAL:

            return {
                ...state,
                deviationData: action?.payload?.DataList[0]
            };
        case MONTHS:

            return {
                ...state,
                months: action?.payload?.SelectList || []
            }
        case UPDATE_APPROVAL_DATA:

            return {
                ...state,
                approvalSummary: action?.payload[0]
            }


        default:
            return state;
    }
};

export default supplierManagementReducer;