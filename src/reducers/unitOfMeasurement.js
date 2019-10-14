import axios from 'axios';
import {
    API,
    FETCH_MATER_DATA_FAILURE,
    FETCH_MATER_DATA_REQUEST,
    GET_UOM_DATA_SUCCESS,
    UNIT_OF_MEASUREMENT_API_FAILURE,
    CREATE_PART_REQUEST,
    CREATE_PART_FAILURE,
    CREATE_PART_SUCCESS,
    GET_ALL_PARTS_SUCCESS,
    GET_ALL_PARTS_FAILURE
} from '../config/constants';
import {
    apiErrors
} from '../helper/util';
import {
    MESSAGES
} from '../config/message';
import {
    toastr
} from 'react-redux-toastr'
const initialState = {
   
};

export default function UOMReducer(state = initialState, action) {
    switch (action.type) {
        case CREATE_PART_REQUEST:
            return {
                ...state,
                loading: true
            };
        case GET_UOM_DATA_SUCCESS:
        console.log('uniOfMeasurementList: ', action.payload);
            return {
                ...state,
                loading: true, 
                unitOfMeasurementList: action.payload
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
