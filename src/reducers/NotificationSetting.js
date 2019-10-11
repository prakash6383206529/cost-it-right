import {
    NOTIFICATION_DATA_REQUEST,
    NOTIFICATION_DATA_FAILURE,
    GET_NOTIFICATION_DATA_SUCCESS,
    UPDATE_NOTIFICATION_DATA_SUCCESS
} from '../config/constants';

const initialState = {
    error: false,
    loading: false,
};

export default function notificationSettingReducer(state = initialState, action) {
    switch (action.type) {
        case NOTIFICATION_DATA_REQUEST:
            return {
                ...state,
                loading: true
            };
        case NOTIFICATION_DATA_FAILURE:
            return {
                ...state,
                loading: false,
                error: true
            };
        case GET_NOTIFICATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: '',
                notificationSettingData: action.payload
            }
        case UPDATE_NOTIFICATION_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                error: '',
            }
        default:
            return state;
    }
}
