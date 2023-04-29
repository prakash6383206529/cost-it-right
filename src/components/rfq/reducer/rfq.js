import { CHECK_RFQ_BULK_UPLOAD } from "../../../config/constants";

const initialState = {
    checkRFQPartBulkUpload: []
};

export default function RFQReducer(state = initialState, action) {
    switch (action.type) {
        case CHECK_RFQ_BULK_UPLOAD:
            return {
                ...state,
                loading: true,
                checkRFQPartBulkUpload: action.payload
            };

        default:
            return state;
    }
}

export function setRFQBulkUpload(data) {
    return (dispatch) => {
        dispatch({
            type: CHECK_RFQ_BULK_UPLOAD,
            payload: data
        })
    };
}