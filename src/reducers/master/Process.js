import {
    API_REQUEST,
    API_FAILURE,
    CREATE_PROCESS_SUCCESS,
    CREATE_PROCESS_FAILURE,
    GET_PROCESS_LIST_SUCCESS,
    GET_PROCESS_LIST_FAILURE,
    GET_PROCESS_UNIT_DATA_SUCCESS,
    GET_INITIAL_PLANT_SELECTLIST_SUCCESS,
    GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST,
    GET_INITIAL_MACHINE_TYPE_SELECTLIST,
    GET_INITIAL_PROCESSES_LIST_SUCCESS,
    GET_INITIAL_MACHINE_LIST_SUCCESS,
    GET_MACHINE_LIST_BY_PLANT,
    GET_PLANT_LIST_BY_MACHINE,
} from '../../config/constants';

const initialState = {

};

export default function processReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_PROCESS_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_PROCESS_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_PROCESS_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                processList: action.payload,
            };
        case GET_PROCESS_UNIT_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                processUnitData: action.payload,
            };
        case GET_INITIAL_PLANT_SELECTLIST_SUCCESS:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, plants: action.payload },
            };
        case GET_PLANT_LIST_BY_MACHINE:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, plants: action.payload },
            };
        case GET_INITIAL_VENDOR_WITH_VENDOR_CODE_SELECTLIST:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, vendor: action.payload },
            };
        case GET_INITIAL_MACHINE_TYPE_SELECTLIST:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, machineTypes: action.payload },
            };
        case GET_INITIAL_MACHINE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, machine: action.payload },
            };
        case GET_MACHINE_LIST_BY_PLANT:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, machine: action.payload },
            };
        case GET_INITIAL_PROCESSES_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                filterSelectList: { ...state.filterSelectList, processList: action.payload },
            };
        case GET_PROCESS_LIST_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        default:
            return state;
    }
}
