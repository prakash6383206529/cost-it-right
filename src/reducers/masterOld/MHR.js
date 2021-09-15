import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_MHR_DATALIST_SUCCESS,
    GET_MHR_DATA_SUCCESS,
    GET_DEPRICIATION_SUCCESS,
    GET_DEPRECIATION_DATA_SUCCESS,
    GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS,
    GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function MHRReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case API_FAILURE:
            return {
                ...state,
                loading: false
            };
        case GET_MHR_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                mhrMasterList: action.payload
            };
        case GET_MHR_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                mhrData: action.payload
            };
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_DEPRICIATION_SUCCESS:
            return {
                ...state,
                loading: false,
                depreciationDataList: action.payload
            };
        case GET_DEPRECIATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                depreciationData: action.payload
            };
        case GET_LABOUR_SELECTLIST_BY_MACHINE_SUCCESS:
            return {
                ...state,
                loading: false,
                LabourDatalistByMachine: action.payload
            };
        case GET_SUPPLIER_TYPE_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                supplierTypeList: action.payload
            };
        default:
            return state;
    }
}
