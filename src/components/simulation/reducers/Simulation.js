import {
    API_REQUEST,
    GET_SELECTLIST_MASTERS,
    GET_VERIFY_SIMULATION_LIST,
    GET_COSTING_SIMULATION_LIST,
    GET_SIMULATION_APPROVAL_LIST,
    SET_SELECTED_MASTER_SIMULATION,
    GET_SELECTLIST_APPLICABILITY_HEAD,
    SET_SELECTED_TECHNOLOGY_SIMULATION,
    GET_APPROVAL_SIMULATION_COSTING_SUMMARY,
    GET_AMMENDENT_STATUS_COSTING,
    SET_ATTACHMENT_FILE_DATA,
    GET_COMBINED_PROCESS_LIST,
    GET_SELECTLIST_SIMULATION_TOKENS,
    GET_FG_WISE_IMPACT_DATA,
    GET_ASSEMBLY_SIMULATION_LIST,
    SET_DATA_TEMP,
    GET_ASSEMBLY_SIMULATION_LIST_SUMMARY,
    SET_SHOW_SIMULATION_PAGE,
    GET_TOKEN_SELECT_LIST,
    GET_VALUE_TO_SHOW_COSTING_SIMULATION,
    GET_KEYS_FOR_DOWNLOAD_SUMMARY,
    SET_TOKEN_CHECK_BOX,
    SET_TOKEN_FOR_SIMULATION,
    GET_MASTER_SELECT_LIST_SIMUALTION,
    SET_SELECTED_ROW_FOR_PAGINATION,
    GET_SIMULATION_APPROVAL_LIST_DRAFT,
    SET_SELECTED_VENDOR_SIMULATION,
    GET_ALL_MULTI_TECHNOLOGY_COSTING,
    SET_BOP_ASSOCIATION,
    SET_SIMULATION_APPLICABILITY,
    SET_EXCHANGE_RATE_LIST_BEFORE_DRAFT,
    SET_SELECTED_CUSTOMER_SIMULATION,
    GET_SELECTLIST_COSTING_HEADS,
    GET_RM_INDEXATION_SIMULATION_LIST,
    GET_INDEXED_RM_FOR_SIMULATION,
    GET_SIMULATED_RAW_MATERIAL_SUMMARY,
    GET_RM_INDEXATION_COSTING_SIMULATION_LIST
} from '../../../config/constants';
import { tokenStatus, tokenStatusName } from '../../../config/masterData';
import { showBopLabel, updateBOPValues } from '../../../helper';

const initialState = {
    selectedRowForPagination: [],
    costingSimulationList: [],
    keysForDownloadSummary: {},
    indexedRMForSimulation: []
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
                if (item.Status === 'Draft' || item.Status === 'Linked' || item.Status === 'Rejected') {
                    item.ProvisionalStatus = 'Y' // THIS KEY IS FOR DISLAYING AMMENDEMNT STATUS COLUMN
                }
                else if (item.Status === 'POUpdated') {
                    item.ProvisionalStatus = 'R'
                } else {
                    // THIS IS FOR PENDINGFORAPPROVAL, AWAITINGFORAPPROVAL, PUSHED, APPROVED, ERROR
                    item.ProvisionalStatus = 'U'
                }
                return null;
            })

            return {
                ...state,
                loading: false,
                simualtionApprovalList: action.payload
            }
        case GET_SIMULATION_APPROVAL_LIST_DRAFT:

            action.payload && action.payload.map(item => {            //if status is draft then we have to show 'Y' in amendment status column & similarly for approved & other.
                if (item.Status === 'Draft' || item.Status === 'Linked' || item.Status === 'Rejected') {
                    item.ProvisionalStatus = 'Y' // THIS KEY IS FOR DISLAYING AMMENDEMNT STATUS COLUMN
                }
                else if (item.Status === 'POUpdated') {
                    item.ProvisionalStatus = 'R'
                } else {
                    // THIS IS FOR PENDINGFORAPPROVAL, AWAITINGFORAPPROVAL, PUSHED, APPROVED, ERROR
                    item.ProvisionalStatus = 'U'
                }
                switch (item.Status) {
                    case tokenStatusName.AWAITING_FOR_APPROVAL:
                        item.TooltipText = tokenStatus.AwaitingForApproval;
                        break;
                    case tokenStatusName.PENDING_FOR_APPROVAL:
                        item.TooltipText = tokenStatus.PendingForApproval;
                        break;
                    case tokenStatusName.DRAFT:
                        item.TooltipText = tokenStatus.Draft;
                        break;
                    case tokenStatusName.APPROVED:
                        item.TooltipText = tokenStatus.Approved;
                        break;
                    case tokenStatusName.REJECTED:
                        item.TooltipText = tokenStatus.Rejected;
                        break;
                    case tokenStatusName.PUSHED:
                        item.TooltipText = tokenStatus.Pushed;
                        break;
                    case tokenStatusName.ERROR:
                        item.TooltipText = tokenStatus.Error;
                        break;
                    case tokenStatusName.HISTORY:
                        item.TooltipText = tokenStatus.History;
                        break;
                    case tokenStatusName.LINKED:
                        item.TooltipText = tokenStatus.Linked;
                        break;
                    case tokenStatusName.PROVISIONAL:
                        item.TooltipText = tokenStatus.Provisional;
                        break;
                    case tokenStatusName.POUPDATED:
                        item.TooltipText = tokenStatus.POUpdated;
                        break;
                    default:
                        break;
                }
                return null;

            })

            return {
                ...state,
                loading: false,
                simualtionApprovalListDraft: action.payload
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
                applicabilityHeadListSimulation: updateBOPValues(action.payload, [], showBopLabel(), 'Text')?.updatedLabels
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
        case SET_ATTACHMENT_FILE_DATA:
            const data = action.payload
            return {
                ...state,
                loading: false,
                attachmentsData: [...data]
            }
        case GET_COMBINED_PROCESS_LIST:
            return {
                ...state,
                loading: false,
                combinedProcessList: action.payload
            }
        case GET_SELECTLIST_SIMULATION_TOKENS:
            return {
                ...state,
                loading: false,
                TokensList: action.payload
            }
        case GET_FG_WISE_IMPACT_DATA:
            return {
                ...state,
                loading: false,
                impactData: action.payload
            }
        case SET_SELECTED_VENDOR_SIMULATION:
            return {
                ...state,
                loading: false,
                selectedVendorForSimulation: action.payload
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
        case GET_VALUE_TO_SHOW_COSTING_SIMULATION:
            return {
                ...state,
                loading: false,
                costingSimulationListAllKeys: action.payload
            }
        case GET_KEYS_FOR_DOWNLOAD_SUMMARY:
            return {
                ...state,
                loading: false,
                keysForDownloadSummary: action.payload
            }
        case SET_TOKEN_CHECK_BOX:
            return {
                ...state,
                loading: false,
                tokenCheckBoxValue: action.payload
            }
        case SET_TOKEN_FOR_SIMULATION:
            return {
                ...state,
                loading: false,
                tokenForSimulation: action.payload
            }
        case GET_AMMENDENT_STATUS_COSTING:                     //THIS CODE NOT WORKING IT WILL USE IN FUTURE *****FOR GETTING AMMENDMENT STATUS AS RE AND MINDA
            return {
                ...state,
                loading: false,
                ammendentStatus: action.payload
            }
        case GET_MASTER_SELECT_LIST_SIMUALTION:                     //THIS CODE IS FOR SELECTING MASTER LIST IN SIMULATION
            return {
                ...state,
                loading: false,
                masterSelectListSimulation: action.payload
            }
        case SET_SELECTED_ROW_FOR_PAGINATION:
            return {
                ...state,
                loading: false,
                selectedRowForPagination: action.payload
            }
        case GET_ALL_MULTI_TECHNOLOGY_COSTING:
            return {
                ...state,
                loading: false,
                multiTechnologyCostinig: action.payload
            }
        case SET_BOP_ASSOCIATION:
            return {
                ...state,
                loading: false,
                isMasterAssociatedWithCosting: action.payload
            }
        case SET_SIMULATION_APPLICABILITY:
            return {
                ...state,
                loading: false,
                simulationApplicability: action.payload
            }
        case SET_EXCHANGE_RATE_LIST_BEFORE_DRAFT:
            return {
                ...state,
                loading: false,
                exchangeRateListBeforeDraft: action.payload
            }
        case SET_SELECTED_CUSTOMER_SIMULATION:
            return {
                ...state,
                loading: false,
                selectedCustomerSimulation: action.payload
            }
        case GET_SELECTLIST_COSTING_HEADS:
            return {
                ...state,
                loading: false,
                selectListCostingHead: action.payload
            }
        case GET_RM_INDEXATION_SIMULATION_LIST:
            return {
                ...state,
                loading: false,
                rmIndexationSimulationList: action.payload
            }
        case GET_INDEXED_RM_FOR_SIMULATION:
            return {
                ...state,
                loading: false,
                indexedRMForSimulation: action.payload
            }
        case GET_SIMULATED_RAW_MATERIAL_SUMMARY:
            return {
                ...state,
                loading: false,
                simulatedRawMaterialSummary: action.payload
            }
        case GET_RM_INDEXATION_COSTING_SIMULATION_LIST:
            return {
                ...state,
                loading: false,
                rmIndexationCostingSimulationList: action.payload
            }
        default:
            return state;
    }
}
