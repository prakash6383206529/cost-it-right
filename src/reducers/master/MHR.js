import {
    API_REQUEST,
    API_FAILURE,
    CREATE_SUCCESS,
    CREATE_FAILURE,
    GET_MHR_DATA_SUCCESS,
    GET_DEPRICIATION_SUCCESS,
    GET_DEPRECIATION_DATA_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function MHRReducer(state = initialState, action) {
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
        // case CREATE_REQUEST:
        //     return {
        //         ...state,
        //         loading: false
        //     };
        case GET_MHR_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                mhrMasterList: action.payload
            };
        case CREATE_SUCCESS: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case CREATE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_DEPRICIATION_SUCCESS:
            return {
                ...state,
                loading: false,
                depreciationDataList: action.payload
            };
        case GET_DEPRECIATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                depreciationData: action.payload
            };
        default:
            return state;
    }
}
