import {
    API_REQUEST,
    CREATE_MATERIAL_SUCCESS,
    CREATE_MATERIAL_FAILURE,
} from '../../config/constants';

const initialState = {
   
};

export default function materialReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_MATERIAL_SUCCESS:
            return {
                ...state,
                loading: false,
                error: true,
               // materialList: action.payload
            };
        case CREATE_MATERIAL_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        default:
            return state;
    }
}
