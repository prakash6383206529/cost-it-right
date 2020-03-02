import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    CREATE_MACHINE_TYPE_SUCCESS,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
} from '../../config/constants';

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
        default:
            return state;
    }
}
