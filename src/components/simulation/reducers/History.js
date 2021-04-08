import {
    API_REQUEST,
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

        default:
            return state;
    }
}
