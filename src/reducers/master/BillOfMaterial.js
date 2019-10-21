import {
    API_REQUEST,
    CREATE_BOM_SUCCESS,
    CREATE_BOM_FAILURE
} from '../../config/constants';

const initialState = {
   
};

export default function BOMReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_BOM_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
            };
        case CREATE_BOM_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
