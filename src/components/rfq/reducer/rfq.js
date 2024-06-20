import { CHECK_RFQ_BULK_UPLOAD, GET_ASSEMBLY_CHILD_PART, GET_NFR_SELECT_LIST, GET_PART_IDENTITY, GET_RFQ_PART_DETAILS, GET_RFQ_VENDOR_DETAIL, GET_TARGET_PRICE, SELECTED_ROW_ARRAY, SET_QUOTATION_ID_FOR_RFQ } from "../../../config/constants";

const initialState = {
    checkRFQPartBulkUpload: [],
    selectedRowRFQ: [],
    getPartIndentity: 0
};

export default function RFQReducer(state = initialState, action) {
    switch (action.type) {
        case CHECK_RFQ_BULK_UPLOAD:
            return {
                ...state,
                loading: true,
                checkRFQPartBulkUpload: action.payload
            };
        case SELECTED_ROW_ARRAY:
            return {
                ...state,
                loading: true,
                selectedRowRFQ: action.payload
            };
        case SET_QUOTATION_ID_FOR_RFQ:
            return {
                ...state,
                loading: false,
                quotationIDForRFQ: action.payload,
            }
        case GET_NFR_SELECT_LIST:
            return {
                ...state,
                loading: false,
                nfrSelectList: action.payload,
            }
        case GET_RFQ_VENDOR_DETAIL:
            return {
                ...state,
                loading: false,
                getRfqVendorDetail: action.payload,
            }
        case GET_TARGET_PRICE:
            return {
                ...state,
                loading: false,
                getTargetprice: action.payload,
            }
        case GET_ASSEMBLY_CHILD_PART:
            return {
                ...state,
                loading: false,
                getChildParts: action.payload,
            }
        case GET_RFQ_PART_DETAILS:
            return {
                ...state,
                loading: false,
                getRfqPartDetails: action.payload,
            }

        case GET_PART_IDENTITY:
            return {
                ...state,
                loading: false,
                getPartIndentity: action.payload,
            }
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