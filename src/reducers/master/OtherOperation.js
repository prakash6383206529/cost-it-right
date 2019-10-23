import {
    API_REQUEST,
    API_FAILURE,
    GET_UOM_DATA_SUCCESS,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_UOM_SUCCESS,
    GET_UOM_DATA_FAILURE,
    GET_OTHER_OPERATION_SUCCESS,
    GET_OTHER_OPERATION_FAILURE
} from '../../config/constants';

const initialState = {

};

export default function OtherOperationReducer(state = initialState, action) {
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
        case GET_OTHER_OPERATION_SUCCESS:
            return {
                ...state,
                loading: false,
                otherOperationList: action.payload
            };
        case GET_OTHER_OPERATION_FAILURE:
            return {
                ...state,
                loading: false,
                //error: true
            };
        // case GET_UOM_SUCCESS:
        //     return {
        //         ...state,
        //         loading: false, 
        //         unitOfMeasurementData: action.payload
        //     };

        // case CREATE_PART_SUCCESS: {
        //     return {
        //         ...state,
        //         loading: false,
        //         error: false
        //     };
        // }
        // case CREATE_PART_FAILURE:
        //     return {
        //         ...state,
        //         loading: false,
        //         error: true
        //     };

        default:
            return state;
    }
}
