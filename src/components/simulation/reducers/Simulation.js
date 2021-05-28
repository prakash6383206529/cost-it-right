import {
    API_REQUEST, GET_SELECTLIST_MASTERS, GET_SIMULATION_HISTORY, GET_VERIFY_SIMULATION_LIST, GET_COSTING_SIMULATION_LIST, GET_SIMULATION_APPROVAL_LIST
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
        default:
            return state;
    }
}
