import {
    API_REQUEST,
    API_FAILURE,
    GET_VOLUME_DATA_SUCCESS,
} from '../../config/constants';

const initialState = {

};

export default function VolumeReducer(state = initialState, action) {
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
        case GET_VOLUME_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                volumeData: action.payload
            };
        default:
            return state;
    }
}
