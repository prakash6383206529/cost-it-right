import { APPROVAL_LISITNG, UPDATE_LPS_RATING_DATA, UPDATE_VENDOR_DATA } from './Action';
import data from './data.json';

const initialState = {
    vendorData: [],
    lpsRatingData: [],
    approvalLisitng: []
    // Add other initial state properties if needed
};

const vendorManagementReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_VENDOR_DATA:

            return {
                ...state,
                vendorData: data.vendorData
            };
        case UPDATE_LPS_RATING_DATA:


            return {
                ...state,
                lpsRatingData: data.lpsRatingData
            };
        case APPROVAL_LISITNG:
            console.log('data.approvalLisitng: ', data);
            return {
                ...state,
                approvalLisitng: data.approvalLisitng
            }
        default:
            return state;
    }
};

export default vendorManagementReducer;
