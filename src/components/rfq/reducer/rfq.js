import { BEST_COSTING_DATA, CHECK_RFQ_BULK_UPLOAD, GET_ASSEMBLY_CHILD_PART, GET_BOP_PR_QUOTATION_DETAILS, GET_NFR_SELECT_LIST, GET_PART_IDENTITY, GET_QUOTATION_DETAILS_LIST, GET_QUOTATION_ID_FOR_RFQ, GET_QUOTATION_LIST, GET_RFQ_PART_DETAILS, GET_RFQ_RAISE_NUMBER, GET_RFQ_TOOLING_DETAILS, GET_RFQ_VENDOR_DETAIL, GET_TARGET_PRICE, SELECTED_ROW_ARRAY, SELECT_BOP_CATEGORY, SELECT_BOP_NUMBER, SELECT_PURCHASE_REQUISITION, SET_BOP_PR_QUOTATION_IDENTITY, SET_BOP_SPECIFIC_ROW_DATA, SET_QUOTATION_ID_FOR_RFQ, SET_RM_SPECIFIC_ROW_DATA, SET_TOOLING_SPECIFIC_ROW_DATA } from "../../../config/constants";

const initialState = {
    checkRFQPartBulkUpload: [],
    selectedRowRFQ: [],
    quotationDetailsList: [],
    getPartIndentity: 0,
    getQuotationIdForRFQ: "",
    rmSpecificRowData: [],
    SelectBopNumber: [],
    SelectBopCategory: [],
    bopSpecificRowData: [],
    getBopPrQuotationDetails: [],
    getBopPrQuotationIdentity: "",
    getRfqToolingData: [],
    getTargetprice: {},
    toolingSpecificRowData: [],
    bestCostingData: [],
    quotationIDForRFQ: ""
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
        case GET_QUOTATION_ID_FOR_RFQ:
            return {
                ...state,
                loading: false,
                getQuotationIdForRFQ: action.payload,
            }
        case GET_QUOTATION_DETAILS_LIST:
            return {
                ...state,
                loading: false,
                quotationDetailsList: action.payload,
            }
        case SET_RM_SPECIFIC_ROW_DATA:

            return {
                ...state,
                loading: false,
                rmSpecificRowData: action.payload,
            }
        case SELECT_PURCHASE_REQUISITION:

            return {
                ...state,
                loading: false,
                SelectPurchaseRequisition: action.payload,
            }
        case SELECT_BOP_NUMBER:

            return {
                ...state,
                loading: false,
                SelectBopNumber: action.payload,
            }
        case SELECT_BOP_CATEGORY:

            return {
                ...state,
                loading: false,
                SelectBopCategory: action?.payload || [],
            }
        case SET_BOP_SPECIFIC_ROW_DATA:

            return {
                ...state,
                loading: false,
                bopSpecificRowData: action.payload,
            }
        case GET_BOP_PR_QUOTATION_DETAILS:

            return {
                ...state,
                loading: false,
                getBopPrQuotationDetails: action.payload,
            }
        case SET_BOP_PR_QUOTATION_IDENTITY:

            return {
                ...state,
                loading: false,
                getBopPrQuotationIdentity: action.payload,
            }

        case SET_TOOLING_SPECIFIC_ROW_DATA:

            return {
                ...state,
                loading: false,
                toolingSpecificRowData: action.payload,
            }
        case GET_QUOTATION_LIST:
            return {
                ...state,
                loading: false,
                quotationList: action.payload,
            }
        case BEST_COSTING_DATA:
            return {
                ...state,
                loading: false,
                bestCostingData: action.payload,
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