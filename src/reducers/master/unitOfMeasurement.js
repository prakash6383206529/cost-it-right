import {
    API_REQUEST,
    API_FAILURE,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_UOM_SUCCESS,
    GET_UOM_DATA_FAILURE
} from '../../config/constants';

const initialState = {
   
};

export default function UOMReducer(state = initialState, action) {
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
        case CREATE_PART_REQUEST:
            return {
                ...state,
                loading: false
            };
        case GET_UOM_DATA_SUCCESS:
            return {
                ...state,
                loading: false, 
                unitOfMeasurementList: action.payload
            };
        case GET_UOM_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_UOM_SUCCESS:
            return {
                ...state,
                loading: false, 
                unitOfMeasurementData: action.payload
            };
            
        case CREATE_PART_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_PART_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
    
        default:
            return state;
    }
}
