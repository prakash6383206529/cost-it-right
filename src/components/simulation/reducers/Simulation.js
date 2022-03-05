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
    GET_AMMENDENT_STATUS_COSTING,
    GET_SELECTLIST_SIMULATION_TOKENS,
    GET_ASSEMBLY_SIMULATION_LIST,
    SET_DATA_TEMP,
    GET_ASSEMBLY_SIMULATION_LIST_SUMMARY,
    SET_SHOW_SIMULATION_PAGE,
    GET_TOKEN_SELECT_LIST,
    GET_COLUMN_SHOWING_VALUE_COSTINGSIMULATION,
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

            action.payload && action.payload.map(item => {            //if status is draft then we have to show 'Y' in amendment status column & similarly for approved & other.
                if (item.Status === 'Draft') {
                    item.ProvisionalStatus = 'Y' // THIS KEY IS FOR DISLAYING AMMENDEMNT STATUS COLUMN
                }
                else if (item.Status === 'Approved') {
                    item.ProvisionalStatus = 'R'
                } else {
                    item.ProvisionalStatus = 'U'
                }
                return null;

            })

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

        case GET_AMMENDENT_STATUS_COSTING:
            return {
                ...state,
                loading: false,
                ammendentStatus: action.payload
            }
        case GET_SELECTLIST_SIMULATION_TOKENS:
            return {
                ...state,
                loading: false,
                TokensList: action.payload
            }
        case GET_ASSEMBLY_SIMULATION_LIST:
            return {
                ...state,
                loading: false,
                simulationAssemblyList: action.payload
            }
        case GET_ASSEMBLY_SIMULATION_LIST_SUMMARY:
            return {
                ...state,
                loading: false,
                simulationAssemblyListSummary: action.payload
            }

        case SET_DATA_TEMP:
            return {
                ...state,
                loading: false,
                valdataTemp: action.payload
            }
        case SET_SHOW_SIMULATION_PAGE:
            return {
                ...state,
                loading: false,
                getShowSimulationPage: action.payload
            };
        case GET_TOKEN_SELECT_LIST:
            return {
                ...state,
                loading: false,
                error: true,
                getTokenSelectList: action.payload
            };
        case GET_COLUMN_SHOWING_VALUE_COSTINGSIMULATION:
            return {
                ...state,
                loading: false,
                costingSimulationListALLKEYS: action.payload
            }

        default:
            return state;
    }
}

