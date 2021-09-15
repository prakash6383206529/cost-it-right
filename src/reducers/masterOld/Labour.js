import {
    API_REQUEST,
    CREATE_LABOUR_SUCCESS,
    CREATE_LABOUR_FAILURE,
    GET_LABOUR_SUCCESS,
    GET_LABOUR_FAILURE,
    GET_LABOUR_DATA_SUCCESS,
    LABOUR_TYPE_VENDOR_SELECTLIST,
    GET_LABOUR_TYPE_BY_PLANT_SELECTLIST,
    GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST,
} from '../../config/constants';

const initialState = {

};

export default function labourReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_LABOUR_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_LABOUR_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_LABOUR_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                labourDetail: action.payload
            };
        case GET_LABOUR_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_LABOUR_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                labourData: action.payload
            };
        case LABOUR_TYPE_VENDOR_SELECTLIST:
            return {
                ...state,
                loading: false,
                VendorLabourTypeSelectList: action.payload
            };
        case GET_LABOUR_TYPE_BY_PLANT_SELECTLIST:
            return {
                ...state,
                loading: false,
                labourTypeByPlantSelectList: action.payload
            };
        case GET_LABOUR_TYPE_BY_MACHINE_TYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                labourTypeByMachineTypeSelectList: action.payload
            };
        default:
            return state;
    }
}
