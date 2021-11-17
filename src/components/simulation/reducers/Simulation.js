import {
    API_REQUEST,
    GET_SELECTLIST_MASTERS,
    GET_SIMULATION_HISTORY,
    GET_VERIFY_SIMULATION_LIST,
    GET_COSTING_SIMULATION_LIST,
    GET_SIMULATION_APPROVAL_LIST,
    SET_SELECTED_MASTER_SIMULATION,
    GET_SELECTLIST_APPLICABILITY_HEAD,
    SET_SELECTED_TECHNOLOGY_SIMULATION,
    GET_APPROVAL_SIMULATION_COSTING_SUMMARY,
    GET_SELECTLIST_SIMULATION_TOKENS,
    SET_SELECTED_ROW_COUNT_FOR_SIMULATION_MESSAGE,
} from '../../../config/constants';

const initialState = {

};

export default function SimulationReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_SELECTLIST_MASTERS:
            return {
                ...state,
                loading: false,
                masterSelectList: action.payload
            }
        case GET_VERIFY_SIMULATION_LIST:
            return {
                ...state,
                loading: false,
                simulationVerifyList: action.payload
            }
        case GET_COSTING_SIMULATION_LIST:
            return {
                ...state,
                loading: false,
                costingSimulationList: action.payload
            }
        case GET_SIMULATION_APPROVAL_LIST:
            return {
                ...state,
                loading: false,
                simualtionApprovalList: action.payload
            }
        case SET_SELECTED_MASTER_SIMULATION:
            return {
                ...state,
                loading: false,
                selectedMasterForSimulation: action.payload
            }
        case GET_SELECTLIST_APPLICABILITY_HEAD:
            return {
                ...state,
                loading: false,
                applicabilityHeadListSimulation: action.payload
            }
        case SET_SELECTED_TECHNOLOGY_SIMULATION:
            return {
                ...state,
                loading: false,
                selectedTechnologyForSimulation: action.payload
            }
        case GET_APPROVAL_SIMULATION_COSTING_SUMMARY:
            return {
                ...state,
                loading: false,
                approvalSimulatedCostingSummary: action.payload
            }

        case GET_SELECTLIST_SIMULATION_TOKENS:
            return {
                ...state,
                loading: false,
                TokensList: action.payload
            }

        case SET_SELECTED_ROW_COUNT_FOR_SIMULATION_MESSAGE:
            return {
                ...state,
                loading: false,
                selectedRowCountForSimulationMessage: action.payload
            }



        default:
            return state;
    }
}
