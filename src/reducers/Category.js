import axios from 'axios';
import {
    API,
    API_REQUEST,
    CREATE_CATEGORY_TYPE_SUCCESS,
    CREATE_CATEGORY_TYPE_FAILURE,
    CREATE_CATEGORY_FAILURE,
    CREATE_CATEGORY_SUCCESS,
} from '../config/constants';

const initialState = {
   
};

export default function categoryReducer(state = initialState, action) {
    switch (action.type) {
        case API_REQUEST:
            return {
                ...state,
                loading: true
            };
        case CREATE_CATEGORY_TYPE_SUCCESS:
            return {
                ...state,
                loading: false, 
                uniOfMeasurementList: action.payload
            };
        case  CREATE_CATEGORY_SUCCESS: {
            return {
                ...state,
                partData : action.payload,
                loading: false,
                error: false
            };
        }   
        case CREATE_CATEGORY_FAILURE: {
            return {
                ...state,
                loading: false,
                error: false
            };
        }
        case  CREATE_CATEGORY_TYPE_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
    
        default:
            return state;
    }
}
