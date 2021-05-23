import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    CREATE_MACHINE_TYPE_SUCCESS,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
    GET_MACHINE_DATALIST_SUCCESS,
    GET_MACHINE_DATA_SUCCESS,
    GET_MACHINE_TYPE_SELECTLIST,
    GET_PROCESSES_LIST_SUCCESS,
    GET_MACHINE_LIST_SUCCESS,
} from '../../../config/constants';

const initialState = {

};

export default function MachineReducer(state = initialState, action) {
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
        case CREATE_MACHINE_TYPE_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_MACHINE_TYPE_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                machineTypeDataList: action.payload
            };
        case GET_MACHINE_TYPE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                machineTypeData: action.payload
            };
        case GET_MACHINE_DATALIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                machineDatalist: action.payload
            };
        case GET_MACHINE_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                machineData: action.payload
            };
        case GET_MACHINE_TYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                error: true,
                machineTypeSelectList: action.payload
            };
        case GET_PROCESSES_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                processSelectList: action.payload
            };
        case GET_MACHINE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
                machineSelectList: action.payload
            };
        default:
            return state;
    }
}
