import {
    API_REQUEST,
    CREATE_SUPPLIER_SUCCESS,
    CREATE_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATALIST_SUCCESS,
    GET_SUPPLIER_FAILURE,
    GET_SUPPLIER_DATA_SUCCESS,
    GET_RADIO_SUPPLIER_TYPE_SUCCESS,
    GET_VENDOR_TYPE_SELECTLIST_SUCCESS,
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
            return {
                ...state,
                loading: false,
                error: true,
                supplierDetail: action.payload
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
        default:
            return state;
    }
}
