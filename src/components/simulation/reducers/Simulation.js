import {
    API_REQUEST, GET_SELECTLIST_MASTERS, GET_SIMULATION_HISTORY,
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
        default:
            return state;
    }
}
