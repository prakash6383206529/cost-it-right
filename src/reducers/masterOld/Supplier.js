import {
    API_REQUEST,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATALIST_SUCCESS,
    GET_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATA_SUCCESS,
    GET_RADIO_SUPPLIER_TYPE_SUCCESS,
    GET_VENDOR_TYPE_SELECTLIST_SUCCESS,
    GET_ALL_VENDOR_SELECTLIST_SUCCESS,
    GET_VENDOR_TYPE_SELECTLIST_BY_VENDOR,
    GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
    GET_VENDOR_TYPE_BOP_SELECTLIST,
} from '../../config/constants';

const initialState = {

};

export default function supplierReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_SUPPLIER_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_SUPPLIER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_SUPPLIER_DATALIST_SUCCESS:
            let arr = []
            arr = action.payload?.filter((el, i) => {
                if (!el) return false;
                el.status = el.IsActive
                if (el.status === true) {
                    el.status = 'Active'
                } else if (el.status === false) {
                    el.status = 'In Active'
                }
                return true
            }) || []
            return {
                ...state,
                loading: false,
                error: true,
                supplierDataList: arr
            };
        case GET_SUPPLIER_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_SUPPLIER_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                supplierData: action.payload
            };
        case GET_RADIO_SUPPLIER_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                radioSupplierTypeList: action.payload
            };
        case GET_VENDOR_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                vendorTypeList: action.payload
            };
        case GET_ALL_VENDOR_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                vendorSelectList: action.payload
            };
        case GET_VENDOR_TYPE_SELECTLIST_BY_VENDOR:
            return {
                ...state,
                loading: false,
                error: true,
                vendorTypeByVendorSelectList: action.payload
            };
        case GET_VENDOR_WITH_VENDOR_CODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                vendorWithVendorCodeSelectList: action.payload
            };
        case GET_VENDOR_TYPE_BOP_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                vendorWithVendorCodeSelectList: action.payload
            };
        default:
            return state;
    }
}
