import {
    API_REQUEST, GET_SIMULATION_HISTORY,
} from '../../../config/constants';

const initialState = {

};

export default function SimulationHistoryReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_SIMULATION_HISTORY:
            return {
                ...state,
                loading: false,
                simulationHistory: action.payload
            }

        default:
            return state;
    }
}
