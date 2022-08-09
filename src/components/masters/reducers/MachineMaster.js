import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    CREATE_MACHINE_TYPE_SUCCESS,
    GET_MACHINE_TYPE_DATALIST_SUCCESS,
    GET_MACHINE_TYPE_DATA_SUCCESS,
    GET_MACHINE_DATALIST_SUCCESS,
    GET_ALL_MACHINE_DATALIST_SUCCESS,
    GET_MACHINE_DATA_SUCCESS,
    GET_MACHINE_TYPE_SELECTLIST,
    GET_PROCESSES_LIST_SUCCESS,
    GET_MACHINE_LIST_SUCCESS,
    GET_MACHINE_APPROVAL_LIST,
    SET_PROCESS_GROUP_FOR_API,
    SET_PROCESS_GROUP_LIST,
    STORE_PROCESS_LIST,
} from '../../../config/constants';

const initialState = {
    processGroupApiData: [],
    processIdList: [],
    machineDatalist: []
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
            let arr = []
            action.payload && action.payload.map((item) => {
                item.CostingHeadNew = item.CostingHead === 'VBC' || item.CostingHead === "Vendor Based" ? "Vendor Based" : "Zero Based"
                arr.push(item)
            })
            return {
                ...state,
                loading: false,
                error: true,
                machineDatalist: arr
            };
        case GET_ALL_MACHINE_DATALIST_SUCCESS:
            let arry = []
            action.payload && action.payload.map((item) => {
                item.CostingHeadNew = item.CostingHead === 'VBC' || item.CostingHead === "Vendor Based" ? "Vendor Based" : "Zero Based"
                arry.push(item)
            })
            return {
                ...state,
                loading: false,
                error: true,
                allMachineDataList: arry
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
        case GET_MACHINE_APPROVAL_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                machineApprovalList: action.payload
            };
        case SET_PROCESS_GROUP_FOR_API:
            return {
                ...state,
                processGroupApiData: action.payload
            }
        case SET_PROCESS_GROUP_LIST:
            return {
                ...state,
                processGroupList: action.payload
            }
        case STORE_PROCESS_LIST:
            return {
                ...state,
                processIdList: action.payload
            }
        default:
            return state;
    }
}


